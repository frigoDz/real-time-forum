import { state } from "../state.js";

export function renderHome() {
  const nickname = state.user?.nickname || "User";

  return /* html */`
    <!-- Sticky Header Nav -->
    <header class="header-nav">
      <div class="logo">
        <i class="fa-solid fa-bolt" style="color: var(--accent-color);"></i>
        <span>Real-Time Forum</span>
      </div>
      <div class="user-menu">
        <span style="font-weight: 600; font-size: 0.9rem;">${escapeHTML(nickname)}</span>
        <a href="/logout" data-link style="color: var(--error-color); text-decoration: none; font-size: 0.85rem; font-weight: 600;">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </a>
      </div>
    </header>

    <!-- 3-Column Layout Container -->
    <div class="forum-layout">
      
      <!-- 1. Left Sidebar (Navigation) -->
      <aside class="sidebar-left">
        <nav class="nav-menu">
          <a href="/" data-link class="nav-item active">
            <i class="fa-solid fa-house"></i> <span>Home Feed</span>
          </a>
          <a href="#" class="nav-item">
            <i class="fa-solid fa-hashtag"></i> <span>Tech</span>
          </a>
          <a href="#" class="nav-item">
            <i class="fa-solid fa-"></i> <span>General</span>
          </a>
          <a href="#" class="nav-item">
            <i class="fa-solid fa-code"></i> <span>Code</span>
          </a>
        </nav>
        <button id="newPostTriggerBtn" class="btn-primary btn-accent" style="margin-top: 1rem;">
          <i class="fa-solid fa-plus"></i> <span class="btn-text">New Post</span>
        </button>
      </aside>

      <!-- 2. Center Main Feed -->
      <main class="main-feed">
        <!-- Category Filter Tabs (Replaces Search Input) -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; overflow-x: auto; padding-bottom: 0.25rem;">
          <button class="btn-primary btn-accent" style="width: auto; padding: 0.4rem 1rem; font-size: 0.85rem;">All Posts</button>
          <button class="nav-item" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Tech</button>
          <button class="nav-item" style="padding: 0.4rem 1rem; font-size: 0.85rem;">General</button>
          <button class="nav-item" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Code</button>
        </div>

        <!-- Post Composer -->
        <div class="post-composer" id="postComposerBox">
          <div class="input-field">
            <i class="fa-solid fa-heading input-icon"></i>
            <input type="text" id="postTitleInput" placeholder="Post Title">
          </div>
          <textarea class="composer-textarea" placeholder="What's on your mind?"></textarea>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="input-field" style="width: auto;">
              <select style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                <option value="">Select Category</option>
                <option value="tech">Tech</option>
                <option value="general">General</option>
              </select>
            </div>
            <button class="btn-primary btn-accent" style="width: auto; padding: 0.5rem 1.25rem;">Publish</button>
          </div>
        </div>

        <!-- Posts Feed Demo -->
        <div class="post-card">
          <div class="post-header">
            <div class="post-meta">
              <span style="font-weight: 700; color: var(--text-main);">Alice</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">• 10m ago</span>
            </div>
            <span style="background: var(--bg-tertiary); color: var(--accent-color); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Tech</span>
          </div>
          <h3 class="post-title">Welcome to the Real-Time Forum!</h3>
          <p class="post-body">This single-page application is built using vanilla JavaScript modules and Go WebSockets for real-time messaging...</p>
          <div class="post-footer">
            <div style="cursor: pointer;"><i class="fa-regular fa-comment"></i> 5 </div>
            <div style="cursor: pointer;"><i class="fa-regular fa-heart"></i> 12 </div>
          </div>
        </div>


      </main>

      <!-- 3. Right Sidebar (Scrollable User List for 1000s of users) -->
      <aside class="sidebar-right">
        <div class="section-title">Online Users</div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div class="user-item">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="status-dot online"></span>
              <span style="font-size: 0.9rem; font-weight: 500;">Bob</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">12:30</span>
          </div>
          <div class="user-item">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="status-dot online"></span>
              <span style="font-size: 0.9rem; font-weight: 500;">Charlie</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Yesterday</span>
          </div>
        </div>

        <div class="section-title" style="margin-top: 1.5rem;">Offline Users</div>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div class="user-item">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="status-dot offline"></span>
              <span style="font-size: 0.9rem; font-weight: 500;">David</span>
            </div>
          </div>
        </div>
      </aside>

    </div>
  `;
}

export function initHome() {
  const newPostBtn = document.querySelector("#newPostTriggerBtn");
  const postTitleInput = document.querySelector("#postTitleInput");

  if (newPostBtn && postTitleInput) {
    newPostBtn.addEventListener("click", () => {
      postTitleInput.scrollIntoView({ behavior: "smooth", block: "center" });
      postTitleInput.focus();
    });
  }
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
