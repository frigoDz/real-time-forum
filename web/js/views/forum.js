import { getCategories } from "../api/categories.js";
import { toggleLike } from "../api/likes.js";
import { createPost, getPosts } from "../api/posts.js";
import { getUsers, fetchMessages } from "../api/messages.js";
import { state, chatState, markUserUnread, markUserRead } from "../state.js";
import { attachLengthLimit } from "../utils/limit.js";
import { navigateTo } from "../router.js";
import { escapeHTML } from "../utils/sanitize.js";

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
      ${renderCreatePostModal()}
    </div>
  `;
}

export function renderCreatePostModal() {
  const avatarChar = (state.user && state.user.nickname ? state.user.nickname.charAt(0) : "U").toUpperCase();
  return /* html */ `
    <div id="create-post-modal" class="overlay hidden">
      <div class="add-post-container">
        <header class="box-header">
          <span>New Post</span>
          <button type="button" id="close-modal-btn" class="close-modal-btn" aria-label="Close modal">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>
        <div class="modal-body">
          <div class="user-avatar">${avatarChar}</div>
          <div class="modal-inputs">
            <textarea id="modal-post-content" name="modal-post-content" placeholder="What's happening?"></textarea>

            <div id="modal-selected-category-pills" class="selected-category-pills"></div>

            <div class="modal-sub-group">
              <div class="modal-categories-dropdown">
                <button type="button" id="modal-categories-btn" class="modal-categories-btn">
                  <i class="fa-solid fa-tags"></i>
                  <span id="modal-category-btn-text">Select categories</span>
                  <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div id="modal-categories-options" class="modal-categories-options hidden">
                  <!-- Dynamic category checkboxes -->
                </div>
              </div>

              <button type="button" class="modal-post-btn" id="modal-submit-post-btn">Post</button>
            </div>
            
            <div class="length-limit" id="modal-length-limit">
              <span></span>
            </div>
            <p class="modal-create-post-error error"></p>
          </div>
        </div>
      </div>
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
}

export async function initHome() {
  // online / offline users on right aside start
  initMobileMenu();

  currentUsers = await getUsers();
  renderUserLists(currentUsers);
  setupWsPresenceListener();
  // online / offline users on right aside end


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

  // Detect route filter & URL category parameter
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const urlCatId = urlParams.get("category") || urlParams.get("category_id");

  let params = {};
  if (urlCatId) params = { category_id: urlCatId };
  else if (path === "/my-posts") params = { filter: "my-posts" };
  else if (path === "/liked-posts") params = { filter: "liked-posts" };

  loadPosts(params);
  handleLikes();
  initCreatePostModal();
  const submitPostBtn = document.querySelector(".btn-submit-post");
  const postForm = document.querySelector(".create-post-box");
  const postErrorElement = document.querySelector(".create-post-container .create-post-error");

  if (submitPostBtn && postForm) {
    const textarea = postForm.querySelector("textarea.post-content");
    const lengthLimit = postForm.querySelector(".length-limit");
    const updateProgress = attachLengthLimit(textarea, lengthLimit, 2000);

    submitPostBtn.addEventListener("click", async () => {
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
        updateProgress();
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
  const avatarChar = (state.user && state.user.nickname ? state.user.nickname.charAt(0) : "U").toUpperCase();
  const nickname = state.user && state.user.nickname ? state.user.nickname : "user";

  return /* html */ `
    <header class="home-header">
      <div class="logo">
        <img style="width: 40px; height:40px" src="./imgs/logo.png" alt="Logo">
      </div>
      <div class="user-info">
        <div class="avatar">
          <span>${avatarChar}</span>
          <span class="status-dot status-dot--online"></span>
        </div>
        <span class="username">@${nickname}</span>
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
        <button type="button" class="create-new-post-btn btn btn-accent">
          <i class="fa-solid fa-pen-to-square"></i>
          <span>Post</span>
        </button>
        <a href="/logout" data-link class="btn logout-btn">
          <i class="fa-solid fa-arrow-right-from-bracket logout-icon"></i>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  `;
}

function renderCreatePostBox() {
  if (location.pathname !== "/") return `<span></span>`;
  const avatarChar = (state.user && state.user.nickname ? state.user.nickname.charAt(0) : "U").toUpperCase();
  return /* html */ `
    <div class="create-post-container">
      <div class="create-post-box">
        <div class="avatar">${avatarChar}</div>
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
        <div class="length-limit">
          <span></span>
        </div>
      </div>
      <p class="create-post-error error"></p>
    </div>
  `;
}

export function renderRightAside() {
  return /* html */ `
    <aside class="right-side">
      <div class="users-group">
        <h3 class="users-group__header">All Users</h3>
        <div id="users-list" class="users-group__list">
          <!-- Dynamic users loaded here via WebSocket/API -->
        </div>
      </div>
    </aside>
  `;
}

let currentUsers = [];
let wsListenerAttached = false;

export function setupWsPresenceListener() {
  if (wsListenerAttached) return;
  wsListenerAttached = true;

  window.addEventListener("ws:message", (e) => {
    const msg = e.detail;
    if (!msg) return;

    // 1. Presence updates
    if (msg.type === "user_online" || msg.type === "user_offline") {
      const isOnline = (msg.type === "user_online");
      const targetUser = currentUsers.find(u => u.id === msg.userId);
      if (targetUser) {
        targetUser.online = isOnline;
        renderUserLists(currentUsers);
      } else {
        getUsers().then(newUsers => {
          currentUsers = newUsers;
          renderUserLists(currentUsers);
        });
      }
      return;
    }

    // 2. Incoming real-time private messages
    if (msg.Content || msg.content) {
      const senderId = msg.SenderID || msg.sender_id || msg.senderId;
      if (!senderId) return;

      const urlParams = new URLSearchParams(window.location.search);
      const activeChatUserId = parseInt(urlParams.get("userId"), 10);
      const isViewingChatWithSender = (window.location.pathname === "/messages" && activeChatUserId === senderId);

      if (!isViewingChatWithSender) {
        markUserUnread(senderId);
      }

      let targetUser = currentUsers.find(u => u.id === senderId);
      const msgDate = msg.CreatedAt || msg.created_at || new Date().toISOString();

      if (targetUser) {
        targetUser.lastMessageDate = msgDate;
      } else {
        getUsers().then(newUsers => {
          currentUsers = newUsers;
          renderUserLists(currentUsers);
        });
        return;
      }

      renderUserLists(currentUsers);
    }
  });
}

export function renderUserLists(users = []) {
  if (Array.isArray(users)) {
    currentUsers = users;
    currentUsers.forEach(u => {
      if (u.unread) {
        markUserUnread(u.id);
      }
    });
  }
  const usersContainer = document.querySelector("#users-list");
  if (!usersContainer || !Array.isArray(currentUsers)) return;

  // Discord-style sorting: Latest message first, then alphabetical
  currentUsers.sort((a, b) => {
    const aTime = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
    const bTime = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;

    if (aTime !== bTime) {
      return bTime - aTime;
    }
    return (a.nickname || "").localeCompare(b.nickname || "");
  });

  if (currentUsers.length === 0) {
    usersContainer.innerHTML = renderNoUsers();
  } else {
    usersContainer.innerHTML = currentUsers.map(u => renderUserCard(u)).join("");
  }

  // Attach click handler to clear unread indicator when opening chat with a user
  usersContainer.querySelectorAll(".user-item").forEach(item => {
    item.addEventListener("click", () => {
      const userId = parseInt(item.dataset.userId, 10);
      if (userId) {
        markUserRead(userId);
        const unreadDot = item.querySelector(".unread-dot");
        if (unreadDot) unreadDot.remove();
      }
    });
  });
}

function renderUserCard(user) {
  const avatarChar = (user.nickname ? user.nickname.charAt(0) : "U").toUpperCase();
  const statusDotClass = user.online ? "status-dot--online" : "status-dot--offline";
  const isUnread = chatState.unreadUserIds && chatState.unreadUserIds.has(user.id);
  const unreadDotHTML = isUnread ? `<span class="unread-dot" title="Unread message"></span>` : "";

  return /* html */ `
    <a href="/messages?userId=${user.id}" data-link class="user-item" data-user-id="${user.id}">
      <div class="avatar">
        <span>${avatarChar}</span>
        <span class="status-dot ${statusDotClass}"></span>
        ${unreadDotHTML}
      </div>
      <div class="user-item__info">
        <span class="user-item__name">${user.nickname}</span>
      </div>
    </a>
  `;
}

export function renderMobileOverlay() {
  const avatarChar = (state.user && state.user.nickname ? state.user.nickname.charAt(0) : "U").toUpperCase();
  const nickname = state.user && state.user.nickname ? state.user.nickname : "user";
  return /* html */ `
    <div id="mobile-categories-overlay" class="mobile-overlay hidden">
      <div class="mobile-overlay__backdrop"></div>
      <div class="mobile-overlay__drawer">
        <div class="mobile-overlay__header">
          <div class="user-info-mobile">
            <div class="avatar">${avatarChar}</div>
            <span class="username">@${nickname}</span>
          </div>
          <button type="button" id="close-mobile-menu-btn" class="mobile-overlay__close-btn" aria-label="Close Menu">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="mobile-overlay__body">
          <div class="mobile-categories-section">
            <h3>Categories</h3>
            <nav id="mobile-categories-list" class="nav-group" aria-label="Mobile Categories">
              <!-- Categories mirrored here for mobile view -->
            </nav>
          </div>

          <div class="mobile-actions">
            <button type="button" class="create-new-post-btn btn btn-accent mobile-post-btn" id="mobile-create-post-btn">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Create Post</span>
            </button>
            <a href="/logout" data-link class="btn logout-btn mobile-logout-btn">
              <i class="fa-solid fa-arrow-right-from-bracket logout-icon"></i>
              <span>Logout</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getCategoryIcon(name) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("general")) return "fa-solid fa-comments";
  if (lower.includes("development") || lower.includes("dev")) return "fa-solid fa-code";
  if (lower.includes("tech")) return "fa-solid fa-laptop-code";
  if (lower.includes("random")) return "fa-solid fa-shuffle";
  return "fa-solid fa-hashtag";
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
      <i class="${getCategoryIcon(cat.name)}"></i>
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

        // If not on home page (/), navigate to home page with category parameter
        if (window.location.pathname !== "/") {
          navigateTo(`/?category=${catId}`);
          return;
        }

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

  // Render checkboxes inside modal dropdown
  const modalDropdownList = document.querySelector("#modal-categories-options");
  if (modalDropdownList) {
    modalDropdownList.innerHTML = categories.map(cat => /* html */ `
      <label class="category-dropdown-item">
        <input type="checkbox" name="modal-post-category" value="${cat.id}" data-name="${cat.name}">
        <span class="category-dropdown-item__label">${cat.name}</span>
      </label>
    `).join("");

    modalDropdownList.querySelectorAll('input[name="modal-post-category"]').forEach(cb => {
      cb.addEventListener("change", updateModalCategoryPills);
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

function updateModalCategoryPills() {
  const selectedCbs = Array.from(document.querySelectorAll('input[name="modal-post-category"]:checked'));
  const pillsContainer = document.querySelector("#modal-selected-category-pills");
  const btnText = document.querySelector("#modal-category-btn-text");

  if (btnText) {
    btnText.textContent = selectedCbs.length === 0 ? "Select categories" : `${selectedCbs.length} Selected`;
  }

  if (pillsContainer) {
    pillsContainer.innerHTML = selectedCbs.map(cb => `
      <span class="selected-pill">
        ${cb.dataset.name}
        <i class="fa-solid fa-xmark modal-remove-pill-btn" data-value="${cb.value}"></i>
      </span>
    `).join("");

    pillsContainer.querySelectorAll(".modal-remove-pill-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const val = e.target.dataset.value;
        const targetCb = document.querySelector(`input[name="modal-post-category"][value="${val}"]`);
        if (targetCb) {
          targetCb.checked = false;
          updateModalCategoryPills();
        }
      });
    });
  }
}

export function initCreatePostModal() {
  const modal = document.querySelector("#create-post-modal");
  if (!modal || modal.dataset.modalInitialized) return;
  modal.dataset.modalInitialized = "true";

  const closeBtn = document.querySelector("#close-modal-btn");
  const dropdownBtn = document.querySelector("#modal-categories-btn");
  const dropdownMenu = document.querySelector("#modal-categories-options");
  const textarea = document.querySelector("#modal-post-content");
  const submitBtn = document.querySelector("#modal-submit-post-btn");
  const errorElement = document.querySelector(".modal-create-post-error");
  const lengthLimitBar = document.querySelector("#modal-length-limit");

  const updateProgress = attachLengthLimit(textarea, lengthLimitBar, 2000);

  const openModal = () => {
    modal.classList.remove("hidden");
    if (textarea) textarea.focus();
    const mobileOverlay = document.querySelector("#mobile-categories-overlay");
    if (mobileOverlay) mobileOverlay.classList.add("hidden");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    if (textarea) textarea.value = "";
    if (errorElement) errorElement.textContent = "";
    document.querySelectorAll('input[name="modal-post-category"]:checked').forEach(cb => cb.checked = false);
    updateModalCategoryPills();
    updateProgress();
    if (dropdownMenu) dropdownMenu.classList.add("hidden");
  };

  // Delegate click for any post buttons across all pages
  document.body.addEventListener("click", (e) => {
    if (e.target.closest(".create-new-post-btn, #mobile-create-post-btn")) {
      e.preventDefault();
      openModal();
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

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

  if (submitBtn && textarea) {
    submitBtn.addEventListener("click", async () => {
      const content = textarea.value.trim();
      if (errorElement) errorElement.textContent = "";

      // 1. Validation: content length
      if (content.length < 5 || content.length > 2000) {
        if (errorElement) errorElement.textContent = "Post content must be between 5 and 2000 characters.";
        return;
      }

      // 2. Validation: categories selection
      const selectedCategories = Array.from(
        document.querySelectorAll('input[name="modal-post-category"]:checked')
      ).map(cb => parseInt(cb.value, 10));

      if (selectedCategories.length < 1) {
        if (errorElement) errorElement.textContent = "Please select at least one category.";
        return;
      }

      // 3. Submit request
      submitBtn.disabled = true;
      if (errorElement) errorElement.textContent = "Publishing post...";

      const res = await createPost({ content, categories: selectedCategories });

      if (res && res.error) {
        if (errorElement) errorElement.textContent = res.error;
        submitBtn.disabled = false;
      } else {
        closeModal();
        submitBtn.disabled = false;

        const path = window.location.pathname;
        let params = {};
        if (path === "/my-posts") params = { filter: "my-posts" };
        else if (path === "/liked-posts") params = { filter: "liked-posts" };
        await loadPosts(params);
      }
    });
  }
}

export async function loadPosts(params = {}) {
  const container = document.querySelector("#posts-container");
  if (!container) return;

  const posts = await getPosts(params);
  if (!posts || posts.length === 0) {
    container.innerHTML = renderNoPosts();
    return;
  }

  container.innerHTML = posts.map(post => {
    const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-GB") : "Recently";
    const categoriesBadges = (post.categories || []).map(cat =>
      `<span class="post-card__category-badge">${cat}</span>`
    ).join(" ");

    const isLiked = post.liked === true;
    const heartIconClass = isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";
    const likedClass = isLiked ? "liked active" : "";

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
          <p>${escapeHTML(post.content)}</p>
          ${categoriesBadges ? `<div class="post-card__categories">${categoriesBadges}</div>` : ""}
        </div>
        <footer class="post-card__actions">
          <a href="/post?id=${post.id}" data-link class="post-card__action-btn comments" aria-label="Comments">
            <i class="fa-regular fa-comment"></i>
            <span>${post.commentsCount || 0}</span>
          </a>
          <button type="button" class="post-card__action-btn likes ${likedClass}" aria-label="Likes">
            <i class="${heartIconClass}"></i>
            <span>${post.likes || 0}</span>
          </button>
        </footer>
      </article>
    `;
  }).join("");
}

export function handleLikes() {
  const postsContainer = document.querySelector("#posts-container");
  if (!postsContainer || postsContainer.dataset.likesBound) return;
  postsContainer.dataset.likesBound = "true";

  postsContainer.addEventListener("click", async (e) => {
    const likesBtn = e.target.closest(".post-card__action-btn.likes");
    if (!likesBtn) return;

    const postCard = likesBtn.closest(".post-card");
    if (!postCard) return;
    const postId = postCard.dataset.postId;
    if (!postId) return;

    likesBtn.disabled = true;
    const res = await toggleLike(postId);
    likesBtn.disabled = false;

    if (!res || res.error) {
      return;
    }

    const isLiked = res.liked === true;
    likesBtn.classList.toggle("liked", isLiked);
    likesBtn.classList.toggle("active", isLiked);

    const countSpan = likesBtn.querySelector("span");
    if (countSpan) countSpan.textContent = res.likes || 0;

    const heartIcon = likesBtn.querySelector("i");
    if (heartIcon) {
      heartIcon.className = isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";
    }

    // If on "liked-posts" view and unliked, dynamically remove card from view
    if (window.location.pathname === "/liked-posts" && !isLiked) {
      postCard.remove();
      if (document.querySelectorAll(".post-card").length === 0) {
        postsContainer.innerHTML = renderNoPosts();
      }
    }
  });
}

export function renderNoUsers() {
  return /* html */ `
    <div class="empty-state">
      <div class="empty-state__icon-circle">
        <i class="fa-solid fa-users-slash"></i>
      </div>
      <h4 class="empty-state__title">No users available</h4>
      <p class="empty-state__description">There are currently no other registered users in the forum.</p>
    </div>
  `;
}

export function renderNoPosts() {
  return /* html */ `
    <div class="empty-state empty-state--card">
      <div class="empty-state__icon-circle">
        <i class="fa-solid fa-folder-open"></i>
      </div>
      <h3 class="empty-state__title">No posts found</h3>
      <p class="empty-state__description">There are no posts in this feed yet. Be the first to start a conversation!</p>
    </div>
  `;
}
