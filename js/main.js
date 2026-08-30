/**
 * main.js
 * -------
 * Home page behavior: pulls the 4 most recent posts out of blog.db
 * (via db.js) and renders them into the horizontal slider.
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

function slideCardHTML(post) {
  return `
    <a class="slide-card" href="post.html?slug=${encodeURIComponent(post.slug)}">
      <span class="filename">${escapeHTML(post.date)}-${escapeHTML(post.slug)}.md</span>
      <h3>${escapeHTML(post.title)}</h3>
      <p>${escapeHTML(post.excerpt)}</p>
      <span class="meta">${formatDate(post.date)} · ${post.read_time} min read</span>
    </a>
  `;
}

async function renderRecentPosts() {
  const slider = document.getElementById("slider");
  try {
    const posts = await window.PortfolioDB.queryAll(
      "SELECT slug, title, date, excerpt, read_time FROM posts ORDER BY date DESC LIMIT 4"
    );

    if (!posts.length) {
      slider.innerHTML = `<p class="empty-state">$ no posts found in blog.db</p>`;
      return;
    }

    slider.innerHTML = posts.map(slideCardHTML).join("");
  } catch (err) {
    console.error(err);
    slider.innerHTML = `<p class="empty-state">$ error loading blog.db — ${escapeHTML(err.message)}</p>`;
  }
}

function wireSliderControls() {
  const slider = document.getElementById("slider");
  const prev = document.getElementById("slide-prev");
  const next = document.getElementById("slide-next");
  const scrollAmount = 320;

  prev.addEventListener("click", () => {
    slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderRecentPosts();
  wireSliderControls();
});
