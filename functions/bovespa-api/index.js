'use strict';

/*
 * TABELAS NECESSÁRIAS NO CATALYST DATA STORE (projeto newppp):
 *
 * Tabela: Users
 *   email         varchar(100)  único, obrigatório
 *   name          varchar(100)  obrigatório
 *   password_hash varchar(100)  obrigatório
 *
 * Tabelas Transactions e WatchlistItems já foram criadas via MCP.
 */

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'bovespa-manager-dev-secret';
const JWT_EXPIRY = '7d';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initCatalyst(req) {
  return catalyst.initialize(req, { type: 'function' });
}

function getUserFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    const err = new Error('Não autenticado');
    err.status = 401;
    throw err;
  }
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET);
  } catch {
    const err = new Error('Token inválido ou expirado. Faça login novamente.');
    err.status = 401;
    throw err;
  }
}

// Remove prefixo "TableName." dos campos retornados pelo ZCQL
function stripPrefix(row, tableName) {
  const prefix = tableName + '.';
  const result = {};
  for (const key of Object.keys(row)) {
    result[key.startsWith(prefix) ? key.slice(prefix.length) : key] = row[key];
  }
  return result;
}

function handleError(res, err) {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
}

function safeStr(value) {
  return String(value).replace(/'/g, "''");
}

// ─── Auth: Cadastro ───────────────────────────────────────────────────────────

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const catalystApp = initCatalyst(req);
    const safeEmail = safeStr(email.toLowerCase().trim());

    const existing = await catalystApp.zcql().executeZCQLQuery(
      `SELECT ROWID FROM Users WHERE email = '${safeEmail}'`
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const inserted = await catalystApp.datastore().table('Users').insertRow({
      email: safeEmail,
      name: name.trim(),
      password_hash: passwordHash,
    });

    const userId = String(inserted.ROWID);
    const token = jwt.sign(
      { userId, email: safeEmail, name: name.trim() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, email: safeEmail, name: name.trim() },
    });
  } catch (err) {
    handleError(res, err);
  }
});

// ─── Auth: Login ──────────────────────────────────────────────────────────────

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const catalystApp = initCatalyst(req);
    const safeEmail = safeStr(email.toLowerCase().trim());

    const rows = await catalystApp.zcql().executeZCQLQuery(
      `SELECT ROWID, email, name, password_hash FROM Users WHERE email = '${safeEmail}'`
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const row = stripPrefix(rows[0], 'Users');
    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const userId = String(row.ROWID);
    const token = jwt.sign(
      { userId, email: row.email, name: row.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
      user: { id: userId, email: row.email, name: row.name },
    });
  } catch (err) {
    handleError(res, err);
  }
});

// ─── Auth: Usuário atual ──────────────────────────────────────────────────────

app.get('/api/me', (req, res) => {
  try {
    const { userId, email, name } = getUserFromToken(req);
    res.json({ success: true, data: { id: userId, email, name } });
  } catch (err) {
    res.status(401).json({ error: 'Não autenticado' });
  }
});

// ─── Transactions ─────────────────────────────────────────────────────────────

app.get('/api/transactions', async (req, res) => {
  try {
    const { userId } = getUserFromToken(req);
    const catalystApp = initCatalyst(req);

    const rows = await catalystApp.zcql().executeZCQLQuery(
      `SELECT ROWID, tx_id, ticker, tx_type, quantity, price, tx_date, note
       FROM Transactions WHERE user_id = '${safeStr(userId)}'`
    );

    const data = rows.map((r) => {
      const row = stripPrefix(r, 'Transactions');
      return {
        rowId: row.ROWID,
        id: row.tx_id,
        ticker: row.ticker,
        type: row.tx_type,
        quantity: Number(row.quantity),
        price: Number(row.price),
        date: row.tx_date,
        note: row.note || undefined,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { userId } = getUserFromToken(req);
    const { id, ticker, type, quantity, price, date, note } = req.body;

    if (!id || !ticker || !type || !quantity || !price || !date) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const catalystApp = initCatalyst(req);
    const inserted = await catalystApp.datastore().table('Transactions').insertRow({
      user_id: userId,
      tx_id: id,
      ticker: ticker.toUpperCase(),
      tx_type: type,
      quantity: Number(quantity),
      price: Number(price),
      tx_date: date,
      note: note || '',
    });

    res.status(201).json({ success: true, data: { rowId: String(inserted.ROWID), id } });
  } catch (err) {
    handleError(res, err);
  }
});

app.delete('/api/transactions/:rowId', async (req, res) => {
  try {
    getUserFromToken(req);
    const catalystApp = initCatalyst(req);
    await catalystApp.datastore().table('Transactions').deleteRow(req.params.rowId);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  }
});

// ─── Watchlist ────────────────────────────────────────────────────────────────

app.get('/api/watchlist', async (req, res) => {
  try {
    const { userId } = getUserFromToken(req);
    const catalystApp = initCatalyst(req);

    const rows = await catalystApp.zcql().executeZCQLQuery(
      `SELECT ROWID, ticker, added_at, note
       FROM WatchlistItems WHERE user_id = '${safeStr(userId)}'`
    );

    const data = rows.map((r) => {
      const row = stripPrefix(r, 'WatchlistItems');
      return {
        rowId: row.ROWID,
        ticker: row.ticker,
        addedAt: row.added_at,
        note: row.note || undefined,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/watchlist', async (req, res) => {
  try {
    const { userId } = getUserFromToken(req);
    const { ticker, note } = req.body;

    if (!ticker) return res.status(400).json({ error: 'Ticker obrigatório.' });

    const catalystApp = initCatalyst(req);
    const addedAt = new Date().toISOString();
    const inserted = await catalystApp.datastore().table('WatchlistItems').insertRow({
      user_id: userId,
      ticker: ticker.toUpperCase(),
      added_at: addedAt,
      note: note || '',
    });

    res.status(201).json({
      success: true,
      data: { rowId: String(inserted.ROWID), ticker: ticker.toUpperCase(), addedAt },
    });
  } catch (err) {
    handleError(res, err);
  }
});

app.delete('/api/watchlist/:rowId', async (req, res) => {
  try {
    getUserFromToken(req);
    const catalystApp = initCatalyst(req);
    await catalystApp.datastore().table('WatchlistItems').deleteRow(req.params.rowId);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = app;
