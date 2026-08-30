# arya sapkal — portfolio

A minimal, white-background personal site: home page with a project
overview + quick links, and a blog backed by a real SQLite database.

## How it's put together

Plain HTML/CSS/JS — no build step, no npm, no framework. This was
intentional: it deploys to GitHub Pages by just pushing the files, and
it's easy to read top to bottom since you're just getting into this.

```
index.html      home page (hero, projects, recent posts slider)
blog.html       full list of blog posts
post.html       single post view (reads ?slug=... from the URL)
css/style.css   all styling — one file, organized by section
js/db.js        loads the SQLite database in the browser
js/main.js      home page logic (renders the recent-posts slider)
js/blog.js      blog listing page logic
js/post.js      single post page logic
data/blog.db    the SQLite database itself (binary file)
data/build_db.py  the script that GENERATES blog.db — edit this to add posts
assets/         resume PDF, etc.
```

## The SQLite part, explained

GitHub Pages only serves static files — there's no server to run a
real backend against SQLite. To still use an actual SQLite database
(not just a JSON file pretending to be one), this site uses
**[sql.js](https://github.com/sql-js/sql.js)**, which compiles SQLite
itself to WebAssembly so it can run *inside the browser*.

Here's the flow:

1. `data/build_db.py` is a normal Python script using the standard
   `sqlite3` module. It defines your posts as a Python list and writes
   them into `data/blog.db`, a real `.db` file.
2. `js/db.js` loads sql.js from a CDN, fetches `data/blog.db` as raw
   bytes, and opens it as an in-memory SQLite database in the visitor's
   browser.
3. `js/main.js`, `js/blog.js`, and `js/post.js` run actual SQL queries
   against it, e.g. `SELECT * FROM posts ORDER BY date DESC`.

**The tradeoff:** this gives you a real database for reads, but it's
read-only from the browser — there's no way for a website visitor to
write back to it (which is normal and expected for a static personal
site). To add, edit, or remove a post, you edit the Python script and
regenerate the `.db` file locally, then push it like any other file.

## Adding a blog post

1. Open `data/build_db.py`.
2. Add a new dictionary to the `POSTS` list at the top (copy an
   existing one as a template — `slug`, `title`, `date`, `tag`,
   `excerpt`, `body`, `read_time`).
3. Regenerate the database:
   ```bash
   cd data
   python3 build_db.py
   ```
4. Commit and push both `build_db.py` and the regenerated `blog.db`.

The home page slider always shows the 4 most recent posts by date —
no need to touch any HTML.

## Running it locally

Because the browser fetches `data/blog.db` over HTTP, opening
`index.html` directly as a `file://` URL won't work (browsers block
that fetch for local files). Run a tiny local server instead:

```bash
# from the project root
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## Deploying to GitHub Pages

Push this folder to your GitHub Pages repo (or the `docs/` folder /
`main` branch, depending on how your repo is configured) and enable
Pages in the repo settings. No build step needed — it's already
static. The included `.nojekyll` file tells GitHub Pages to serve
files as-is.

## Customizing

- **Colors/fonts:** all defined as CSS variables at the top of
  `css/style.css` (`:root { ... }`) — change once, applies everywhere.
- **Projects on the home page:** currently hardcoded in `index.html`
  under `#projects` since they change rarely. If you want those in
  SQLite too, add a `projects` table to `build_db.py` following the
  same pattern as `posts`.
- **Resume:** replace `assets/Arya_Sapkal_Resume.pdf` with an updated
  PDF of the same filename, or update the filename in `index.html`
  and `blog.html`/`post.html` nav links.
