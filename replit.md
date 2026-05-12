# ACELL ASSESSORIA - Website com Backend

## Project Overview
A website for ACELL ASSESSORIA, a Brazilian accounting and business consultancy firm.
Includes a Node.js/Express backend with PostgreSQL database for lead (customer data) collection.

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express 5
- **Database:** PostgreSQL via `pg` (connection string em `DATABASE_URL`)
- **External CDN:** Font Awesome, Google Fonts

## Project Structure
```
/
├── index.html          Main landing page
├── servicos.html       Services page with category filtering
├── admin.html          Admin panel for viewing captured leads
├── style.css           All styles
├── script.js           Frontend logic (form, animations, filters)
├── backend/
│   ├── server.js       Express server (serves static + API on port 5000)
│   └── database.js     PostgreSQL pool + table init (lê DATABASE_URL)
├── .env                Variáveis de ambiente (NÃO versionar)
├── .env.example        Exemplo de configuração
└── package.json        Node dependencies
```

## API Endpoints
- `POST /api/contato` — Save a customer lead (nome, email, telefone, mensagem)
- `GET  /api/contatos` — List all leads (requires header `x-admin-key: acell2024`)
- `DELETE /api/contatos/:id` — Delete a lead (requires `x-admin-key` header)

## Admin Panel
Access `/admin.html` and enter the key `acell2024` to view all collected leads.
Change the key via environment variable `ADMIN_KEY`.

## Running the App
Workflow command: `node backend/server.js`
Serves everything (static files + API) on port 5000.
