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

// ================= SECURITY HEADERS =================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: https://placehold.co",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// ================= CORS =================
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || null;

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) || !ALLOWED_ORIGIN) {
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Rate limit simples em memória: máx 5 envios / 10min por IP
const submitHits = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

function rateLimit(req, res, next) {
  // req.ip já é sanitizado pelo Express com trust proxy; x-forwarded-for só como fallback
  const rawIp = req.ip || (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const ip = rawIp.replace(/[^a-f0-9.:]/gi, '').slice(0, 45) || 'unknown';
  const now = Date.now();
  const hits = (submitHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos.' });
  }
  hits.push(now);
  submitHits.set(ip, hits);
  next();
}

// Limpeza periódica do Map para evitar crescimento ilimitado (memory leak / DoS)
setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of submitHits.entries()) {
    const valid = hits.filter((t) => now - t < RATE_WINDOW_MS);
    if (valid.length === 0) submitHits.delete(ip);
    else submitHits.set(ip, valid);
  }
}, RATE_WINDOW_MS);

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
  let { nome, email, telefone, mensagem, website, servicos } = req.body || {};

  // Honeypot: bots costumam preencher campos ocultos
  if (website) return res.status(200).json({ sucesso: true });

  if (!nome || !email || !telefone) {
    return res.status(400).json({ erro: 'Nome, e-mail e telefone são obrigatórios.' });
  }

  nome = String(nome).trim().slice(0, 120);
  email = String(email).trim().toLowerCase().slice(0, 160);
  telefone = String(telefone).trim().slice(0, 30);
  mensagem = String(mensagem).trim().slice(0, 2000);
  servicos = Array.isArray(servicos)
    ? servicos
      .map((servico) => String(servico).trim().slice(0, 120))
      .filter((servico, index, array) => servico && array.indexOf(servico) === index)
    : [];

  if (nome.length < 2) return res.status(400).json({ erro: 'Nome muito curto.' });
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ erro: 'E-mail inválido.' });
  if (telefone.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ erro: 'Telefone inválido. Inclua DDD.' });
  }
  if (mensagem && mensagem.length < 10) return res.status(400).json({ erro: 'Mensagem muito curta.' });
  if (servicos.length > 15) return res.status(400).json({ erro: 'Selecione no máximo 15 serviços.' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO contatos (nome, email, telefone, mensagem, servicos) VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING id',
      [nome, email, telefone, mensagem, JSON.stringify(servicos)]
    );
    res.status(201).json({ sucesso: true, id: rows[0].id });
  } catch (err) {
    console.error('Erro ao salvar contato:', err);
    res.status(500).json({ erro: 'Erro interno ao salvar dados.' });
  }
});

app.get('/api/contatos', async (req, res) => {
  if (!ensureDatabaseReady(res)) return;
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
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
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }
  try {
    await pool.query('DELETE FROM contatos WHERE id = $1', [id]);
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
