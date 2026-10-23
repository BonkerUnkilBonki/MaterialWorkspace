#!/usr/bin/env node
/**
 * M3E Workspace — accounts + sync backend.
 *
 * One file. No dependencies. Run it anywhere Node runs:
 *
 *     node m3e-server.js
 *
 * It gives you: email + password accounts, a private document per account, and
 * a sync API. It prints the URL to paste into the app.
 *
 *   PORT   port to listen on            (default 8787)
 *   DATA   where data is kept           (default ./m3e-data)
 *
 * Passwords are stored as scrypt hashes with a per-user salt — never in clear.
 * Sessions are random tokens kept in memory and on disk, so a restart keeps
 * people signed in.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = parseInt(process.env.PORT || '8787', 10);
const DATA = process.env.DATA || path.join(__dirname, 'm3e-data');
const MAX = 8 * 1024 * 1024;

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
const USERS = path.join(DATA, 'users.json');
const SESS  = path.join(DATA, 'sessions.json');

function load(f, d) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } }
function save(f, v) {
  const t = f + '.' + process.pid + '.tmp';
  fs.writeFileSync(t, JSON.stringify(v));
  fs.renameSync(t, f);                       /* atomic */
}

let users = load(USERS, {});                  /* email -> {salt, hash, made} */
let sessions = load(SESS, {});                /* token -> email */

const keyOf = email => crypto.createHash('sha256').update('m3e:' + email).digest('hex');
const docFile = email => path.join(DATA, keyOf(email) + '.json');

function hashPw(pw, salt) { return crypto.scryptSync(pw, salt, 64).toString('hex'); }
function makeToken() { return crypto.randomBytes(32).toString('hex'); }
function validEmail(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); }

function send(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(obj));
}
function body(req, cb) {
  let b = '';
  let over = false;
  req.on('data', c => { b += c; if (b.length > MAX) { over = true; req.destroy(); } });
  req.on('end', () => cb(over ? null : b));
}
const whoami = req => {
  const u = new URL(req.url, 'http://localhost');
  const t = ((req.headers.authorization || '').replace(/^Bearer\s+/i, '') || u.searchParams.get('token') || '').trim();
  return t && sessions[t] ? sessions[t] : null;
};

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') return send(res, 204, {});

  if (url.pathname === '/health') return send(res, 200, { ok: true, users: Object.keys(users).length });

  /* ---- create an account ---- */
  if (url.pathname === '/signup' && (req.method === 'POST' || req.method === 'PUT')) {
    return body(req, b => {
      let d; try { d = JSON.parse(b); } catch (e) { return send(res, 400, { error: 'bad request' }); }
      const email = String(d.email || '').trim().toLowerCase();
      const pw = String(d.password || '');
      if (!validEmail(email)) return send(res, 400, { error: 'that does not look like an email' });
      if (pw.length < 6) return send(res, 400, { error: 'password must be at least 6 characters' });
      if (users[email]) return send(res, 409, { error: 'an account with that email already exists' });
      const salt = crypto.randomBytes(16).toString('hex');
      users[email] = { salt, hash: hashPw(pw, salt), made: Date.now() };
      save(USERS, users);
      const token = makeToken();
      sessions[token] = email;
      save(SESS, sessions);
      send(res, 200, { ok: true, token, email });
    });
  }

  /* ---- sign in ---- */
  if (url.pathname === '/login' && (req.method === 'POST' || req.method === 'PUT')) {
    return body(req, b => {
      let d; try { d = JSON.parse(b); } catch (e) { return send(res, 400, { error: 'bad request' }); }
      const email = String(d.email || '').trim().toLowerCase();
      const pw = String(d.password || '');
      const u = users[email];
      if (!u || hashPw(pw, u.salt) !== u.hash) return send(res, 401, { error: 'email or password is wrong' });
      const token = makeToken();
      sessions[token] = email;
      save(SESS, sessions);
      send(res, 200, { ok: true, token, email });
    });
  }

  /* ---- the document ---- */
  if (url.pathname === '/doc') {
    const email = whoami(req);
    if (!email) return send(res, 401, { error: 'please sign in' });
    if (req.method === 'GET') {
      try { return send(res, 200, JSON.parse(fs.readFileSync(docFile(email), 'utf8'))); }
      catch (e) { return send(res, 200, {}); }
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      return body(req, b => {
        try { JSON.parse(b); } catch (e) { return send(res, 400, { error: 'not JSON' }); }
        try { save(docFile(email), JSON.parse(b)); send(res, 200, { ok: true }); }
        catch (e) { send(res, 500, { error: 'could not save' }); }
      });
    }
  }

  send(res, 404, { error: 'not found' });
}).listen(PORT, () => {
  console.log('');
  console.log('  M3E Workspace — accounts + sync server');
  console.log('  ------------------------------------------------');
  console.log('  URL:  http://<this-machine>:' + PORT);
  console.log('  Data: ' + DATA);
  console.log('  Users: ' + Object.keys(users).length);
  console.log('');
  console.log('  In the app:  Sync -> My account -> paste the URL,');
  console.log('               then create an account or sign in.');
  console.log('');
});
