/**
 * MedAI-CV — Lightweight Hospital PoC Server with Built-in SQLite3
 * Serves Static Web Assets and Clinical REST APIs
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database', 'medai.db');

// Ensure DB exists
if (!fs.existsSync(DB_PATH)) {
  console.log('Database not found. Running init_db.js...');
  require('./database/init_db.js');
}

const db = new DatabaseSync(DB_PATH);

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // ==========================================
  // REST API ENDPOINTS (SQLITE3)
  // ==========================================

  // 1. GET /api/roles
  if (req.method === 'GET' && pathname === '/api/roles') {
    try {
      const roles = db.prepare('SELECT * FROM roles').all();
      const permissions = db.prepare('SELECT role_code, menu_id FROM role_menus WHERE can_access = 1').all();

      const response = roles.map(r => ({
        ...r,
        allowedMenus: permissions.filter(p => p.role_code === r.code).map(p => p.menu_id),
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, source: 'sqlite3', data: response }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 2. GET /api/studies
  if (req.method === 'GET' && pathname === '/api/studies') {
    try {
      const query = `
        SELECT s.*, w.label as state_label, w.actor_role,
               u.name as doctor_name
        FROM studies s
        LEFT JOIN workflow_states w ON s.state_code = w.code
        LEFT JOIN users u ON s.assigned_doctor_id = u.id
      `;
      const studies = db.prepare(query).all();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, source: 'sqlite3', data: studies }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 3. POST /api/studies/action (Update study state)
  if (req.method === 'POST' && pathname === '/api/studies/action') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { studyId, nextState } = JSON.parse(body);
        const updateStmt = db.prepare('UPDATE studies SET state_code = ? WHERE id = ?');
        updateStmt.run(nextState, studyId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Studi ${studyId} berhasil diperbarui di SQLite3 ke state: ${nextState}` }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // ==========================================
  // STATIC ASSETS SERVING
  // ==========================================
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Safety check to prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` MedAI-CV Hospital PoC Server Active!`);
  console.log(` Local URL : http://localhost:${PORT}`);
  console.log(` Database  : SQLite3 (${DB_PATH})`);
  console.log(`=================================================`);
});

