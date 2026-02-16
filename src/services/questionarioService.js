class QuestionarioService {
    constructor() {
        this.menuPrincipal = {
            id: 0,
            pergunta: "Olá! 👋 Sou o assistente virtual. Para melhor atendê-lo, escolha uma opção:\n\n" +
                     "1️⃣ 📋 Módulo Fiscal\n" +
                     "2️⃣ 💻 Módulo PDV\n" +
                     "3️⃣ 📦 Módulo Administrativo/Estoque\n" +
                     "4️⃣ 📝 Outros assuntos\n\n" +
                     "*Digite o número da opção desejada:*",
            opcoes: [
                { id: '1', texto: '1️⃣ Módulo Fiscal', fluxo: 'fiscal' },
                { id: '2', texto: '2️⃣ Módulo PDV', fluxo: 'pdv' },
                { id: '3', texto: '3️⃣ Módulo Administrativo/Estoque', fluxo: 'administrativo' },
                { id: '4', texto: '4️⃣ Outros', fluxo: 'outros' }
            ]
        };

        this.fluxos = {
            fiscal: {
                titulo: "📋 Módulo Fiscal",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Você selecionou *Módulo Fiscal*.\n\n" +
                                 "Escolha uma opção:\n\n" +
                                 "1️⃣ Nota Fiscal Entrada\n" +
                                 "2️⃣ Emissão de NF\n" +
                                 "3️⃣ Certificado Digital\n" +
                                 "4️⃣ Voltar ao menu principal\n\n" +
                                 "*Digite o número da opção desejada:*",
                        opcoes: [
                            { id: '1', texto: '1️⃣ Nota Fiscal Entrada', fluxo: 'fiscal_nota_entrada' },
                            { id: '2', texto: '2️⃣ Emissão de NF', fluxo: 'fiscal_emissao' },
                            { id: '3', texto: '3️⃣ Certificado Digital', fluxo: 'fiscal_certificado' },
                            { id: '4', texto: '4️⃣ Voltar', fluxo: 'voltar' }
                        ]
                    }
                ]
            },
            fiscal_nota_entrada: {
                titulo: "📋 Fiscal > Nota Fiscal Entrada",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *resuma seu problema com Nota Fiscal Entrada*:\n\n" +
                                 "(Ex: Erro ao lançar, nota não entra, duplicidade, etc)",
                        tipo: 'texto'
                    }
                ]
            },
            fiscal_emissao: {
                titulo: "📋 Fiscal > Emissão de NF",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *resuma seu problema com Emissão de NF*:\n\n" +
                                 "(Ex: Erro ao emitir, cálculo de impostos, cancelamento, etc)",
                        tipo: 'texto'
                    }
                ]
            },
            fiscal_certificado: {
                titulo: "📋 Fiscal > Certificado Digital",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *resuma seu problema com Certificado Digital*:\n\n" +
                                 "(Ex: Certificado vencido, erro de instalação, validação, etc)",
                        tipo: 'texto'
                    }
                ]
            },
            pdv: {
                titulo: "💻 Módulo PDV",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Você selecionou *Módulo PDV*.\n\n" +
                                 "Escolha uma opção:\n\n" +
                                 "1️⃣ Periféricos (teclado, pinpad, leitor)\n" +
                                 "2️⃣ Promoções\n" +
                                 "3️⃣ Preços\n" +
                                 "4️⃣ Consistência\n" +
                                 "5️⃣ Voltar ao menu principal\n\n" +
                                 "*Digite o número da opção desejada:*",
                        opcoes: [
                            { id: '1', texto: '1️⃣ Periféricos', fluxo: 'pdv_perifericos' },
                            { id: '2', texto: '2️⃣ Promoções', fluxo: 'pdv_promocoes' },
                            { id: '3', texto: '3️⃣ Preços', fluxo: 'pdv_precos' },
                            { id: '4', texto: '4️⃣ Consistência', fluxo: 'pdv_consistencia' },
                            { id: '5', texto: '5️⃣ Voltar', fluxo: 'voltar' }
                        ]
                    }
                ]
            },
            pdv_perifericos: {
                titulo: "💻 PDV > Periféricos",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *resuma seu problema com Periféricos*:\n\n" +
                                 "(Ex: Pinpad não conecta, leitor não lê, teclado sem função, etc)",
                        tipo: 'texto'
                    }
                ]
            },
            pdv_promocoes: {
                titulo: "💻 PDV > Promoções",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *resuma seu problema com Promoções*:\n\n" +
                                 "(Ex: Promoção não aplica, configuração errada, acumula com outras, etc)",
                        tipo: 'texto'
                    }
                ]
            },
            pdv_precos: {
                titulo: "💻 PDV > Preços",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *resuma seu problema com Preços*:\n\n" +
                                 "(Ex: Preço errado, não atualiza, diferença de valor, etc)",
                        tipo: 'texto'
                    }
                ]
            },
            pdv_consistencia: {
                titulo: "💻 PDV > Consistência",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *resuma seu problema com Consistência*:\n\n" +
                                 "(Ex: Estoque inconsistente, diferença de valores, etc)",
                        tipo: 'texto'
                    }
                ]
            },
            administrativo: {
                titulo: "📦 Módulo Administrativo/Estoque",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Você selecionou *Módulo Administrativo/Estoque*.\n\n" +
                                 "Escolha uma opção:\n\n" +
                                 "1️⃣ Custo, preço e estoque de produto\n" +
                                 "2️⃣ Cadastro de novos produtos\n" +
                                 "3️⃣ Balanço de estoque\n" +
                                 "4️⃣ Voltar ao menu principal\n\n" +
                                 "*Digite o número da opção desejada:*",
                        opcoes: [
                            { id: '1', texto: '1️⃣ Custo/Preço/Estoque', fluxo: 'adm_custo' },
                            { id: '2', texto: '2️⃣ Cadastro novos produtos', fluxo: 'adm_cadastro' },
                            { id: '3', texto: '3️⃣ Balanço de estoque', fluxo: 'adm_balanco' },
                            { id: '4', texto: '4️⃣ Voltar', fluxo: 'voltar' }
                        ]
                    }
                ]
            },
            adm_custo: {
                titulo: "📦 Adm > Custo/Preço/Estoque",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *resuma seu problema com Custos/Preços/Estoque*:\n\n" +
                                 "(Ex: Custo errado, preço não atualiza, estoque negativo, etc)",
                        tipo: 'texto'
                    }
                ]
            },
            adm_cadastro: {
                titulo: "📦 Adm > Cadastro de Produtos",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *resuma seu problema com Cadastro de Produtos*:\n\n" +
                                 "(Ex: Erro ao cadastrar, duplicidade, campos obrigatórios, etc)",
                        tipo: 'texto'
                    }
                ]
            },
            adm_balanco: {
                titulo: "📦 Adm > Balanço de Estoque",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *resuma seu problema com Balanço de Estoque*:\n\n" +
                                 "(Ex: Diferença no balanço, ajuste manual, etc)",
                        tipo: 'texto'
                    }
                ]
            },
            outros: {
                titulo: "📝 Outros Assuntos",
                perguntas: [
                    {
                        id: 1,
                        pergunta: "Por favor, *descreva seu problema ou dúvida*:\n\n" +
                                 "Fique à vontade para detalhar o máximo possível:",
                        tipo: 'texto'
                    }
                ]
            }
        };
    }

    iniciarQuestionario() {
        console.log('📝 Iniciando novo atendimento - Menu Principal');
        return {
            etapa: 'menu',
            fluxo: 'menu',
            pergunta: this.menuPrincipal,
            respostas: {}
        };
    }

    async processarResposta(estadoAtual, mensagem) {
        console.log('🎯 Processando resposta:', { estadoAtual, mensagem });

        // Se não tem estado, começa do menu
        if (!estadoAtual || !estadoAtual.fluxo) {
            return this.iniciarQuestionario();
        }

        // Está no MENU PRINCIPAL
        if (estadoAtual.fluxo === 'menu') {
            const opcao = this.menuPrincipal.opcoes.find(o => o.id === mensagem);
            
            if (!opcao) {
                return {
                    etapa: 'menu',
                    fluxo: 'menu',
                    pergunta: this.menuPrincipal,
                    respostas: estadoAtual.respostas,
                    erro: true
                };
            }

            console.log('🚀 Indo para fluxo:', opcao.fluxo);
            
            // Se for "outros", vai direto pra descrição
            if (opcao.fluxo === 'outros') {
                return {
                    etapa: 1,
                    fluxo: 'outros',
                    pergunta: this.fluxos.outros.perguntas[0],
                    respostas: { modulo: 'outros' }
                };
            }

            // Vai para o módulo escolhido (mostra o menu do módulo)
            return {
                etapa: 1,
                fluxo: opcao.fluxo,
                pergunta: this.fluxos[opcao.fluxo].perguntas[0],
                respostas: { modulo: opcao.fluxo }
            };
        }

        // Está em um MÓDULO (fiscal, pdv, administrativo)
        const fluxoAtual = this.fluxos[estadoAtual.fluxo];
        
        if (!fluxoAtual) {
            return this.iniciarQuestionario();
        }

        // Se tem opções (está no menu do módulo)
        if (fluxoAtual.perguntas[0].opcoes) {
            const opcao = fluxoAtual.perguntas[0].opcoes.find(o => o.id === mensagem);
            
            if (!opcao) {
                return {
                    etapa: 1,
                    fluxo: estadoAtual.fluxo,
                    pergunta: fluxoAtual.perguntas[0],
                    respostas: estadoAtual.respostas,
                    erro: true
                };
            }

            // Voltar ao menu principal
            if (opcao.fluxo === 'voltar') {
                return this.iniciarQuestionario();
            }

            console.log('🚀 Indo para subfluxo:', opcao.fluxo);
            
            // Vai para o subfluxo (descrição do problema)
            return {
                etapa: 1,
                fluxo: opcao.fluxo,
                pergunta: this.fluxos[opcao.fluxo].perguntas[0],
                respostas: {
                    ...estadoAtual.respostas,
                    submodulo: opcao.fluxo
                }
            };
        }

        // Está na DESCRIÇÃO DO PROBLEMA (última etapa)
        const respostas = { ...estadoAtual.respostas };
        respostas.descricao = mensagem;

        // Questionário completo!
        return {
            completo: true,
            fluxo: estadoAtual.fluxo,
            respostas,
            assunto: estadoAtual.fluxo,
            titulo: fluxoAtual.titulo,
            resumo: this.gerarResumo(estadoAtual.fluxo, respostas)
        };
    }

    gerarResumo(fluxo, respostas) {
        const fluxoInfo = this.fluxos[fluxo] || { titulo: 'Atendimento' };
        
        let resumo = `📋 *Resumo do Atendimento*\n\n`;
        resumo += `*Módulo:* ${fluxoInfo.titulo}\n`;
        
        if (respostas.descricao) {
            resumo += `\n*Descrição:* ${respostas.descricao}\n`;
        }

        return resumo;
    }

    mensagemFinal(fluxo, respostas) {
        const resumo = this.gerarResumo(fluxo, respostas);
        
        return `${resumo}\n\n` +
               `🟢 *Seu atendimento foi registrado!*\n\n` +
               `Um analista vai te atender em instantes.\n` +
               `*Tempo médio de espera:* 2-5 minutos\n\n` +
               `Enquanto isso, fique à vontade para enviar mais detalhes.`;
    }
}

module.exports = new QuestionarioService();