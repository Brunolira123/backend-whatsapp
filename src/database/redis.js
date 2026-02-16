const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD || undefined,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.log('❌ Muitas tentativas de reconexão ao Redis');
                return new Error('Muitas tentativas');
            }
            return Math.min(retries * 100, 3000);
        }
    }
});

redisClient.on('error', (err) => {
    console.error('❌ Erro no Redis:', err.message);
});

redisClient.on('connect', () => {
    console.log('✅ Conectado ao Redis');
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.error('❌ Falha ao conectar Redis:', error.message);
        throw error;
    }
};

const QUEUES = {
    AGUARDANDO: 'fila:aguardando',
    EM_ATENDIMENTO: 'fila:atendimento',
    QUESTIONARIO: 'fila:questionario',
    PRIORIDADE: 'fila:prioridade'
};

module.exports = { 
    redisClient, 
    QUEUES, 
    connectRedis,
    isRedisAvailable: () => redisClient?.isReady || false
};