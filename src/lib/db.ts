import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

let dbInstance: Database.Database | null = null

function getDatabase(): Database.Database {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), 'moneyflow.db')
    dbInstance = new Database(dbPath)
    dbInstance.pragma('journal_mode = WAL')
    dbInstance.pragma('foreign_keys = ON')
    runMigrations(dbInstance)
  }
  return dbInstance
}

// ---------------------------------------------------------------------------
// Migration runner
// ---------------------------------------------------------------------------

function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const migrationsDir = path.join(process.cwd(), 'src', 'migrations')
  if (!fs.existsSync(migrationsDir)) return

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  const applied = new Set<number>(
    (db.prepare('SELECT version FROM schema_migrations').all() as { version: number }[]).map(r => r.version)
  )

  for (const file of files) {
    const match = file.match(/^(\d+)_/)
    if (!match) continue
    const version = parseInt(match[1], 10)
    if (applied.has(version)) continue

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    db.transaction(() => {
      db.exec(sql)
      db.prepare('INSERT INTO schema_migrations (version, name) VALUES (?, ?)').run(version, file)
    })()
    console.log(`[db] Applied migration ${file}`)
  }

  // Runtime column-patch for databases created before migrations were tracked
  patchLegacyColumns(db)
}

function patchLegacyColumns(db: Database.Database): void {
  const txCols = (db.prepare("PRAGMA table_info(transactions)").all() as { name: string }[]).map(c => c.name)
  const txPatches: [string, string][] = [
    ['status',      "ALTER TABLE transactions ADD COLUMN status TEXT NOT NULL DEFAULT 'completed'"],
    ['due_date',    'ALTER TABLE transactions ADD COLUMN due_date TEXT'],
    ['reminder_days','ALTER TABLE transactions ADD COLUMN reminder_days INTEGER DEFAULT 3'],
    ['client_name', 'ALTER TABLE transactions ADD COLUMN client_name TEXT'],
    ['business_id', 'ALTER TABLE transactions ADD COLUMN business_id INTEGER REFERENCES businesses(id)'],
  ]
  for (const [col, sql] of txPatches) {
    if (!txCols.includes(col)) { try { db.exec(sql) } catch { /* already exists */ } }
  }

  const userCols = (db.prepare("PRAGMA table_info(users)").all() as { name: string }[]).map(c => c.name)
  if (!userCols.includes('role')) {
    try { db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'") } catch { /* already exists */ }
  }

  seedAdminUser(db)
  seedDemoUser(db)
}

function seedAdminUser(db: Database.Database): void {
  try {
    const existing = db.prepare("SELECT id FROM users WHERE role = 'admin'").get()
    if (existing) return
    const password = Buffer.from('admin123').toString('base64')
    db.prepare(
      "INSERT OR IGNORE INTO users (username, email, password, role) VALUES ('admin', 'admin@moneyflow.app', ?, 'admin')"
    ).run(password)
    console.log('[db] Admin user seeded — login: admin / admin123')
  } catch (err) {
    console.error('[db] Failed to seed admin user:', err)
  }
}

function seedDemoUser(db: Database.Database): void {
  try {
    const existing = db.prepare("SELECT id FROM users WHERE username = 'demo'").get()
    if (existing) return
    const password = Buffer.from('demo').toString('base64')
    db.prepare(
      "INSERT OR IGNORE INTO users (username, email, password, role) VALUES ('demo', 'demo@moneyflow.app', ?, 'user')"
    ).run(password)
    console.log('[db] Demo user seeded — login: demo / demo')
  } catch (err) {
    console.error('[db] Failed to seed demo user:', err)
  }
}

// ---------------------------------------------------------------------------
// Public query helpers
// ---------------------------------------------------------------------------

type Params = unknown[]

export const dbQuery = {
  all<T = Record<string, unknown>>(sql: string, params: Params = []): T[] {
    try {
      return getDatabase().prepare(sql).all(...params) as T[]
    } catch (err) {
      console.error('[db] query error:', err, '\nSQL:', sql)
      return []
    }
  },

  get<T = Record<string, unknown>>(sql: string, params: Params = []): T | null {
    try {
      return (getDatabase().prepare(sql).get(...params) ?? null) as T | null
    } catch (err) {
      console.error('[db] query error:', err, '\nSQL:', sql)
      return null
    }
  },

  run(sql: string, params: Params = []): Database.RunResult {
    try {
      return getDatabase().prepare(sql).run(...params)
    } catch (err) {
      console.error('[db] run error:', err, '\nSQL:', sql)
      return { changes: 0, lastInsertRowid: 0 }
    }
  },

  /** Wrap multiple writes in a single SQLite transaction. */
  transaction<T>(fn: (db: Database.Database) => T): T {
    return getDatabase().transaction(fn)(getDatabase())
  },
}

export default dbQuery
