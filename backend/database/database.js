import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.resolve(new URL('..', import.meta.url).pathname, 'receitas.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Erro ao conectar ao SQLite:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite 'receitas.db'");
  }
});

export default db;