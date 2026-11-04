#!/usr/bin/env node
// Agent Office — local mode. Zero dependencies (Node >= 18).
//
// Agents report by writing one JSON file per desk:
//   <project>/.agent-office/desks/<id>.json   →  { role, status, label, session, updatedAt }
// Deleting the file removes the desk. This server is read-only: it serves the page
// and streams the desks; it never writes them.
//
//   node server.js [--dir <path>]... [--port <n>] [--host <h>]
//
// Routes: GET /  (the page) · GET /api/desks (JSON array) · GET /api/events (SSE "desks")
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ID_RE = /^[A-Za-z0-9._~-]+$/;
const DEBOUNCE_MS = 150;
const POLL_MS = 2000;
const PING_MS = 25000;
const PAGE_FILE = path.join(__dirname, 'office-dashboard.html');

function parseArgs(argv) {
  const opts = { dirs: [], port: null, host: '127.0.0.1' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) { console.error(`Missing value for ${a}`); process.exit(2); }
      return v;
    };
    if (a === '--dir') opts.dirs.push(next());
    else if (a.startsWith('--dir=')) opts.dirs.push(a.slice(6));
    else if (a === '--port') opts.port = next();
    else if (a.startsWith('--port=')) opts.port = a.slice(7);
    else if (a === '--host') opts.host = next();
    else if (a.startsWith('--host=')) opts.host = a.slice(7);
    else if (a === '-h' || a === '--help') {
      console.log('Usage: agent-office [--dir <path>]... [--port <n>] [--host <h>]\n' +
        '  --dir   folder holding a desks/ subfolder (repeatable, default ./.agent-office)\n' +
        '  --port  default 4317 (or env AGENT_OFFICE_PORT)\n' +
        '  --host  default 127.0.0.1');
      process.exit(0);
    } else { console.error(`Unknown option: ${a}`); process.exit(2); }
  }
  if (!opts.dirs.length) opts.dirs.push('./.agent-office');
  const port = Number(opts.port != null ? opts.port : (process.env.AGENT_OFFICE_PORT || 4317));
  if (!Number.isInteger(port) || port < 0 || port > 65535) { console.error(`Bad port: ${opts.port}`); process.exit(2); }
  opts.port = port;
  opts.deskDirs = opts.dirs.map((d) => path.join(path.resolve(d), 'desks'));
  return opts;
}

function isLoopback(host) {
  return host === 'localhost' || host === '::1' || /^127\./.test(host);
}

// A desk file worth reading: <id>.json, not a temp/backup file.
function deskId(name) {
  if (!name.endsWith('.json')) return null;
  const id = name.slice(0, -5);
  if (!id || id.startsWith('.') || !ID_RE.test(id)) return null;
  return id;
}

function listDeskFiles(dir) {
  try { return fs.readdirSync(dir).filter((n) => deskId(n)).sort(); } catch (e) { return []; }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));

  for (const d of opts.deskDirs) {
    try { fs.mkdirSync(d, { recursive: true }); } catch (e) { console.error(`Cannot create ${d}: ${e.message}`); }
  }

  // Last good parse per file, so a half-written file keeps its previous content until it parses.
  const lastGood = new Map();   // fullPath -> { mtimeMs, desk }
  let desksJson = '[]';
  let lastSignature = '';

  function signature() {
    const parts = [];
    for (const dir of opts.deskDirs) {
      for (const name of listDeskFiles(dir)) {
        let st;
        try { st = fs.statSync(path.join(dir, name)); } catch (e) { continue; }
        parts.push(`${dir}|${name}|${st.mtimeMs}|${st.size}`);
      }
    }
    return parts.join('\n');
  }

  function readAll() {
    const byId = new Map();
    const seen = new Set();
    for (const dir of opts.deskDirs) {
      for (const name of listDeskFiles(dir)) {
        const full = path.join(dir, name);
        seen.add(full);
        let desk = null;
        try {
          const raw = fs.readFileSync(full, 'utf8').replace(/^﻿/, '');
          const obj = JSON.parse(raw);
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            desk = Object.assign({}, obj, { id: deskId(name) });
            lastGood.set(full, desk);
          }
        } catch (e) {
          desk = lastGood.has(full) ? lastGood.get(full) : null;   // half-written: keep old, retry next change
        }
        if (desk) { byId.delete(desk.id); byId.set(desk.id, desk); }   // last dir wins
      }
    }
    for (const k of lastGood.keys()) if (!seen.has(k)) lastGood.delete(k);
    return Array.from(byId.values());
  }

  const clients = new Set();

  function broadcast() {
    const msg = `event: desks\ndata: ${desksJson}\n\n`;
    for (const res of clients) { try { res.write(msg); } catch (e) {} }
  }

  function refresh() {
    lastSignature = signature();
    const next = JSON.stringify(readAll());
    if (next !== desksJson) { desksJson = next; broadcast(); }
  }

  let debounce = null;
  function scheduleRefresh() {
    clearTimeout(debounce);
    debounce = setTimeout(refresh, DEBOUNCE_MS);
  }

  refresh();

  const watchers = [];
  for (const dir of opts.deskDirs) {
    try {
      const w = fs.watch(dir, { persistent: true }, () => scheduleRefresh());
      w.on('error', () => {});   // e.g. dir removed; polling still covers it
      watchers.push(w);
    } catch (e) { /* polling fallback below */ }
  }

  // fs.watch is unreliable on Windows / network drives: compare a cheap signature too.
  // Also retries files that failed to parse (their mtime/size changes when the write finishes).
  const pollTimer = setInterval(() => {
    for (const d of opts.deskDirs) { if (!fs.existsSync(d)) { try { fs.mkdirSync(d, { recursive: true }); } catch (e) {} } }
    if (signature() !== lastSignature) refresh();
  }, POLL_MS);

  const pingTimer = setInterval(() => {
    for (const res of clients) { try { res.write(': ping\n\n'); } catch (e) {} }
  }, PING_MS);

  const server = http.createServer((req, res) => {
    const url = (req.url || '/').split('?')[0];
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
      res.end('Method not allowed (read-only)\n');
      return;
    }
    if (url === '/' || url === '/index.html' || url === '/office-dashboard.html') {
      fs.readFile(PAGE_FILE, (err, buf) => {
        if (err) { res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('office-dashboard.html not found\n'); return; }
        // The page is an artifact fragment (claude.ai adds the document skeleton); add one here
        // so it does not render in quirks mode.
        let body = buf.toString('utf8').replace(/^﻿/, '');
        if (!/^\s*<!doctype/i.test(body)) {
          body = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>\n<body>\n' +
            body + '\n</body>\n</html>\n';
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(req.method === 'HEAD' ? undefined : body);
      });
      return;
    }
    if (url === '/api/desks') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : desksJson);
      return;
    }
    if (url === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      });
      if (req.method === 'HEAD') { res.end(); return; }
      res.write('retry: 2000\n\n');
      res.write(`event: desks\ndata: ${desksJson}\n\n`);
      clients.add(res);
      const drop = () => clients.delete(res);
      req.on('close', drop);
      res.on('error', drop);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found\n');
  });

  server.on('error', (e) => {
    console.error(e.code === 'EADDRINUSE' ? `Port ${opts.port} is already in use (try --port <n>).` : `Server error: ${e.message}`);
    process.exit(1);
  });

  server.listen(opts.port, opts.host, () => {
    const addr = server.address();
    const shownHost = opts.host.includes(':') ? `[${opts.host}]` : opts.host;
    console.log(`Agent Office (local) → http://${shownHost}:${addr.port}/`);
    console.log('Watching desks in:');
    for (const d of opts.deskDirs) console.log(`  ${d}`);
    if (!isLoopback(opts.host)) {
      console.warn(`Warning: listening on ${opts.host}, not loopback — anyone who can reach this address can see the desks.`);
    }
  });

  let stopping = false;
  function shutdown() {
    if (stopping) return;
    stopping = true;
    clearInterval(pollTimer);
    clearInterval(pingTimer);
    clearTimeout(debounce);
    for (const w of watchers) { try { w.close(); } catch (e) {} }
    for (const res of clients) { try { res.end(); } catch (e) {} }
    clients.clear();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1000).unref();
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
