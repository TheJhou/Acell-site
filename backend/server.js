require('dotenv').config();
const express = require('express');
const path = require('path');
const { pool, init } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/api/contato', async (req, res) => {
  const { nome, email, telefone, mensagem } = req.body;

  if (!nome || !email || !telefone || !mensagem) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO contatos (nome, email, telefone, mensagem) VALUES ($1, $2, $3, $4) RETURNING id',
      [nome, email, telefone, mensagem]
    );
    res.status(201).json({ sucesso: true, id: rows[0].id });
  } catch (err) {
    console.error('Erro ao salvar contato:', err);
    res.status(500).json({ erro: 'Erro interno ao salvar dados.' });
  }
});

app.get('/api/contatos', async (req, res) => {
  const senha = req.headers['x-admin-key'];
  if (senha !== (process.env.ADMIN_KEY || 'acell2024')) {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM contatos ORDER BY criado_em DESC');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar contatos:', err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.delete('/api/contatos/:id', async (req, res) => {
  const senha = req.headers['x-admin-key'];
  if (senha !== (process.env.ADMIN_KEY || 'acell2024')) {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }
  try {
    await pool.query('DELETE FROM contatos WHERE id = $1', [req.params.id]);
    res.json({ sucesso: true });
  } catch (err) {
    console.error('Erro ao excluir contato:', err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
});

app.use(express.static(path.join(__dirname, '..')));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

init()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor ACELL Assessoria rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao inicializar o banco:', err);
    process.exit(1);
  });
