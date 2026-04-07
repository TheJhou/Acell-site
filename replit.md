# ACELL ASSESSORIA - Static Website

## Project Overview
A static website for ACELL ASSESSORIA, a Brazilian accounting and business consultancy firm.

## Tech Stack
- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (no build system)
- **Packages:** External CDN only (Font Awesome, Google Fonts)
- **Server:** `serve` (npm global package) for static file serving

## Project Structure
- `index.html` - Main landing page (hero, services overview, contact form)
- `servicos.html` - Detailed services page with category filtering
- `style.css` - All styles including responsive design
- `script.js` - Interactivity: menu, animations, WhatsApp form, service filtering

## Running the App
The workflow runs: `npx serve . -l 5000`
This serves all static files on port 5000.

## Deployment
Configured as a static site served via the `serve` npm package on port 5000.
