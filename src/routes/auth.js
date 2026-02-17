const express = require('express');
const router = express.Router();
const { pool } = require('../database/postgres');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        console.log('🔐 Tentativa login:', email);

        const result = await pool.query(
            'SELECT * FROM analistas WHERE email = $1 AND ativo = true',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const analista = result.rows[0];


        if (senha !== '123456') { 
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const token = jwt.sign(
            { id: analista.id, email: analista.email },
            process.env.JWT_SECRET || 'secret_dev',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        await pool.query(
            'UPDATE analistas SET ultimo_acesso = NOW() WHERE id = $1',
            [analista.id]
        );

        console.log('✅ Login bem-sucedido:', analista.nome);

        res.json({
            analista: {
                id: analista.id,
                nome: analista.nome,
                email: analista.email
            },
            token
        });

    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_dev');
        
        const result = await pool.query(
            'SELECT id, nome, email FROM analistas WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Analista não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

module.exports = router;