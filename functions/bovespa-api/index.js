'use strict';

const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getContext(req) {
  const catalystApp = catalyst.initialize(req);
  const user = await catalystApp.userManagement().getCurrentUser();
  return { catalystApp, user };
}

// Remove o prefixo "TableName." dos campos retornados pelo ZCQL
function stripPrefix(row, tableName) {
  const prefix = tableName + '.';
  const result = {};
  for (const key of Object.keys(row)) {
    const newKey = key.startsWith(prefix) ? key.slice(prefix.length) : key;
    result[newKey] = row[key];
  }
  return result;
}

function handleError(res, err) {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Erro interno' });
}

// ─── /api/me ─────────────────────────────────────────────────────────────────

app.get('/api/me', async (req, res) => {
  try {
    const { user } = await getContext(req);
    res.json({
      success: true,
      data: {
        id: String(user.user_id),
        email: user.email_id,
        name: `${user.first_name} ${user.last_name}`.trim(),
      },
    });
  } catch (err) {
    res.status(401).json({ error: 'Não autenticado' });
  }
});

// ─── Transactions ─────────────────────────────────────────────────────────────

app.get('/api/transactions', async (req, res) => {
  try {
    const { catalystApp, user } = await getContext(req);
    const userId = String(user.user_id);

    const rows = await catalystApp.zcql().executeZCQLQuery(
      `SELECT ROWID, tx_id, ticker, tx_type, quantity, price, tx_date, note
       FROM Transactions
       WHERE user_id = '${userId}'`
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
    const { catalystApp, user } = await getContext(req);
    const { id, ticker, type, quantity, price, date, note } = req.body;

    if (!id || !ticker || !type || !quantity || !price || !date) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const table = catalystApp.datastore().table('Transactions');
    const inserted = await table.insertRow({
      user_id: String(user.user_id),
      tx_id: id,
      ticker: ticker.toUpperCase(),
      tx_type: type,
      quantity: Number(quantity),
      price: Number(price),
      tx_date: date,
      note: note || '',
    });

    res.status(201).json({
      success: true,
      data: { rowId: String(inserted.ROWID), id },
    });
  } catch (err) {
    handleError(res, err);
  }
});

app.delete('/api/transactions/:rowId', async (req, res) => {
  try {
    const { catalystApp } = await getContext(req);
    await catalystApp.datastore().table('Transactions').deleteRow(req.params.rowId);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  }
});

// ─── Watchlist ────────────────────────────────────────────────────────────────

app.get('/api/watchlist', async (req, res) => {
  try {
    const { catalystApp, user } = await getContext(req);
    const userId = String(user.user_id);

    const rows = await catalystApp.zcql().executeZCQLQuery(
      `SELECT ROWID, ticker, added_at, note
       FROM WatchlistItems
       WHERE user_id = '${userId}'`
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
    const { catalystApp, user } = await getContext(req);
    const { ticker, note } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker obrigatório' });
    }

    const table = catalystApp.datastore().table('WatchlistItems');
    const inserted = await table.insertRow({
      user_id: String(user.user_id),
      ticker: ticker.toUpperCase(),
      added_at: new Date().toISOString(),
      note: note || '',
    });

    res.status(201).json({
      success: true,
      data: {
        rowId: String(inserted.ROWID),
        ticker: ticker.toUpperCase(),
        addedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    handleError(res, err);
  }
});

app.delete('/api/watchlist/:rowId', async (req, res) => {
  try {
    const { catalystApp } = await getContext(req);
    await catalystApp.datastore().table('WatchlistItems').deleteRow(req.params.rowId);
    res.json({ success: true });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = app;
