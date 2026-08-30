/**
 * blog.js
 * -------
 * Blog index page behavior: pulls every post out of blog.db and renders
 * the full list, most recent first.
 */

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.textContent;
}

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function postRowHTML(post) {
  return `
    <a class="post-row" href="post.html?slug=${encodeURIComponent(post.slug)}">
      <span class="date">${formatDate(post.date)}</span>
      <div class="info">
        <span class="filename">${escapeHTML(post.date)}-${escapeHTML(post.slug)}.md</span>
        <h3>${escapeHTML(post.title)}</h3>
        <p>${escapeHTML(post.excerpt)}</p>
      </div>
      <span class="meta">${escapeHTML(post.tag)} · ${post.read_time} min</span>
    </a>
  `;
}

async function renderAllPosts() {
  const list = document.getElementById("post-list");
  try {
    const posts = await window.PortfolioDB.queryAll(
      "SELECT slug, title, date, tag, excerpt, read_time FROM posts ORDER BY date DESC"
    );

    if (!posts.length) {
      list.innerHTML = `<p class="empty-state">$ no posts found in blog.db</p>`;
      return;
    }

    list.innerHTML = posts.map(postRowHTML).join("");
  } catch (err) {
    console.error(err);
    list.innerHTML = `<p class="empty-state">$ error loading blog.db — ${escapeHTML(err.message)}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", renderAllPosts);
