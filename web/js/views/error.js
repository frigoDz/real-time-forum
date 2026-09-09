export function renderError() {
    return /* html */ `
        <div class="auth-wrapper">
          <div class="empty-state empty-state--card" style="max-width: 440px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); padding: 2.5rem 1.5rem;">
            <div class="empty-state__icon-circle">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h1 class="empty-state__title">404 - Page Not Found</h1>
            <p class="empty-state__description">The page or resource you are looking for does not exist or has been moved.</p>
            <a href="/" data-link class="btn btn-accent mt-2" style="text-decoration: none !important;">Back to Home</a>
          </div>
        </div>
    `;
}