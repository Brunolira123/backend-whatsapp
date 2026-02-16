const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Criar tabelas se não existirem
const initDatabase = async () => {
    const client = await pool.connect();
    try {
        console.log('🔄 Criando tabelas no PostgreSQL...');
        
        // Tabela de analistas
        await client.query(`
            CREATE TABLE IF NOT EXISTS analistas (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL,
                avatar VARCHAR(255),
                ativo BOOLEAN DEFAULT true,
                ultimo_acesso TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tabela de atendimentos
        await client.query(`
            CREATE TABLE IF NOT EXISTS atendimentos (
                id SERIAL PRIMARY KEY,
                cliente_numero VARCHAR(20) NOT NULL,
                cliente_nome VARCHAR(100),
                status VARCHAR(20) DEFAULT 'aguardando',
                questionario JSONB DEFAULT '{}',
                assunto VARCHAR(50),
                prioridade VARCHAR(10) DEFAULT 'media',
                analista_id INTEGER REFERENCES analistas(id),
                iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                finalizado_em TIMESTAMP,
                ultima_mensagem TIMESTAMP,
                avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
                feedback TEXT
            );
        `);

        // Tabela de mensagens
        await client.query(`
            CREATE TABLE IF NOT EXISTS mensagens (
                id SERIAL PRIMARY KEY,
                atendimento_id INTEGER REFERENCES atendimentos(id) ON DELETE CASCADE,
                remetente VARCHAR(20) NOT NULL,
                conteudo TEXT NOT NULL,
                tipo VARCHAR(20) DEFAULT 'texto',
                midia_url TEXT,
                lida BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tabela para fila de espera
        await client.query(`
            CREATE TABLE IF NOT EXISTS fila_espera (
                id SERIAL PRIMARY KEY,
                atendimento_id INTEGER REFERENCES atendimentos(id) ON DELETE CASCADE,
                posicao INTEGER NOT NULL,
                entrou_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_atendimento_fila UNIQUE(atendimento_id)
            );
        `);

        // Índices
        await client.query(`CREATE INDEX IF NOT EXISTS idx_atendimentos_cliente ON atendimentos(cliente_numero);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON atendimentos(status);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_atendimentos_analista ON atendimentos(analista_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_mensagens_atendimento ON mensagens(atendimento_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_mensagens_created ON mensagens(created_at);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_fila_posicao ON fila_espera(posicao);`);

        // Inserir analista padrão (senha: 123456)
        await client.query(`
            INSERT INTO analistas (nome, email, senha) 
            VALUES ('Admin', 'admin@exemplo.com', '$2a$10$XQ8R9xQ9xQ9xQ9xQ9xQ9xO9xQ9xQ9xQ9xQ9xQ9xQ9xQ9xQ9xQ9xQ9x')
            ON CONFLICT (email) DO NOTHING;
        `);

        console.log('✅ Tabelas criadas/verificadas com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao criar tabelas:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { pool, initDatabase };