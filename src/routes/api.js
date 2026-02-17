const express = require('express');
const router = express.Router();
const { pool } = require('../database/postgres');
const { redisClient, QUEUES } = require('../database/redis');

// Middleware para verificar se tem acesso (você pode implementar JWT depois)
const authMiddleware = (req, res, next) => {
    // Implementar verificação de JWT aqui
    next();
};

// Buscar todos atendimentos na fila
router.get('/fila', authMiddleware, async (req, res) => {
    try {
        const filaNormal = await redisClient.lRange(QUEUES.AGUARDANDO, 0, -1);
        const filaPrioridade = await redisClient.lRange(QUEUES.PRIORIDADE, 0, -1);
        
        const atendimentos = [
            ...filaPrioridade.map(item => ({ ...JSON.parse(item), prioridade: 'alta' })),
            ...filaNormal.map(item => ({ ...JSON.parse(item), prioridade: 'normal' }))
        ];
        
        res.json(atendimentos);
    } catch (error) {
        console.error('Erro ao buscar fila:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Analista pegar um atendimento
router.post('/atendimento/pegar', authMiddleware, async (req, res) => {
    const { analistaId } = req.body;

    if (!analistaId) {
        return res.status(400).json({ error: 'analistaId é obrigatório' });
    }

    try {
        // Verificar se analista existe e está ativo
        const analista = await pool.query(
            'SELECT * FROM analistas WHERE id = $1 AND ativo = true',
            [analistaId]
        );

        if (analista.rows.length === 0) {
            return res.status(404).json({ error: 'Analista não encontrado ou inativo' });
        }

        // Tentar pegar da fila de prioridade primeiro
        let atendimentoStr = await redisClient.rPop(QUEUES.PRIORIDADE);
        let filaOrigem = 'prioridade';
        
        if (!atendimentoStr) {
            atendimentoStr = await redisClient.rPop(QUEUES.AGUARDANDO);
            filaOrigem = 'normal';
        }

        if (!atendimentoStr) {
            return res.status(404).json({ error: 'Nenhum atendimento na fila' });
        }

        const atendimentoData = JSON.parse(atendimentoStr);

        // Atualizar no banco
        const result = await pool.query(
            `UPDATE atendimentos 
             SET status = 'em_andamento', 
                 analista_id = $1,
                 ultima_mensagem = NOW()
             WHERE id = $2 AND status = 'fila'
             RETURNING *`,
            [analistaId, atendimentoData.atendimentoId]
        );

        if (result.rows.length === 0) {
            // Se não conseguiu atualizar, coloca de volta na fila
            await redisClient.lPush(
                filaOrigem === 'prioridade' ? QUEUES.PRIORIDADE : QUEUES.AGUARDANDO,
                atendimentoStr
            );
            return res.status(409).json({ error: 'Atendimento não está mais disponível' });
        }

        // Remover da fila_espera
        await pool.query(
            'DELETE FROM fila_espera WHERE atendimento_id = $1',
            [atendimentoData.atendimentoId]
        );

        // Buscar mensagens anteriores
        const mensagens = await pool.query(
            `SELECT * FROM mensagens 
             WHERE atendimento_id = $1 
             ORDER BY created_at ASC`,
            [atendimentoData.atendimentoId]
        );

        res.json({
            atendimento: result.rows[0],
            historico: mensagens.rows,
            resumo: atendimentoData.resumo
        });

    } catch (error) {
        console.error('Erro ao pegar atendimento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Enviar mensagem do analista
router.post('/mensagem/enviar', authMiddleware, async (req, res) => {
    const { atendimentoId, mensagem, analistaId } = req.body;
    const whatsappService = req.whatsappService;

    console.log('📤 Tentando enviar mensagem:', { atendimentoId, mensagem, analistaId });
    console.log('🛠️ whatsappService na requisição:', !!whatsappService);

    if (!atendimentoId || !mensagem || !analistaId) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    if (!whatsappService) {
        console.error('❌ whatsappService não disponível na requisição');
        return res.status(500).json({ error: 'Serviço WhatsApp não inicializado' });
    }

    try {
        // Buscar atendimento
        const atendimento = await pool.query(
            'SELECT * FROM atendimentos WHERE id = $1 AND analista_id = $2',
            [atendimentoId, analistaId]
        );

        if (atendimento.rows.length === 0) {
            return res.status(404).json({ error: 'Atendimento não encontrado' });
        }

        // Enviar mensagem
        const enviado = await whatsappService.enviarMensagemParaCliente(
            atendimento.rows[0].cliente_numero,
            mensagem,
            analistaId
        );

        if (enviado) {
            // Salvar no banco
            await pool.query(
                `INSERT INTO mensagens (atendimento_id, remetente, conteudo, tipo, created_at) 
                 VALUES ($1, $2, $3, $4, NOW())`,
                [atendimentoId, 'analista', mensagem, 'texto']
            );

            res.json({ success: true, timestamp: new Date() });
        } else {
            res.status(500).json({ error: 'Erro ao enviar mensagem' });
        }
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        res.status(500).json({ error: error.message });
    }
});

// Buscar histórico do atendimento
router.get('/atendimento/:id/historico', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT m.*, a.cliente_nome, a.cliente_numero, a.status
             FROM mensagens m
             JOIN atendimentos a ON a.id = m.atendimento_id
             WHERE m.atendimento_id = $1
             ORDER BY m.created_at ASC`,
            [id]
        );

        res.json({
            atendimento: result.rows[0] ? {
                cliente_nome: result.rows[0].cliente_nome,
                cliente_numero: result.rows[0].cliente_numero,
                status: result.rows[0].status
            } : null,
            mensagens: result.rows.map(row => ({
                id: row.id,
                remetente: row.remetente,
                conteudo: row.conteudo,
                tipo: row.tipo,
                created_at: row.created_at,
                lida: row.lida
            }))
        });
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Finalizar atendimento
router.post('/atendimento/:id/finalizar', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { analistaId, avaliacao, feedback } = req.body;

    try {
        const result = await pool.query(
            `UPDATE atendimentos 
             SET status = 'finalizado', 
                 finalizado_em = NOW(),
                 avaliacao = $1,
                 feedback = $2
             WHERE id = $3 AND analista_id = $4
             RETURNING *`,
            [avaliacao, feedback, id, analistaId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Atendimento não encontrado' });
        }

        // Enviar mensagem de agradecimento (opcional)
        const whatsappService = req.whatsappService;
        await whatsappService.enviarMensagemParaCliente(
            result.rows[0].cliente_numero,
            "Obrigado pelo contato! Sua conversa foi finalizada. Se precisar de algo mais, estamos à disposição. 🌟",
            analistaId
        );

        res.json({ success: true, atendimento: result.rows[0] });
    } catch (error) {
        console.error('Erro ao finalizar atendimento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar analistas
router.get('/analistas', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nome, email, ativo, ultimo_acesso FROM analistas ORDER BY nome'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar analistas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Status do WhatsApp
router.get('/whatsapp/status', authMiddleware, (req, res) => {
    const whatsappService = req.whatsappService;
    res.json({ 
        status: whatsappService?.status || 'disconnected',
        timestamp: new Date()
    });
});

module.exports = router;