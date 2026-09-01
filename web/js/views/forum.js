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

export function initMobileMenu() {
  const menuBtn = document.querySelector("#menu-toggle-btn");
  const closeBtn = document.querySelector("#close-mobile-menu-btn");
  const overlay = document.querySelector("#mobile-categories-overlay");
  const backdrop = document.querySelector(".mobile-overlay__backdrop");

  if (!overlay) return;

  const closeDrawer = () => {
    overlay.classList.add("hidden");
  };

  if (menuBtn) {
    menuBtn.onclick = () => overlay.classList.remove("hidden");
  }
  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (backdrop) backdrop.onclick = closeDrawer;

  const mobilePostBtn = document.querySelector("#mobile-create-post-btn");
  if (mobilePostBtn) {
    mobilePostBtn.onclick = () => {
      closeDrawer();
      const textarea = document.querySelector("textarea.post-content");
      if (textarea) {
        textarea.focus();
        textarea.scrollIntoView({ behavior: "smooth" });
      }
    };
  }
}

export function initHome() {
  initMobileMenu();

  // Custom Category Dropdown Toggle
  const dropdownBtn = document.querySelector("#category-dropdown-btn");
  const dropdownMenu = document.querySelector("#category-dropdown-menu");

  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== dropdownBtn && !dropdownBtn.contains(e.target)) {
        dropdownMenu.classList.add("hidden");
      }
    });
  }

  // Load dynamic categories & posts
  loadCategories();
  
  // Detect route filter
  const path = window.location.pathname;
  let params = {};
  if (path === "/my-posts") params = { filter: "my-posts" };
  else if (path === "/liked-posts") params = { filter: "liked-posts" };

  loadPosts(params);

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
        updateSelectedCategoryPills();
        if (postErrorElement) postErrorElement.textContent = "";
        submitPostBtn.disabled = false;

        // Refresh feed with newly created post
        await loadPosts(params);
      }
    });
  }
}

export function renderHeader() {
  return /* html */ `
    <header class="home-header">
      <div class="logo">
        <img style="width: 40px; height:40px" src="./imgs/logo.png" alt="Logo">
      </div>
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

export function renderLeftAside() {
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
  if (location.pathname !== "/") return `<span></span>`;
  return /* html */ `
    <div class="create-post-container">
      <div class="create-post-box">
        <div class="avatar">U</div>
        <div class="create-post-box__content">
          <textarea name="post-content" id="post-content" class="post-content" aria-label="What's happening?" placeholder="What is happening?!"></textarea>

          <!-- Selected Category Pills -->
          <div id="selected-category-pills" class="selected-category-pills"></div>

          <div class="create-post-box__footer">
            <!-- Custom Category Dropdown -->
            <div class="category-dropdown-container">
              <button type="button" id="category-dropdown-btn" class="category-dropdown-btn">
                <i class="fa-solid fa-tags"></i>
                <span id="category-btn-text">Select Categories</span>
                <i class="fa-solid fa-chevron-down dropdown-arrow"></i>
              </button>
              <div id="category-dropdown-menu" class="category-dropdown-menu hidden">
                <div id="category-checkbox-list" class="category-checkbox-list">
                  <!-- Dynamic category checkboxes loaded here -->
                </div>
              </div>
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

export function renderMobileOverlay() {
  return /* html */ `
    <div id="mobile-categories-overlay" class="mobile-overlay hidden">
      <div class="mobile-overlay__backdrop"></div>
      <div class="mobile-overlay__drawer">
        <div class="mobile-overlay__header">
          <div class="user-info-mobile">
            <div class="avatar">U</div>
            <span class="username">@user</span>
          </div>
          <button type="button" id="close-mobile-menu-btn" class="mobile-overlay__close-btn" aria-label="Close Menu">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="mobile-overlay__body">
          <button type="button" class="btn btn-accent mobile-post-btn" id="mobile-create-post-btn">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>Create Post</span>
          </button>

          <div class="mobile-categories-section">
            <h3>Categories</h3>
            <nav id="mobile-categories-list" class="nav-group" aria-label="Mobile Categories">
              <!-- Categories mirrored here for mobile view -->
            </nav>
          </div>

          <div class="mobile-actions">
            <button type="button" class="btn logout-btn mobile-logout-btn">
              <i class="fa-solid fa-arrow-right-from-bracket logout-icon"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function loadCategories() {
  const categories = await getCategories();
  const leftList = document.querySelector("#categories-list");
  const mobileList = document.querySelector("#mobile-categories-list");
  const dropdownList = document.querySelector("#category-checkbox-list");

  if (!categories || categories.length === 0) return;

  // Render left sidebar & mobile overlay category links
  const linksHTML = categories.map(cat => /* html */ `
    <a href="#" data-category-id="${cat.id}" class="nav-item">
      <span>${cat.name}</span>
    </a>
  `).join("");

  if (leftList) leftList.innerHTML = linksHTML;
  if (mobileList) mobileList.innerHTML = linksHTML;

  // Attach click listeners to category filter links
  const attachCategoryClick = (container) => {
    if (!container) return;
    container.querySelectorAll("a[data-category-id]").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const catId = link.dataset.categoryId;

        // Highlight selected category link
        document.querySelectorAll("a[data-category-id]").forEach(l => {
          l.classList.toggle("active", l.dataset.categoryId === catId);
        });
        document.querySelectorAll(".left-side .nav-group a:not([data-category-id])").forEach(l => {
          l.classList.remove("active");
        });

        // Load posts for selected category
        loadPosts({ category_id: catId });

        // Close mobile drawer if open
        const overlay = document.querySelector("#mobile-categories-overlay");
        if (overlay) overlay.classList.add("hidden");
      });
    });
  };

  attachCategoryClick(leftList);
  attachCategoryClick(mobileList);

  // Render checkboxes inside custom dropdown
  if (dropdownList) {
    dropdownList.innerHTML = categories.map(cat => /* html */ `
      <label class="category-dropdown-item">
        <input type="checkbox" name="post-category" value="${cat.id}" data-name="${cat.name}">
        <span class="category-dropdown-item__label">${cat.name}</span>
      </label>
    `).join("");

    // Listen to category checkbox changes
    dropdownList.querySelectorAll('input[name="post-category"]').forEach(cb => {
      cb.addEventListener("change", updateSelectedCategoryPills);
    });
  }
}

function updateSelectedCategoryPills() {
  const selectedCbs = Array.from(document.querySelectorAll('input[name="post-category"]:checked'));
  const pillsContainer = document.querySelector("#selected-category-pills");
  const btnText = document.querySelector("#category-btn-text");

  if (btnText) {
    if (selectedCbs.length === 0) {
      btnText.textContent = "Select Categories";
    } else {
      btnText.textContent = `${selectedCbs.length} Selected`;
    }
  }

  if (pillsContainer) {
    pillsContainer.innerHTML = selectedCbs.map(cb => `
      <span class="selected-pill">
        ${cb.dataset.name}
        <i class="fa-solid fa-xmark remove-pill-btn" data-value="${cb.value}"></i>
      </span>
    `).join("");

    pillsContainer.querySelectorAll(".remove-pill-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const val = e.target.dataset.value;
        const targetCb = document.querySelector(`input[name="post-category"][value="${val}"]`);
        if (targetCb) {
          targetCb.checked = false;
          updateSelectedCategoryPills();
        }
      });
    });
  }
}

export async function loadPosts(params = {}) {
  const container = document.querySelector("#posts-container");
  if (!container) return;

  const posts = await getPosts(params);
  if (!posts || posts.length === 0) {
    container.innerHTML = `<p class="text-muted text-center p-3">No posts found.</p>`;
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
        </header>
        <div class="post-card__body">
          <p>${post.content}</p>
          ${categoriesBadges ? `<div class="post-card__categories">${categoriesBadges}</div>` : ""}
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
