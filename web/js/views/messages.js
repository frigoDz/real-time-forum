import { updateActiveLink } from "./filteredPosts.js";
import { loadCategories, renderHeader, renderLeftAside, renderMobileOverlay, initMobileMenu } from "./forum.js";

export function renderMessages() {
    return /* html */`
        <div class="home-view">
          ${renderHeader()}
          <div class="main-grid">
            ${renderLeftAside()}
            <main id="main-content" class="posts-area">
              <div id="posts-container"><!-- Dynamic messages loaded here via JS --></div>
            </main>
          </div>
          ${renderMobileOverlay()}
        </div>
    `;
}

export function initMessages() {
    updateActiveLink("/messages");
    initMobileMenu();
    loadCategories();
}