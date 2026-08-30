/**
 * db.js
 * -----
 * Loads sql.js (SQLite compiled to WebAssembly) in the browser and opens
 * data/blog.db, a real SQLite database. This is how the site stays static
 * (works on GitHub Pages, no server needed) while still being backed by
 * an actual SQLite database rather than hardcoded JSON.
 *
 * To edit blog content: edit data/build_db.py, run `python3 build_db.py`,
 * then commit the regenerated data/blog.db. See data/build_db.py for details.
 */

const SQL_JS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js";
const SQL_JS_WASM = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm";
const DB_PATH = "data/blog.db";

let dbPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Returns a promise that resolves to an open sql.js Database instance.
 * Safe to call multiple times -- the DB is only loaded once.
 */
function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    await loadScript(SQL_JS_CDN);
    const SQL = await window.initSqlJs({ locateFile: () => SQL_JS_WASM });

    const response = await fetch(DB_PATH);
    if (!response.ok) {
      throw new Error(`Could not fetch ${DB_PATH} (status ${response.status})`);
    }
    const buffer = await response.arrayBuffer();
    return new SQL.Database(new Uint8Array(buffer));
  })();

  return dbPromise;
}

/**
 * Runs a SELECT query and returns rows as an array of plain objects.
 */
async function queryAll(sql, params = []) {
  const db = await getDB();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Runs a SELECT query and returns the first row (or null).
 */
async function queryOne(sql, params = []) {
  const rows = await queryAll(sql, params);
  return rows.length ? rows[0] : null;
}

window.PortfolioDB = { getDB, queryAll, queryOne };
