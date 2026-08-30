/**
 * post.js
 * -------
 * Individual post page behavior: reads the `slug` query param, fetches
 * the matching row from blog.db, and renders title/meta/body.
 */

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.textContent;
}

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// Body text is stored as plain text with blank-line-separated paragraphs.
// This turns that into safe <p> tags without any HTML injection risk.
function renderBody(bodyText) {
  return bodyText
    .split(/\n\s*\n/)
    .map((para) => `<p>${escapeHTML(para.trim()).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

async function renderPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const header = document.getElementById("post-header");
  const body = document.getElementById("post-body");

  if (!slug) {
    header.innerHTML = `
      <a href="blog.html" class="back-link">← back to writing</a>
      <p class="empty-state">$ no post specified</p>
    `;
    return;
  }

  try {
    const post = await window.PortfolioDB.queryOne(
      "SELECT * FROM posts WHERE slug = ?",
      [slug]
    );

    if (!post) {
      header.innerHTML = `
        <a href="blog.html" class="back-link">← back to writing</a>
        <p class="empty-state">$ no post found for slug "${escapeHTML(slug)}"</p>
      `;
      return;
    }

    document.getElementById("page-title").textContent = `${post.title} — Arya Sapkal`;

    header.innerHTML = `
      <a href="blog.html" class="back-link">← back to writing</a>
      <span class="filename">${escapeHTML(post.date)}-${escapeHTML(post.slug)}.md</span>
      <h1>${escapeHTML(post.title)}</h1>
      <p class="meta">${formatDate(post.date)} · ${escapeHTML(post.tag)} · ${post.read_time} min read</p>
    `;

    body.innerHTML = renderBody(post.body);
  } catch (err) {
    console.error(err);
    header.innerHTML = `
      <a href="blog.html" class="back-link">← back to writing</a>
      <p class="empty-state">$ error loading blog.db — ${escapeHTML(err.message)}</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", renderPost);
