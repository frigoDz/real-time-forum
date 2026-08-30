import { getCategories } from "../api/categories.js";
import { createPost, getPosts } from "../api/posts.js";

export function renderHome() {
  return /* html */`
    <div class="home-view">
      ${renderHeader()}
      <div class="main-grid">
        ${renderLeftAside()}
        <main id="main-content" class="posts-area">
          ${renderCreatePostBox()}
          <div id="posts-container"><!-- Dynamic posts loaded here via JS --></div>
        </main>
        ${renderRightAside()}
      </div>
      ${renderMobileOverlay()}
    </div>
  `;
}

function renderHeader() {
  return /* html */ `
    <header class="home-header">
      <a href="/" data-link class="logo">
        <i class="fa-solid fa-comments"></i>
        <span>Forum</span>
      </a>
      <div class="header-search">
        <div class="input-field">
          <i class="fa-solid fa-magnifying-glass input-icon"></i>
          <input aria-label="Search posts" type="search" name="search" id="search" placeholder="Search forum...">
        </div>
      </div>
      <div class="user-info">
        <div class="avatar">
          <span>U</span>
          <span class="status-dot status-dot--online"></span>
        </div>
        <span class="username">@user</span>
      </div>
      <button type="button" id="menu-toggle-btn" class="menu-toggle" aria-label="Open Menu">
        <i class="fa-solid fa-bars"></i>
      </button>
    </header>
  `;
}

function renderLeftAside() {
  return /* html */ `
    <aside class="left-side">
      <div class="left-side__nav">
        <div>
          <h3>Feeds</h3>
          <nav class="nav-group" aria-label="Main Navigation">
            <a href="/" data-link class="nav-item active">
              <i class="fa-solid fa-house"></i>
              <span>Home</span>
            </a>
            <a href="/my-posts" data-link class="nav-item">
              <i class="fa-solid fa-user-pen"></i>
              <span>My Posts</span>
            </a>
            <a href="/liked-posts" data-link class="nav-item">
              <i class="fa-solid fa-heart"></i>
              <span>Liked Posts</span>
            </a>
            <a href="/messages" data-link class="nav-item">
              <i class="fas fa-comment"></i>
              <span>Chat</span>
            </a>
          </nav>
        </div>

        <div class="categories-section">
          <h3>Categories</h3>
          <nav id="categories-list" class="nav-group" aria-label="Categories">
            <!-- Dynamic categories loaded here -->
          </nav>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="btn btn-accent">
          <i class="fa-solid fa-pen-to-square"></i>
          <span>Post</span>
        </button>
        <button type="button" class="btn logout-btn">
          <i class="fa-solid fa-arrow-right-from-bracket logout-icon"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  `;
}

function renderCreatePostBox() {
  return /* html */ `
    <div class="create-post-container">
      <div class="create-post-box">
        <div class="avatar">U</div>
        <div class="create-post-box__content">
          <textarea name="post-content" id="post-content" class="post-content" aria-label="What's happening?" placeholder="What is happening?!"></textarea>
          <div class="create-post-box__footer">
            <div id="post-category-pills" class="category-pills-wrapper">
              <!-- Dynamic category checkbox pills loaded here -->
            </div>
            <button type="button" class="btn btn-accent btn-submit-post">Post</button>
          </div>
        </div>
      </div>
      <p class="create-post-error error"></p>
    </div>
  `;
}

function renderRightAside() {
  return /* html */ `
    <aside class="right-side">
      <div class="users-group">
        <h3 class="users-group__header">Online Users</h3>
        <div id="online-users-list" class="users-group__list">
          <!-- Dynamic online users loaded here via WebSocket/API -->
        </div>
      </div>

      <div class="users-group">
        <h3 class="users-group__header">Offline Users</h3>
        <div id="offline-users-list" class="users-group__list">
          <!-- Dynamic offline users loaded here via WebSocket/API -->
        </div>
      </div>
    </aside>
  `;
}

function renderMobileOverlay() {
  return /* html */ `
    <div id="mobile-categories-overlay" class="mobile-overlay hidden">
      <div class="mobile-overlay__content">
        <div class="mobile-overlay__header">
          <h2>Categories</h2>
          <button type="button" id="close-mobile-menu-btn" class="mobile-overlay__close-btn" aria-label="Close Menu">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <nav id="mobile-categories-list" class="nav-group" aria-label="Mobile Categories">
          <!-- Categories mirrored here for mobile view -->
        </nav>
      </div>
    </div>
  `;
}

export function initHome() {
  const menuBtn = document.querySelector("#menu-toggle-btn");
  const closeBtn = document.querySelector("#close-mobile-menu-btn");
  const overlay = document.querySelector("#mobile-categories-overlay");

  if (menuBtn && overlay) {
    menuBtn.addEventListener("click", () => {
      overlay.classList.remove("hidden");
    });
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.add("hidden");
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
  }

  // Load dynamic categories & posts
  loadCategories();
  loadPosts();

  // Create post submission handler
  const submitPostBtn = document.querySelector(".btn-submit-post");
  const postForm = document.querySelector(".create-post-box");
  const postErrorElement = document.querySelector(".create-post-container .create-post-error");

  if (submitPostBtn && postForm) {
    submitPostBtn.addEventListener("click", async () => {
      const textarea = postForm.querySelector("textarea.post-content");
      const postContent = textarea ? textarea.value.trim() : "";
      
      if (postErrorElement) postErrorElement.textContent = "";

      // 1. Content validation
      if (postContent.length < 5 || postContent.length > 2000) {
        if (postErrorElement) postErrorElement.textContent = "Post content must be between 5 and 2000 characters.";
        return;
      }

      // 2. Category selection validation
      const selectedCategories = Array.from(
        document.querySelectorAll('input[name="post-category"]:checked')
      ).map(cb => parseInt(cb.value, 10));

      if (selectedCategories.length < 1) {
        if (postErrorElement) postErrorElement.textContent = "Please select at least one category.";
        return;
      }

      // 3. Submit request
      submitPostBtn.disabled = true;
      if (postErrorElement) postErrorElement.textContent = "Publishing post...";

      const res = await createPost({ content: postContent, categories: selectedCategories });

      if (res && res.error) {
        if (postErrorElement) postErrorElement.textContent = res.error;
        submitPostBtn.disabled = false;
      } else {
        // Reset form on success
        if (textarea) textarea.value = "";
        document.querySelectorAll('input[name="post-category"]:checked').forEach(cb => cb.checked = false);
        if (postErrorElement) postErrorElement.textContent = "";
        submitPostBtn.disabled = false;

        // Refresh feed with newly created post
        await loadPosts();
      }
    });
  }
}

async function loadCategories() {
  const categories = await getCategories();
  const leftList = document.querySelector("#categories-list");
  const mobileList = document.querySelector("#mobile-categories-list");
  const pillsContainer = document.querySelector("#post-category-pills");

  if (!categories || categories.length === 0) return;

  // Render left sidebar & mobile overlay category links
  const linksHTML = categories.map(cat => /* html */ `
    <a href="#" data-link data-category-id="${cat.id}" class="nav-item">
      <span>${cat.name}</span>
    </a>
  `).join("");

  if (leftList) leftList.innerHTML = linksHTML;
  if (mobileList) mobileList.innerHTML = linksHTML;

  // Render multi-select category checkbox pills in Create Post box
  if (pillsContainer) {
    pillsContainer.innerHTML = categories.map(cat => /* html */ `
      <label class="category-pill">
        <input type="checkbox" name="post-category" value="${cat.id}">
        <span class="category-pill__label">${cat.name}</span>
      </label>
    `).join("");
  }
}

async function loadPosts() {
  const container = document.querySelector("#posts-container");
  if (!container) return;

  const posts = await getPosts();
  if (!posts || posts.length === 0) {
    container.innerHTML = `<p class="text-muted text-center p-3">No posts yet. Be the first to share something!</p>`;
    return;
  }

  container.innerHTML = posts.map(post => {
    const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-GB") : "Recently";
    const categoriesBadges = (post.categories || []).map(cat => 
      `<span class="post-card__category-badge">${cat}</span>`
    ).join(" ");

    return /* html */ `
      <article class="post-card" data-post-id="${post.id}">
        <header class="post-card__header">
          <div class="avatar">${(post.author || "A").charAt(0).toUpperCase()}</div>
          <div class="post-card__meta">
            <span class="post-card__author">${post.author || "User"}</span>
            <span class="post-card__handle">@${post.author ? post.author.toLowerCase() : "user"}</span>
            <span class="post-card__time">• ${formattedDate}</span>
          </div>
          ${categoriesBadges}
        </header>
        <div class="post-card__body">
          <p>${post.content}</p>
        </div>
        <footer class="post-card__actions">
          <button type="button" class="post-card__action-btn comments" aria-label="Comments">
            <i class="fa-regular fa-comment"></i>
            <span>0</span>
          </button>
          <button type="button" class="post-card__action-btn likes" aria-label="Likes">
            <i class="fa-regular fa-heart"></i>
            <span>0</span>
          </button>
        </footer>
      </article>
    `;
  }).join("");
}
