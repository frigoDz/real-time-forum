import { getComments } from "../api/comments.js";
import { renderHeader, renderLeftAside, renderRightAside } from "./forum.js";
// import { getCategories } from "../api/categories.js";

export function renderPostDetails() {
  return /* html */`
    <div class="home-view post-details">
      ${renderHeader()}
      <div class="main-grid">
        ${renderLeftAside()}
        <main id="main-content" class="post-details-area">
          <div id="post-card-container"></div>
          <div id="comments-container"></div>
        </main>
        ${renderRightAside()}
      </div>
    </div>
  `;
}

export async function initPostDetails() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  if (!postId) return;

  const commentsContainer = document.querySelector("#comments-container");
  if (!commentsContainer) return;

  const comments = await getComments(postId);

  if (!comments || comments.length === 0) {
    commentsContainer.innerHTML = `<p class="no-comments">No comments yet.</p>`;
    return;
  }

  commentsContainer.innerHTML = comments.map(c => `
    <div class="comment-card">
      <span class="comment-author">${c.author || "User"}</span>
      <p class="comment-content">${c.content}</p>
    </div>
  `).join("");
}