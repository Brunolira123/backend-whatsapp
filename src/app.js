const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initDatabase } = require('./database/postgres');
const { redisClient, connectRedis, QUEUES } = require('./database/redis');
const WhatsAppService = require('./services/whatsappService');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// Configuração do Socket.io com CORS
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        services: {
            whatsapp: whatsappService?.status || 'not_initialized'
        }
    });
});

// 🔥 PRIMEIRO: Inicializar WhatsApp Service
const whatsappService = new WhatsAppService(io);

// 🔥 SEGUNDO: Middleware para disponibilizar whatsappService em TODAS as rotas
app.use((req, res, next) => {
    req.whatsappService = whatsappService;
    req.io = io;
    console.log('✅ Middleware executado - whatsappService disponível');
    next();
});

// 🔥 TERCEIRO: Rotas (DEPOIS do middleware)
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Socket.io
io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    socket.on('autenticar_analista', async (data) => {
        const { analistaId, token } = data;
        
        socket.join(`analista_${analistaId}`);
        socket.analistaId = analistaId;
        
        console.log(`👨‍💻 Analista ${analistaId} autenticado`);
        
        socket.emit('whatsapp_status', { 
            status: whatsappService?.status || 'disconnected' 
        });
    });

    socket.on('solicitar_fila', async () => {
        try {
            const fila = await redisClient.lRange(QUEUES.AGUARDANDO, 0, -1);
            const filaPrioridade = await redisClient.lRange(QUEUES.PRIORIDADE, 0, -1);
            
            const todosItems = [...filaPrioridade, ...fila].map(item => JSON.parse(item));
            
            socket.emit('fila_atualizada', todosItems);
        } catch (error) {
            console.error('Erro ao buscar fila:', error);
        }
    });

    socket.on('disconnect', () => {
        if (socket.analistaId) {
            console.log(`👨‍💻 Analista ${socket.analistaId} desconectado`);
        }
        console.log('❌ Cliente desconectado:', socket.id);
    });
});

// Inicializar tudo
const start = async () => {
    try {
        await initDatabase();
        console.log('✅ PostgreSQL conectado');
        
        await connectRedis();
        console.log('✅ Redis conectado');

        await whatsappService.initialize();

        const PORT = process.env.PORT || 3001;
        server.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📱 Frontend permitido: ${process.env.FRONTEND_URL}`);
        });

    } catch (error) {
        console.error('❌ Erro fatal ao iniciar servidor:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Recebido SIGTERM, fechando conexões...');
    await redisClient.quit();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Recebido SIGINT, fechando conexões...');
    await redisClient.quit();
    process.exit(0);
});

start();

module.exports = { app, server, io, whatsappService };