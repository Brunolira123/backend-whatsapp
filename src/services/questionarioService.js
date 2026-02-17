class QuestionarioService {
    constructor() {
        this.menuPrincipal = {
            id: 'menu',
            pergunta: "Olá! 👋 Sou o assistente virtual. Para melhor atendê-lo, escolha uma opção:\n\n" +
                     "1️⃣ 📋 Módulo Fiscal\n" +
                     "2️⃣ 💻 Módulo PDV\n" +
                     "3️⃣ 📦 Módulo Administrativo/Estoque\n" +
                     "4️⃣ 📝 Outros assuntos\n\n" +
                     "*Digite o número da opção desejada:*",
            opcoes: {
                '1': { texto: 'Módulo Fiscal', fluxo: 'fiscal' },
                '2': { texto: 'Módulo PDV', fluxo: 'pdv' },
                '3': { texto: 'Módulo Administrativo/Estoque', fluxo: 'administrativo' },
                '4': { texto: 'Outros', fluxo: 'outros' }
            }
        };

        this.fluxos = {
            fiscal: {
                titulo: "📋 Módulo Fiscal",
                menu: {
                    pergunta: "Você selecionou *Módulo Fiscal*.\n\n" +
                             "Escolha uma opção:\n\n" +
                             "1️⃣ Nota Fiscal Entrada\n" +
                             "2️⃣ Emissão de NF\n" +
                             "3️⃣ Certificado Digital\n" +
                             "4️⃣ Voltar ao menu principal\n\n" +
                             "*Digite o número da opção desejada:*",
                    opcoes: {
                        '1': { texto: 'Nota Fiscal Entrada', fluxo: 'fiscal_nota_entrada' },
                        '2': { texto: 'Emissão de NF', fluxo: 'fiscal_emissao' },
                        '3': { texto: 'Certificado Digital', fluxo: 'fiscal_certificado' },
                        '4': { texto: 'Voltar', fluxo: 'menu' }
                    }
                }
            },
            fiscal_nota_entrada: {
                titulo: "📋 Fiscal > Nota Fiscal Entrada",
                pergunta: "Por favor, *resuma seu problema com Nota Fiscal Entrada*:\n\n" +
                         "(Ex: Erro ao lançar, nota não entra, duplicidade, etc)"
            },
            fiscal_emissao: {
                titulo: "📋 Fiscal > Emissão de NF",
                pergunta: "Por favor, *resuma seu problema com Emissão de NF*:\n\n" +
                         "(Ex: Erro ao emitir, cálculo de impostos, cancelamento, etc)"
            },
            fiscal_certificado: {
                titulo: "📋 Fiscal > Certificado Digital",
                pergunta: "Por favor, *resuma seu problema com Certificado Digital*:\n\n" +
                         "(Ex: Certificado vencido, erro de instalação, validação, etc)"
            },
            pdv: {
                titulo: "💻 Módulo PDV",
                menu: {
                    pergunta: "Você selecionou *Módulo PDV*.\n\n" +
                             "Escolha uma opção:\n\n" +
                             "1️⃣ Periféricos (teclado, pinpad, leitor)\n" +
                             "2️⃣ Promoções\n" +
                             "3️⃣ Preços\n" +
                             "4️⃣ Consistência\n" +
                             "5️⃣ Voltar ao menu principal\n\n" +
                             "*Digite o número da opção desejada:*",
                    opcoes: {
                        '1': { texto: 'Periféricos', fluxo: 'pdv_perifericos' },
                        '2': { texto: 'Promoções', fluxo: 'pdv_promocoes' },
                        '3': { texto: 'Preços', fluxo: 'pdv_precos' },
                        '4': { texto: 'Consistência', fluxo: 'pdv_consistencia' },
                        '5': { texto: 'Voltar', fluxo: 'menu' }
                    }
                }
            },
            pdv_perifericos: {
                titulo: "💻 PDV > Periféricos",
                pergunta: "Por favor, *resuma seu problema com Periféricos*:\n\n" +
                         "(Ex: Pinpad não conecta, leitor não lê, teclado sem função, etc)"
            },
            pdv_promocoes: {
                titulo: "💻 PDV > Promoções",
                pergunta: "Por favor, *resuma seu problema com Promoções*:\n\n" +
                         "(Ex: Promoção não aplica, configuração errada, acumula com outras, etc)"
            },
            pdv_precos: {
                titulo: "💻 PDV > Preços",
                pergunta: "Por favor, *resuma seu problema com Preços*:\n\n" +
                         "(Ex: Preço errado, não atualiza, diferença de valor, etc)"
            },
            pdv_consistencia: {
                titulo: "💻 PDV > Consistência",
                pergunta: "Por favor, *resuma seu problema com Consistência*:\n\n" +
                         "(Ex: Estoque inconsistente, diferença de valores, etc)"
            },
            administrativo: {
                titulo: "📦 Módulo Administrativo/Estoque",
                menu: {
                    pergunta: "Você selecionou *Módulo Administrativo/Estoque*.\n\n" +
                             "Escolha uma opção:\n\n" +
                             "1️⃣ Custo, preço e estoque de produto\n" +
                             "2️⃣ Cadastro de novos produtos\n" +
                             "3️⃣ Balanço de estoque\n" +
                             "4️⃣ Voltar ao menu principal\n\n" +
                             "*Digite o número da opção desejada:*",
                    opcoes: {
                        '1': { texto: 'Custo/Preço/Estoque', fluxo: 'adm_custo' },
                        '2': { texto: 'Cadastro novos produtos', fluxo: 'adm_cadastro' },
                        '3': { texto: 'Balanço de estoque', fluxo: 'adm_balanco' },
                        '4': { texto: 'Voltar', fluxo: 'menu' }
                    }
                }
            },
            adm_custo: {
                titulo: "📦 Adm > Custo/Preço/Estoque",
                pergunta: "Por favor, *resuma seu problema com Custos/Preços/Estoque*:\n\n" +
                         "(Ex: Custo errado, preço não atualiza, estoque negativo, etc)"
            },
            adm_cadastro: {
                titulo: "📦 Adm > Cadastro de Produtos",
                pergunta: "Por favor, *resuma seu problema com Cadastro de Produtos*:\n\n" +
                         "(Ex: Erro ao cadastrar, duplicidade, campos obrigatórios, etc)"
            },
            adm_balanco: {
                titulo: "📦 Adm > Balanço de Estoque",
                pergunta: "Por favor, *resuma seu problema com Balanço de Estoque*:\n\n" +
                         "(Ex: Diferença no balanço, ajuste manual, etc)"
            },
            outros: {
                titulo: "📝 Outros Assuntos",
                pergunta: "Por favor, *descreva seu problema ou dúvida*:\n\n" +
                         "Fique à vontade para detalhar o máximo possível:"
            }
        };
    }

    iniciarQuestionario() {
        console.log('📝 Iniciando novo atendimento - Menu Principal');
        return {
            fluxo: 'menu',
            respostas: {}
        };
    }

    processarResposta(estado, mensagem) {
        console.log('🎯 Processando:', { estado, mensagem });

        // Se não tem estado, começa do menu
        if (!estado || !estado.fluxo) {
            return {
                fluxo: 'menu',
                resposta: this.menuPrincipal.pergunta,
                respostas: {}
            };
        }

        const fluxoAtual = estado.fluxo;

        // Está no MENU PRINCIPAL
        if (fluxoAtual === 'menu') {
            const opcao = this.menuPrincipal.opcoes[mensagem];
            
            if (!opcao) {
                return {
                    fluxo: 'menu',
                    resposta: this.menuPrincipal.pergunta,
                    respostas: estado.respostas,
                    erro: 'Opção inválida'
                };
            }

            console.log('🚀 Indo para:', opcao.fluxo);

            // Se for "outros", vai direto pra pergunta final
            if (opcao.fluxo === 'outros') {
                return {
                    fluxo: 'outros',
                    resposta: this.fluxos.outros.pergunta,
                    respostas: { ...estado.respostas, modulo: 'outros' }
                };
            }

            // Vai para o menu do módulo escolhido
            return {
                fluxo: opcao.fluxo,
                resposta: this.fluxos[opcao.fluxo].menu.pergunta,
                respostas: { ...estado.respostas, modulo: opcao.fluxo }
            };
        }

        // Está em um MÓDULO com MENU (fiscal, pdv, administrativo)
        if (this.fluxos[fluxoAtual]?.menu) {
            const opcao = this.fluxos[fluxoAtual].menu.opcoes[mensagem];
            
            if (!opcao) {
                return {
                    fluxo: fluxoAtual,
                    resposta: this.fluxos[fluxoAtual].menu.pergunta,
                    respostas: estado.respostas,
                    erro: 'Opção inválida'
                };
            }

            // Voltar ao menu principal
            if (opcao.fluxo === 'menu') {
                return {
                    fluxo: 'menu',
                    resposta: this.menuPrincipal.pergunta,
                    respostas: {}
                };
            }

            console.log('🚀 Indo para subfluxo:', opcao.fluxo);

            // Vai para a pergunta final do subfluxo
            return {
                fluxo: opcao.fluxo,
                resposta: this.fluxos[opcao.fluxo].pergunta,
                respostas: {
                    ...estado.respostas,
                    submodulo: opcao.fluxo
                }
            };
        }

        // Está na PERGUNTA FINAL (descrevendo o problema)
        const respostas = { ...estado.respostas };
        respostas.descricao = mensagem;

        // Questionário completo!
        return {
            completo: true,
            fluxo: fluxoAtual,
            respostas,
            assunto: fluxoAtual,
            titulo: this.fluxos[fluxoAtual].titulo,
            resumo: this.gerarResumo(fluxoAtual, respostas)
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