import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

const DB_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), 'data')
const DEFAULT_DB_PATH = path.join(DB_DIR, 'lab.db')

function resolveDbPath() {
	const url = process.env.DATABASE_URL ?? 'file:./data/lab.db'
	if (url.startsWith('file:')) {
		const relative = url.slice('file:'.length)
		if (!relative || relative === './data/lab.db' || relative === 'data/lab.db') {
			return DEFAULT_DB_PATH
		}
		return path.isAbsolute(relative)
			? relative
			: path.join(process.cwd(), relative)
	}
	throw new Error('Lab 06 仅支持 SQLite，请设置 DATABASE_URL=file:./data/lab.db')
}

let db: Database.Database | null = null

/** Lab 05 → Lab 06：旧库 sessions 表没有 user_id，需 ALTER */
function migrateSessionsUserId(database: Database.Database) {
	const columns = database
		.prepare(`PRAGMA table_info(sessions)`)
		.all() as Array<{ name: string }>
	const hasUserId = columns.some(c => c.name === 'user_id')
	if (!hasUserId) {
		database.exec(`ALTER TABLE sessions ADD COLUMN user_id TEXT`)
	}
}

function ensureIndexes(database: Database.Database) {
	database.exec(`
		CREATE INDEX IF NOT EXISTS idx_messages_session
			ON messages(session_id, created_at);

		CREATE INDEX IF NOT EXISTS idx_sessions_user
			ON sessions(user_id, updated_at);

		CREATE INDEX IF NOT EXISTS idx_user_providers_user
			ON user_providers(user_id);
	`)
}

function initSchema(database: Database.Database) {
	database.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			created_at TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS user_providers (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			provider TEXT NOT NULL,
			api_key_encrypted TEXT NOT NULL,
			base_url TEXT,
			model TEXT,
			created_at TEXT NOT NULL,
			UNIQUE(user_id, provider),
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			title TEXT NOT NULL,
			provider TEXT NOT NULL DEFAULT 'zhipu',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL,
			role TEXT NOT NULL,
			parts TEXT NOT NULL,
			created_at TEXT NOT NULL,
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
		);
	`)

	// 必须先迁移再加索引：旧 Lab 05 库没有 user_id，直接 CREATE INDEX 会失败并阻断迁移
	migrateSessionsUserId(database)
	ensureIndexes(database)
}

export function getDb() {
	if (!db) {
		const dbPath = resolveDbPath()
		fs.mkdirSync(path.dirname(dbPath), { recursive: true })

		db = new Database(dbPath)
		db.pragma('journal_mode = WAL')
		db.pragma('foreign_keys = ON')
		initSchema(db)
	} else {
		// 修复「首次 init 在索引处失败后缓存了未迁移的 db」的情况
		migrateSessionsUserId(db)
		try {
			ensureIndexes(db)
		} catch {
			// 索引已存在或列仍不可用时忽略
		}
	}

	return db
}
