import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "kosmic.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_connection()
    try:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS creators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            niche TEXT DEFAULT '',
            portfolio_url TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS briefs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand_name TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            budget REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            creator_id INTEGER NOT NULL,
            brief_id INTEGER NOT NULL,
            proposal TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES creators(id),
            FOREIGN KEY (brief_id) REFERENCES briefs(id),
            UNIQUE (creator_id, brief_id)
        );
        CREATE TABLE IF NOT EXISTS portfolio_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            creator_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            content_type TEXT DEFAULT '',
            tools_used TEXT DEFAULT '[]',
            workflow TEXT DEFAULT '',
            aspect_ratio TEXT DEFAULT '',
            media_url TEXT DEFAULT '',
            commercial_use INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id)
                REFERENCES creators(id)
                ON DELETE CASCADE
    );
        """)
                # Add missing columns to existing briefs table
        existing_columns = {
            row["name"]
            for row in conn.execute(
                "PRAGMA table_info(briefs)"
            ).fetchall()
        }

        new_columns = {
            "content_type": "TEXT DEFAULT ''",
            "creative_style": "TEXT DEFAULT ''",
            "aspect_ratio": "TEXT DEFAULT ''",
            "required_skills": "TEXT DEFAULT '[]'",
            "preferred_tools": "TEXT DEFAULT '[]'",
            "budget_min": "REAL",
            "budget_max": "REAL",
            "deadline": "TEXT DEFAULT ''",
            "commercial_use_required": "INTEGER DEFAULT 0",
            "deliverables": "TEXT DEFAULT '[]'",
            "status": "TEXT DEFAULT 'open'"
        }

        for column_name, column_type in new_columns.items():
            if column_name not in existing_columns:
                conn.execute(
                    f"ALTER TABLE briefs ADD COLUMN {column_name} {column_type}"
                )

        conn.commit()
        conn.commit()
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")