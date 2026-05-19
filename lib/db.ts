import path from 'path';
import fs from 'fs';
import { SEED_EVENTS } from '@/types';

// We lazy-load sql.js and keep a singleton DB in memory
// The DB is loaded from disk on startup and saved on every write

let db: import('sql.js').Database | null = null;

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.join(process.cwd(), 'chronos.db');

async function getDB() {
  if (db) return db;

  const initSqlJs = (await import('sql.js')).default;
  const wasmPath = require("path").join(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm");
  const SQL = await initSqlJs({ locateFile: () => wasmPath });

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    createSchema(db);
    seedData(db);
    persist(db);
  }

  return db;
}

function persist(database: import('sql.js').Database) {
  const data = database.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function createSchema(database: import('sql.js').Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS events (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      date       TEXT    NOT NULL,
      time       TEXT    NOT NULL DEFAULT '09:00',
      category   TEXT    NOT NULL DEFAULT 'launch',
      desc       TEXT    NOT NULL DEFAULT '',
      emailNotif INTEGER NOT NULL DEFAULT 1,
      waNotif    INTEGER NOT NULL DEFAULT 1,
      createdAt  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT NOT NULL,
      email     TEXT NOT NULL UNIQUE,
      phone     TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notif_log (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      subscriberName TEXT NOT NULL,
      eventName      TEXT NOT NULL,
      channel        TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'delivered',
      sentAt         TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seedData(database: import('sql.js').Database) {
  const stmt = database.prepare(`
    INSERT INTO events (name, date, time, category, desc, emailNotif, waNotif)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const e of SEED_EVENTS) {
    stmt.run([e.name, e.date, e.time, e.category, e.desc, e.emailNotif ? 1 : 0, e.waNotif ? 1 : 0]);
  }
  stmt.free();
}

// ── Events ──────────────────────────────────────────────────────────────────

export async function getAllEvents() {
  const database = await getDB();
  const result = database.exec('SELECT * FROM events ORDER BY date ASC');
  if (!result.length) return [];
  return rowsToObjects(result[0]);
}

export async function createEvent(data: {
  name: string; date: string; time: string; category: string;
  desc: string; emailNotif: boolean; waNotif: boolean;
}) {
  const database = await getDB();
  database.run(
    `INSERT INTO events (name, date, time, category, desc, emailNotif, waNotif)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.date, data.time, data.category, data.desc, data.emailNotif ? 1 : 0, data.waNotif ? 1 : 0]
  );
  persist(database);
  const result = database.exec('SELECT * FROM events WHERE id = last_insert_rowid()');
  return rowsToObjects(result[0])[0];
}

export async function updateEvent(id: number, data: Partial<{
  name: string; date: string; time: string; category: string;
  desc: string; emailNotif: boolean; waNotif: boolean;
}>) {
  const database = await getDB();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data).map(v => typeof v === 'boolean' ? (v ? 1 : 0) : v);
  database.run(`UPDATE events SET ${fields} WHERE id = ?`, [...values, id]);
  persist(database);
}

export async function deleteEvent(id: number) {
  const database = await getDB();
  database.run('DELETE FROM events WHERE id = ?', [id]);
  persist(database);
}

// ── Subscribers ──────────────────────────────────────────────────────────────

export async function getAllSubscribers() {
  const database = await getDB();
  const result = database.exec('SELECT * FROM subscribers ORDER BY name ASC');
  if (!result.length) return [];
  return rowsToObjects(result[0]);
}

export async function createSubscriber(data: { name: string; email: string; phone: string }) {
  const database = await getDB();
  database.run(
    'INSERT OR IGNORE INTO subscribers (name, email, phone) VALUES (?, ?, ?)',
    [data.name, data.email, data.phone]
  );
  persist(database);
}

export async function deleteSubscriber(id: number) {
  const database = await getDB();
  database.run('DELETE FROM subscribers WHERE id = ?', [id]);
  persist(database);
}

// ── Notification log ─────────────────────────────────────────────────────────

export async function getAllLogs() {
  const database = await getDB();
  const result = database.exec('SELECT * FROM notif_log ORDER BY sentAt DESC');
  if (!result.length) return [];
  return rowsToObjects(result[0]);
}

export async function createLog(data: {
  subscriberName: string; eventName: string; channel: string; status: string;
}) {
  const database = await getDB();
  database.run(
    'INSERT INTO notif_log (subscriberName, eventName, channel, status) VALUES (?, ?, ?, ?)',
    [data.subscriberName, data.eventName, data.channel, data.status]
  );
  persist(database);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function rowsToObjects(result: import('sql.js').QueryExecResult) {
  return result.values.map(row => {
    const obj: Record<string, unknown> = {};
    result.columns.forEach((col, i) => {
      const val = row[i];
      // Convert 0/1 integers back to booleans for known boolean columns
      if ((col === 'emailNotif' || col === 'waNotif') && typeof val === 'number') {
        obj[col] = val === 1;
      } else {
        obj[col] = val;
      }
    });
    return obj;
  });
}
