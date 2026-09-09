import { getComments, createComment } from "../api/comments.js";
import { getPostById } from "../api/posts.js";
import { toggleLike } from "../api/likes.js";
import { getUsers } from "../api/messages.js";
import { state } from "../state.js";
import { initMobileMenu, loadCategories, renderHeader, renderLeftAside, renderMobileOverlay, renderRightAside, renderCreatePostModal, initCreatePostModal, renderUserLists, setupWsPresenceListener } from "./forum.js";
import { attachLengthLimit } from "../utils/limit.js";

export function renderPostDetails() {
  const avatarChar = (state.user && state.user.nickname ? state.user.nickname.charAt(0) : "U").toUpperCase();
  return /* html */`
    <div class="home-view post-details">
      ${renderHeader()}
      <div class="main-grid">
        ${renderLeftAside()}
        <main id="main-content" class="post-details-area">
          <div id="post-card-container"></div>
          
          <div id="post-comment-box" class="create-post-box create-comment-box">
            <div class="avatar">${avatarChar}</div>
            <div class="create-post-box__content">
              <textarea name="comment-content" id="comment-content" class="post-content comment-textarea" aria-label="Post your reply" placeholder="Post your reply..."></textarea>
              <div class="create-post-box__footer">
                <div></div>
                <button type="button" class="btn btn-accent btn-submit-comment">Reply</button>
              </div>
            </div>
            <div class="length-limit">
              <span></span>
            </div>
          </div>
          <p class="create-comment-error error"></p>

          <div id="comments-container"></div>
        </main>
        ${renderRightAside()}
      </div>
      ${renderMobileOverlay()}
      ${renderCreatePostModal()}
    </div>
  `;
}

export async function initPostDetails() {
  initMobileMenu();
  loadCategories();
  initCreatePostModal();
  setupWsPresenceListener();

  const users = await getUsers();
  renderUserLists(users);

  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  if (!postId) return;

  await loadPost(postId);
  await loadComments(postId);
  addComment(postId);
  handlePostDetailLike(postId);
}

async function loadComments(postId) {
  const commentsContainer = document.querySelector("#comments-container");
  if (!commentsContainer) return;

  const comments = await getComments(postId);

  if (!comments || comments.length === 0) {
    commentsContainer.innerHTML = renderNoComments();
    return;
  }

  commentsContainer.innerHTML = comments.map(c => {
    const formattedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "Recently";
    const authorInitial = (c.author || "U").charAt(0).toUpperCase();
    return `
      <div class="comment-card">
        <div class="avatar comment-avatar">${authorInitial}</div>
        <div class="comment-card__body">
          <div class="comment-card__header">
            <span class="comment-author">${c.author || "User"}</span>
            <span class="comment-time">• ${formattedDate}</span>
          </div>
          <p class="comment-content">${c.content}</p>
        </div>
      </div>
    `;
  }).join("");
}

let IsValidId = false;

async function loadPost(postId) {
  const postCard = document.querySelector("#post-card-container");
  if (!postCard) return;

  const post = await getPostById(postId);

  if (!post || post.error || !post.id) {
    postCard.innerHTML = `<p class="no-post-content">Post Not Found</p>`;
    const createCommentCard = document.querySelector("#post-comment-box");
    const commentsBox = document.querySelector("#comments-container");
    if (createCommentCard) {
      createCommentCard.remove();
    }
    if (commentsBox) {
      commentsBox.remove();
    }
    IsValidId = false;
    return;
  }

  IsValidId = true;

  const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-GB") : "Recently";
  const categoriesBadges = (post.categories || []).map(cat => 
    `<span class="post-card__category-badge">${cat}</span>`
  ).join(" ");

  const isLiked = post.liked === true;
  const heartIconClass = isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";
  const likedClass = isLiked ? "liked active" : "";

  postCard.innerHTML = /* html */ `
    <article class="post-card" data-post-id="${post.id}">
      <header class="post-card__header">
        <div class="avatar">${(post.author || "A").charAt(0).toUpperCase()}</div>
        <div class="post-card__meta">
          <span class="post-card__author">${post.author || "User"}</span>
          <span class="post-card__handle">@${post.author ? post.author.toLowerCase() : "user"}</span>
          <span class="post-card__time">• ${formattedDate}</span>
        </div>
      </header>
      <div class="post-card__body">
        <p>${post.content}</p>
        ${categoriesBadges ? `<div class="post-card__categories">${categoriesBadges}</div>` : ""}
      </div>
      <footer class="post-card__actions">
        <button type="button" class="post-card__action-btn comments" aria-label="Comments">
          <i class="fa-regular fa-comment"></i>
          <span>${post.commentsCount || 0}</span>
        </button>
        <button type="button" class="post-card__action-btn likes ${likedClass}" aria-label="Likes">
          <i class="${heartIconClass}"></i>
          <span>${post.likes || 0}</span>
        </button>
      </footer>
    </article>
  `;
}

function handlePostDetailLike(postId) {
  const postContainer = document.querySelector("#post-card-container");
  if (!postContainer) return;

  postContainer.addEventListener("click", async (e) => {
    const likesBtn = e.target.closest(".post-card__action-btn.likes");
    if (!likesBtn) return;

    likesBtn.disabled = true;
    const res = await toggleLike(postId);
    likesBtn.disabled = false;

    if (!res || res.error) return;

    const isLiked = res.liked === true;
    likesBtn.classList.toggle("liked", isLiked);
    likesBtn.classList.toggle("active", isLiked);

    const countSpan = likesBtn.querySelector("span");
    if (countSpan) countSpan.textContent = res.likes || 0;

    const heartIcon = likesBtn.querySelector("i");
    if (heartIcon) {
      heartIcon.className = isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";
    }
  });
}

function addComment(postId) {
  const submitBtn = document.querySelector(".btn-submit-comment");
  const commentInput = document.querySelector("#comment-content");
  const commentError = document.querySelector(".create-comment-error");
  const lengthLimit = document.querySelector(".length-limit");

  if (!submitBtn || !commentInput) return;

  const updateProgress = attachLengthLimit(commentInput, lengthLimit, 1000);

  submitBtn.addEventListener("click", async () => {
    if (commentError) commentError.textContent = "";

    if (!IsValidId) {
      if (commentError) {
        commentError.textContent = "You can't comment on a non-existent or invalid post!";
      }
      return;
    }

    const commentContent = commentInput.value.trim();
    if (commentContent.length < 5 || commentContent.length > 1000) {
      if (commentError) {
        commentError.textContent = "Comment length must be between 5 and 1000 characters!";
      }
      return;
    }

    submitBtn.disabled = true;

    const res = await createComment(postId, commentContent);
    submitBtn.disabled = false;

    if (res && res.error) {
      if (commentError) commentError.textContent = res.error;
    } else {
      commentInput.value = "";
      updateProgress();
      if (commentError) commentError.textContent = "";
      await loadPost(postId);
      await loadComments(postId);
    }
  });
}

function renderNoComments() {
  return /* html */ `
    <div class="empty-state empty-state--card">
      <div class="empty-state__icon-circle">
        <i class="fa-solid fa-comments"></i>
      </div>
      <h3 class="empty-state__title">No replies yet</h3>
      <p class="empty-state__description">Be the first to share your thoughts and reply to this post!</p>
    </div>
  `;
}