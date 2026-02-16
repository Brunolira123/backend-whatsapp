const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { pool } = require('../database/postgres');
const { redisClient, QUEUES } = require('../database/redis');
const questionarioService = require('./questionarioService');

class WhatsAppService {
    constructor(io) {
        this.client = null;
        this.io = io;
        this.sessoesAtivas = new Map();
        this.status = 'disconnected';
    }

    async initialize() {
        try {
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: process.env.SESSION_PATH
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--disable-gpu'
                    ]
                }
            });

            this.setupEventListeners();
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Erro ao inicializar WhatsApp:', error);
            throw error;
        }
    }

    setupEventListeners() {
        this.client.on('qr', (qr) => {
            console.log('📱 Escaneie o QR Code abaixo:');
            qrcode.generate(qr, { small: true });
            this.status = 'qr_received';
            this.emitirStatus('qr', { qr });
        });

        this.client.on('ready', () => {
            console.log('✅ WhatsApp conectado com sucesso!');
            this.status = 'connected';
            this.emitirStatus('connected');
        });

        this.client.on('disconnected', (reason) => {
            console.log('❌ WhatsApp desconectado:', reason);
            this.status = 'disconnected';
            this.emitirStatus('disconnected', { reason });
        });

        this.client.on('message', this.handleMessage.bind(this));
        this.client.on('message_ack', this.handleMessageAck.bind(this));
    }

  async handleMessage(message) {
    try {
        const from = message.from;
        const body = message.body;

        // LISTA NEGRA DE TIPOS DE MENSAGEM PARA IGNORAR
        const tiposIgnorar = [
            '@g.us',        // Grupos
            '@newsletter',  // Newsletters
            '@broadcast',   // Transmissões
            '@lid',         // LinkedIn? (só pra garantir)
        ];

        // Verificar se é um tipo que devemos ignorar
        const deveIgnorar = tiposIgnorar.some(tipo => from.includes(tipo));
        
        if (deveIgnorar) {
            console.log(`📢 Mensagem ignorada (${from.split('@')[1]}): ${body.substring(0, 30)}...`);
            return;
        }

        // Ignorar status
        if (message.isStatus) {
            console.log('📢 Status ignorado');
            return;
        }

        console.log(`📨 Mensagem de ${from}: ${body.substring(0, 50)}...`);

        // Buscar atendimento ativo
        let atendimento = await this.getAtendimentoAtivo(from);
        
        if (!atendimento) {
            atendimento = await this.criarAtendimento(from, message);
        } else {
            await this.atualizarUltimaMensagem(atendimento.id);
        }

        // Salvar mensagem
        await this.salvarMensagem(atendimento.id, from, body, 'texto');

        // Processar baseado no estado do atendimento
        await this.processarMensagemPorEstado(from, body, atendimento);

    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
    }
}

    async handleMediaMessage(from, media, message) {
        try {
            const atendimento = await this.getAtendimentoAtivo(from);
            if (!atendimento) return;

            // Salvar mídia
            await this.salvarMensagem(
                atendimento.id, 
                from, 
                `[Mídia: ${media.mimetype}]`, 
                'midia',
                { mimetype: media.mimetype, filename: media.filename }
            );

            // Encaminhar para analista se tiver
            if (atendimento.analista_id) {
                this.io.to(`analista_${atendimento.analista_id}`).emit('nova_midia', {
                    atendimentoId: atendimento.id,
                    cliente: from,
                    media: {
                        data: media.data,
                        mimetype: media.mimetype,
                        filename: media.filename
                    },
                    timestamp: new Date()
                });
            }
        } catch (error) {
            console.error('Erro ao processar mídia:', error);
        }
    }

    async processarMensagemPorEstado(from, mensagem, atendimento) {
        const sessao = this.sessoesAtivas.get(from);

        if (atendimento.status === 'aguardando_questionario' || (sessao && !sessao.completo)) {
            await this.processarQuestionario(from, mensagem, atendimento, sessao);
        } else if (atendimento.status === 'fila') {
            await this.atualizarFilaComMensagem(atendimento, mensagem);
        } else if (atendimento.status === 'em_andamento' && atendimento.analista_id) {
            await this.encaminharParaAnalista(atendimento, mensagem);
        }
    }

   async processarQuestionario(from, mensagem, atendimento, sessao) {
    try {
        console.log('📝 Processando questionário para:', from, 'Sessão:', sessao);
        
        // Usar o método correto: processarResposta
        const resultado = await questionarioService.processarResposta(sessao, mensagem);

        if (resultado.completo) {
            console.log('✅ Questionário completo para:', from);
            
            // Questionário finalizado
            await pool.query(
                `UPDATE atendimentos 
                 SET status = 'fila', 
                     questionario = $1, 
                     assunto = $2,
                     prioridade = $3
                 WHERE id = $4`,
                [
                    JSON.stringify(resultado.respostas), 
                    resultado.assunto, 
                    this.calcularPrioridade(resultado.respostas),
                    atendimento.id
                ]
            );

            // Enviar mensagem final
            await this.client.sendMessage(from, this.perguntas[4]?.pergunta || "Um analista vai te atender em instantes!");

            // Adicionar à fila do Redis
            await this.adicionarFilaRedis(atendimento.id, from, resultado);

            // Emitir para analistas
            this.io.emit('novo_atendimento_fila', {
                atendimentoId: atendimento.id,
                cliente: from,
                clienteNome: atendimento.cliente_nome,
                assunto: resultado.assunto,
                resumo: resultado.resumo,
                prioridade: this.calcularPrioridade(resultado.respostas),
                timestamp: Date.now()
            });

            this.sessoesAtivas.delete(from);

        } else {
            // Enviar próxima pergunta
            console.log('📤 Enviando pergunta:', resultado.pergunta);
            await this.enviarPergunta(from, resultado.pergunta);
            
            // Salvar estado
            this.sessoesAtivas.set(from, {
                etapa: resultado.etapa,
                respostas: resultado.respostas,
                atendimentoId: atendimento.id
            });
        }
    } catch (error) {
        console.error('❌ Erro no questionário:', error);
        await this.client.sendMessage(
            from, 
            "❌ Ocorreu um erro. Um analista será atribuído manualmente em instantes."
        );
    }
}

    async enviarPergunta(from, pergunta) {
        if (pergunta.opcoes) {
            let texto = pergunta.pergunta + '\n\n';
            pergunta.opcoes.forEach((op, index) => {
                texto += `${index + 1}️⃣ ${op.texto}\n`;
            });
            await this.client.sendMessage(from, texto);
        } else {
            await this.client.sendMessage(from, pergunta.pergunta);
        }
    }

    calcularPrioridade(respostas) {
        // Lógica para calcular prioridade baseado nas respostas
        const urgencia = Object.values(respostas).find(r => 
            typeof r === 'string' && r.toLowerCase().includes('urgente')
        );
        
        if (urgencia) return 'alta';
        return 'media';
    }

    async adicionarFilaRedis(atendimentoId, cliente, resultado) {
        const itemFila = {
            atendimentoId,
            cliente,
            assunto: resultado.fluxo,
            resumo: resultado.resumo,
            prioridade: this.calcularPrioridade(resultado.respostas),
            timestamp: Date.now()
        };

        // Adicionar à fila de prioridade se for alta
        if (itemFila.prioridade === 'alta') {
            await redisClient.lPush(QUEUES.PRIORIDADE, JSON.stringify(itemFila));
        } else {
            await redisClient.lPush(QUEUES.AGUARDANDO, JSON.stringify(itemFila));
        }

        // Registrar na fila do PostgreSQL
        await pool.query(
            'INSERT INTO fila_espera (atendimento_id, posicao) VALUES ($1, $2)',
            [atendimentoId, await redisClient.lLen(QUEUES.AGUARDANDO)]
        );
    }

    async getAtendimentoAtivo(clienteNumero) {
        const result = await pool.query(
            `SELECT * FROM atendimentos 
             WHERE cliente_numero = $1 
             AND status IN ('aguardando_questionario', 'fila', 'em_andamento')`,
            [clienteNumero]
        );
        return result.rows[0];
    }

   async criarAtendimento(clienteNumero, message) {
    try {
        const contato = await message.getContact();
        const nome = contato.pushname || contato.name || 'Cliente';
        
        console.log('📝 Criando atendimento para:', {
            numero: clienteNumero,
            nome: nome,
            status: 'aguardando'
        });

        const result = await pool.query(
            `INSERT INTO atendimentos 
             (cliente_numero, cliente_nome, status, iniciado_em, ultima_mensagem) 
             VALUES ($1, $2, $3, NOW(), NOW()) 
             RETURNING *`,
            [clienteNumero, nome, 'aguardando_questionario']  
        );

        console.log('✅ Atendimento criado:', result.rows[0].id);
        return result.rows[0];
        
    } catch (error) {
        console.error('❌ Erro detalhado ao criar atendimento:', error);
        throw error;
    }
}
    async salvarMensagem(atendimentoId, remetente, conteudo, tipo = 'texto', metadata = null) {
        await pool.query(
            `INSERT INTO mensagens 
             (atendimento_id, remetente, conteudo, tipo, midia_url, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [atendimentoId, remetente, conteudo, tipo, metadata ? JSON.stringify(metadata) : null]
        );
    }

    async atualizarUltimaMensagem(atendimentoId) {
        await pool.query(
            'UPDATE atendimentos SET ultima_mensagem = NOW() WHERE id = $1',
            [atendimentoId]
        );
    }

    async atualizarFilaComMensagem(atendimento, mensagem) {
        // Buscar item na fila
        const filaItems = await redisClient.lRange(QUEUES.AGUARDANDO, 0, -1);
        
        for (const itemStr of filaItems) {
            const item = JSON.parse(itemStr);
            if (item.atendimentoId === atendimento.id) {
                // Atualizar com última mensagem
                item.ultimaMensagem = mensagem;
                item.ultimaMensagemTimestamp = Date.now();
                
                // Remover e adicionar atualizado
                await redisClient.lRem(QUEUES.AGUARDANDO, 1, itemStr);
                await redisClient.lPush(QUEUES.AGUARDANDO, JSON.stringify(item));
                break;
            }
        }
    }

    async encaminharParaAnalista(atendimento, mensagem) {
        this.io.to(`analista_${atendimento.analista_id}`).emit('nova_mensagem', {
            atendimentoId: atendimento.id,
            cliente: atendimento.cliente_numero,
            clienteNome: atendimento.cliente_nome,
            mensagem: mensagem,
            timestamp: new Date()
        });
    }

    async enviarMensagemParaCliente(numero, mensagem, analistaId) {
        try {
            const numeroFormatado = numero.includes('@c.us') ? numero : `${numero}@c.us`;
            await this.client.sendMessage(numeroFormatado, mensagem);
            
            const atendimento = await this.getAtendimentoAtivo(numero);
            if (atendimento) {
                await this.salvarMensagem(atendimento.id, 'analista', mensagem, 'texto');
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            return false;
        }
    }

    emitirStatus(evento, dados = {}) {
        this.io.emit('whatsapp_status', { status: this.status, ...dados });
    }

    async handleMessageAck(message, ack) {
        // Atualizar status de leitura das mensagens
        if (ack === 3) { // Mensagem lida
            await pool.query(
                `UPDATE mensagens SET lida = true 
                 WHERE atendimento_id = (
                     SELECT id FROM atendimentos 
                     WHERE cliente_numero = $1 AND status = 'em_andamento'
                 )`,
                [message.from]
            );
        }
    }
}

module.exports = WhatsAppService;