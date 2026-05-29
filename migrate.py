"""CmdRunner — Database Migration (SQLite)"""
import os
import sqlite3

DB_PATH = os.environ.get('DATABASE_PATH', '/workspace/cmdrunner.db')

SCHEMA = """
CREATE TABLE IF NOT EXISTS test_suites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_suite_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (test_suite_id) REFERENCES test_suites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_case_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_case_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    expectation TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_suite_id INTEGER,
    test_suite_name TEXT,
    status TEXT DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

if __name__ == '__main__':
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    conn.commit()
    tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    print(f"Migration complete. Tables: {[t[0] for t in tables]}")
    conn.close()