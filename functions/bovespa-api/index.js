'use strict';

/*
 * Autenticação gerenciada pelo Catalyst User Management (nativo).
 * Não há senhas, hashes ou JWT customizados aqui.
 *
 * Tabelas necessárias no Data Store (projeto newppp):
 *   Transactions  – já criadas via MCP
 *   WatchlistItems – já criadas via MCP
 *
 * Usuários são gerenciados pelo Catalyst (console → User Management).
 */

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthUser(req) {
  const catalystApp = catalyst.initialize(req);
  const user = await catalystApp.userManagement().getCurrentUser();
  if (!user) throw Object.assign(new Error('Não autenticado'), { status: 401 });
  return { catalystApp, user };
}

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

function safeStr(v) {
  return String(v).replace(/'/g, "''");
}

// ─── Usuário atual ────────────────────────────────────────────────────────────

app.get('/api/me', async (req, res) => {
  try {
    const { user } = await getAuthUser(req);
    res.json({
      success: true,
      data: {
        id: String(user.user_id),
        email: user.email_id,
        name: `${user.first_name} ${user.last_name}`.trim(),
      },
    });
  } catch {
    res.status(401).json({ error: 'Não autenticado' });
  }
});

// ─── Transactions ─────────────────────────────────────────────────────────────

app.get('/api/transactions', async (req, res) => {
  try {
    const { catalystApp, user } = await getAuthUser(req);
    const userId = safeStr(user.user_id);

    const rows = await catalystApp.zcql().executeZCQLQuery(
      `SELECT ROWID, tx_id, ticker, tx_type, quantity, price, tx_date, note
       FROM Transactions WHERE user_id = '${userId}'`
    );

    res.json({
      success: true,
      data: rows.map((r) => {
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
      }),
    });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { catalystApp, user } = await getAuthUser(req);
    const { id, ticker, type, quantity, price, date, note } = req.body;

    if (!id || !ticker || !type || !quantity || !price || !date) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const inserted = await catalystApp.datastore().table('Transactions').insertRow({
      user_id: String(user.user_id),
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
    const { catalystApp } = await getAuthUser(req);
    await catalystApp.datastore().table('Transactions').deleteRow(req.params.rowId);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  }
});

// ─── Watchlist ────────────────────────────────────────────────────────────────

app.get('/api/watchlist', async (req, res) => {
  try {
    const { catalystApp, user } = await getAuthUser(req);
    const userId = safeStr(user.user_id);

    const rows = await catalystApp.zcql().executeZCQLQuery(
      `SELECT ROWID, ticker, added_at, note
       FROM WatchlistItems WHERE user_id = '${userId}'`
    );

    res.json({
      success: true,
      data: rows.map((r) => {
        const row = stripPrefix(r, 'WatchlistItems');
        return {
          rowId: row.ROWID,
          ticker: row.ticker,
          addedAt: row.added_at,
          note: row.note || undefined,
        };
      }),
    });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/watchlist', async (req, res) => {
  try {
    const { catalystApp, user } = await getAuthUser(req);
    const { ticker, note } = req.body;

    if (!ticker) return res.status(400).json({ error: 'Ticker obrigatório.' });

    const addedAt = new Date().toISOString();
    const inserted = await catalystApp.datastore().table('WatchlistItems').insertRow({
      user_id: String(user.user_id),
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
    const { catalystApp } = await getAuthUser(req);
    await catalystApp.datastore().table('WatchlistItems').deleteRow(req.params.rowId);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = app;
