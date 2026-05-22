require('dotenv').config();
const express = require('express');
const path = require('path');
const { pool, init } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
let dbReady = false;

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Rate limit simples em memória: máx 5 envios / 10min por IP
const submitHits = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

function rateLimit(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const hits = (submitHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos.' });
  }
  hits.push(now);
  submitHits.set(ip, hits);
  next();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

 const projectRoot = path.join(__dirname, '..');
 const pagesRoot = path.join(projectRoot, 'client', 'src', 'page');

 function ensureDatabaseReady(res) {
  if (dbReady) return true;

  res.status(503).json({
    erro: 'Banco de dados temporariamente indisponível. Tente novamente em alguns instantes.',
  });
  return false;
 }

app.post('/api/contato', rateLimit, async (req, res) => {
  if (!ensureDatabaseReady(res)) return;
  let { nome, email, telefone, mensagem, website } = req.body || {};

  // Honeypot: bots costumam preencher campos ocultos
  if (website) return res.status(200).json({ sucesso: true });

  if (!nome || !email || !telefone || !mensagem) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  nome = String(nome).trim().slice(0, 120);
  email = String(email).trim().toLowerCase().slice(0, 160);
  telefone = String(telefone).trim().slice(0, 30);
  mensagem = String(mensagem).trim().slice(0, 2000);

  if (nome.length < 2) return res.status(400).json({ erro: 'Nome muito curto.' });
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ erro: 'E-mail inválido.' });
  if (telefone.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ erro: 'Telefone inválido. Inclua DDD.' });
  }
  if (mensagem.length < 10) return res.status(400).json({ erro: 'Mensagem muito curta.' });

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
  if (!ensureDatabaseReady(res)) return;
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
  if (!ensureDatabaseReady(res)) return;
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

app.use(express.static(pagesRoot));
app.use(express.static(projectRoot));

app.get('/', (req, res) => {
  res.sendFile(path.join(pagesRoot, 'index.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(pagesRoot, 'admin.html'));
});

app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(pagesRoot, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ACELL Assessoria rodando na porta ${PORT}`);
});

async function bootstrapDatabase() {
  try {
    await init();
    dbReady = true;
    console.log('Banco de dados conectado com sucesso.');
  } catch (err) {
    dbReady = false;
    console.error('Falha ao inicializar o banco:', err);
  }
}

bootstrapDatabase();

setInterval(async () => {
  if (dbReady) return;
  await bootstrapDatabase();
}, 15000);

pool.on('error', (err) => {
  dbReady = false;
  console.error('Erro inesperado no pool do banco:', err);
});
