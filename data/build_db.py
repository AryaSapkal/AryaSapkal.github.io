#!/usr/bin/env python3
"""
build_db.py
-----------
Builds blog.db, the SQLite database that powers the blog.

Run this whenever you add, edit, or remove a post:

    python3 build_db.py

It rebuilds data/blog.db from scratch using the POSTS list below.
The website reads blog.db in the browser (via sql.js), so after running
this script, commit + push the updated blog.db file for the change
to show up on the live GitHub Pages site.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "blog.db")

SCHEMA = """
CREATE TABLE posts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    date        TEXT NOT NULL,      -- ISO format: YYYY-MM-DD
    tag         TEXT NOT NULL,      -- short mono label, e.g. "ml", "systems"
    excerpt     TEXT NOT NULL,      -- one or two sentences for cards
    body        TEXT NOT NULL,      -- full post content, markdown-ish plain text
    read_time   INTEGER NOT NULL    -- minutes
);
"""

# ---------------------------------------------------------------------------
# Sample posts (placeholders for testing -- edit freely).
# Most recent post first; the site sorts by date descending regardless.
# ---------------------------------------------------------------------------
POSTS = [
    {
        "slug": "my-first-blog-post",
        "title": "My First Post",
        "date": "2026-08-29",
        "body": (
            "Here is my first blog post. I created this website to serve as my personal home on the internet. "
            "I'm not sure what exactly I'll do with it or how it will evolve. "
            "However, I'm excited to contribute more to the website over time so that others find it useful. "
            "I'm also ecstatic to share that I'm an incoming transfer student at Rutgers-New Brunswick! I'm starting my junior year on September 1st as a prospective computer science major. "
            "I'm grateful for the people in my life (especially my parents) that made it possible to be where I am right now. Here's to a future full of growth! "
        )

    },
]


def main():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executescript(SCHEMA)

    cur.executemany(
        """
        INSERT INTO posts (slug, title, date, tag, excerpt, body, read_time)
        VALUES (:slug, :title, :date, :tag, :excerpt, :body, :read_time)
        """,
        POSTS,
    )

    conn.commit()
    conn.close()
    print(f"Built {DB_PATH} with {len(POSTS)} posts.")


if __name__ == "__main__":
    main()
