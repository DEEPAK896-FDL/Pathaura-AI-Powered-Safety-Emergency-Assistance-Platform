const http = require('http');
const fs = require('fs');
const path = require('path');
const { connectDB, closeDB, seedDefaults } = require('./backend/database/db');
const { handleApiRequest } = require('./backend/api');

const PORT = process.env.PORT || 3000;
const FRONTEND_ROOT = path.join(__dirname, 'frontend');

let db = null;

const server = http.createServer(async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = requestUrl.pathname;

    if (pathname.startsWith('/api')) {
      await handleApiRequest(req, res);
      return;
    }

    const safePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(FRONTEND_ROOT, safePath);

    if (!filePath.startsWith(FRONTEND_ROOT)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      }[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
  }
});

async function startServer() {
  try {
    db = await connectDB();
    await seedDefaults();
    server.listen(PORT, () => {
      console.log(`\nPathaura backend running on http://localhost:${PORT}`);
      console.log(`MongoDB status: ${db ? 'connected' : 'using in-memory fallback'}`);
    });

    process.on('SIGINT', async () => {
      console.log('\nShutting down server...');
      server.close(async () => {
        await closeDB();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = server;
