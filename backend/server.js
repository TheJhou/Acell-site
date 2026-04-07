const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/api/contato', (req, res) => {
  const { nome, email, telefone, mensagem } = req.body;

  if (!nome || !email || !telefone || !mensagem) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO contatos (nome, email, telefone, mensagem) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(nome, email, telefone, mensagem);
    res.status(201).json({ sucesso: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('Erro ao salvar contato:', err);
    res.status(500).json({ erro: 'Erro interno ao salvar dados.' });
  }
});

app.get('/api/contatos', (req, res) => {
  const senha = req.headers['x-admin-key'];
  if (senha !== (process.env.ADMIN_KEY || 'acell2024')) {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }
  const contatos = db.prepare('SELECT * FROM contatos ORDER BY criado_em DESC').all();
  res.json(contatos);
});

app.delete('/api/contatos/:id', (req, res) => {
  const senha = req.headers['x-admin-key'];
  if (senha !== (process.env.ADMIN_KEY || 'acell2024')) {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }
  const { id } = req.params;
  db.prepare('DELETE FROM contatos WHERE id = ?').run(id);
  res.json({ sucesso: true });
});

app.use(express.static(path.join(__dirname, '..')));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ACELL Assessoria rodando na porta ${PORT}`);
});
