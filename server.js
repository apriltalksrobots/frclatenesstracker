#!/usr/bin/env node
/**
 * FRC Tools — Local TBA Proxy Server
 *
 * Usage:
 *   TBA_API_KEY=your_key_here node server.js
 *
 * Or with a .env file:
 *   echo "TBA_API_KEY=your_key_here" > .env
 *   node server.js
 *
 * Then open:
 *   http://localhost:3000/frc_lateness_tracker.html
 *   http://localhost:3000/frc_match_timer.html
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env file if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
    });
}

const TBA_KEY = process.env.TBA_API_KEY;
const PORT = process.env.PORT || 3000;
const TBA_BASE = 'www.thebluealliance.com';

const ALLOWED_PREFIXES = ['/event/', '/team/', '/events/', '/teams/', '/district/', '/status'];

const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

if (!TBA_KEY) {
  console.error('ERROR: TBA_API_KEY environment variable is not set.');
  console.error('');
  console.error('Set it by running:');
  console.error('  TBA_API_KEY=your_key_here node server.js');
  console.error('');
  console.error('Or create a .env file in this directory:');
  console.error('  echo "TBA_API_KEY=your_key_here" > .env');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // TBA API proxy
  if (ALLOWED_PREFIXES.some(p => pathname.startsWith(p))) {
    if (!TBA_KEY) {
      res.writeHead(500, corsHeaders({ 'Content-Type': 'application/json' }));
      res.end(JSON.stringify({ error: 'TBA_API_KEY not configured' }));
      return;
    }

    const tbaPath = `/api/v3${pathname}${url.search}`;
    const options = {
      hostname: TBA_BASE,
      path: tbaPath,
      method: 'GET',
      headers: {
        'X-TBA-Auth-Key': TBA_KEY,
        'Accept': 'application/json',
      },
    };

    const proxyReq = https.request(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, corsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
      }));
      proxyRes.pipe(res);
    });

    proxyReq.on('error', e => {
      res.writeHead(502, corsHeaders({ 'Content-Type': 'application/json' }));
      res.end(JSON.stringify({ error: 'Upstream error', detail: e.message }));
    });

    proxyReq.end();
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders({}));
    res.end();
    return;
  }

  // Serve static files
  let filePath = pathname === '/' ? '/frc_lateness_tracker.html' : pathname;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
    res.end(data);
  });
});

function corsHeaders(extra) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extra,
  };
}

server.listen(PORT, () => {
  console.log(`FRC Tools running at http://localhost:${PORT}`);
  console.log('');
  console.log('  Lateness tracker: http://localhost:' + PORT + '/frc_lateness_tracker.html');
  console.log('  Match timer:      http://localhost:' + PORT + '/frc_match_timer.html');
  console.log('');
  console.log('Press Ctrl+C to stop.');
});
