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
	throw new Error('Lab 05 仅支持 SQLite，请设置 DATABASE_URL=file:./data/lab.db')
}

let db: Database.Database | null = null

export function getDb() {
	if (db) return db

	const dbPath = resolveDbPath()
	fs.mkdirSync(path.dirname(dbPath), { recursive: true })

	db = new Database(dbPath)
	db.pragma('journal_mode = WAL')
	db.pragma('foreign_keys = ON')
	db.exec(`
		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			provider TEXT NOT NULL DEFAULT 'zhipu',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY,
			session_id TEXT NOT NULL,
			role TEXT NOT NULL,
			parts TEXT NOT NULL,
			created_at TEXT NOT NULL,
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
		);

		CREATE INDEX IF NOT EXISTS idx_messages_session
			ON messages(session_id, created_at);
	`)

	return db
}
