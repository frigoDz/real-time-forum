import { navigateTo } from "../router.js";

export function renderAdmin() {
  return /* html */`
    <div style="max-width: 1100px; margin: 2rem auto; padding: 0 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 700; background: linear-gradient(135deg, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Admin Dashboard</h1>
          <p style="color: #9ca3af; font-size: 0.9rem; margin-top: 0.25rem;">Manage database records & user sessions</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button id="refreshAdminBtn" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.85rem;">🔄 Refresh Data</button>
          <a href="/" data-link class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem; text-decoration: none;">Back to App</a>
        </div>
      </div>

      <!-- Stats Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
        <div style="background: #151921; border: 1px solid #2a3042; padding: 1.25rem; border-radius: 12px;">
          <span style="color: #9ca3af; font-size: 0.85rem; font-weight: 500;">Total Registered Users</span>
          <h2 id="totalUsersCount" style="font-size: 1.75rem; font-weight: 700; margin-top: 0.5rem;">--</h2>
        </div>
        <div style="background: #151921; border: 1px solid #2a3042; padding: 1.25rem; border-radius: 12px;">
          <span style="color: #9ca3af; font-size: 0.85rem; font-weight: 500;">Active Sessions</span>
          <h2 id="totalSessionsCount" style="font-size: 1.75rem; font-weight: 700; margin-top: 0.5rem; color: #10b981;">--</h2>
        </div>
      </div>

      <!-- Users Section -->
      <div style="background: #151921; border: 1px solid #2a3042; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>👥 Users Database</span>
        </h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="border-bottom: 1px solid #2a3042; color: #9ca3af;">
                <th style="padding: 0.75rem 1rem;">ID</th>
                <th style="padding: 0.75rem 1rem;">Nickname</th>
                <th style="padding: 0.75rem 1rem;">Name</th>
                <th style="padding: 0.75rem 1rem;">Email</th>
                <th style="padding: 0.75rem 1rem;">Age / Gender</th>
                <th style="padding: 0.75rem 1rem;">Action</th>
              </tr>
            </thead>
            <tbody id="usersTableBody">
              <tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: #9ca3af;">Loading users...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sessions Section -->
      <div style="background: #151921; border: 1px solid #2a3042; border-radius: 12px; padding: 1.5rem;">
        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🔑 Active Sessions</span>
        </h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="border-bottom: 1px solid #2a3042; color: #9ca3af;">
                <th style="padding: 0.75rem 1rem;">Session ID</th>
                <th style="padding: 0.75rem 1rem;">User ID</th>
                <th style="padding: 0.75rem 1rem;">Nickname</th>
                <th style="padding: 0.75rem 1rem;">Token Preview</th>
                <th style="padding: 0.75rem 1rem;">Expires At</th>
                <th style="padding: 0.75rem 1rem;">Action</th>
              </tr>
            </thead>
            <tbody id="sessionsTableBody">
              <tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: #9ca3af;">Loading sessions...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

export function initAdmin() {
  loadAdminData();

  const refreshBtn = document.querySelector("#refreshAdminBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => loadAdminData());
  }
}

async function loadAdminData() {
  await Promise.all([fetchUsers(), fetchSessions()]);
}

async function fetchUsers() {
  const tbody = document.querySelector("#usersTableBody");
  const countEl = document.querySelector("#totalUsersCount");
  if (!tbody) return;

  try {
    const res = await fetch("/api/admin/users");
    if (!res.ok) throw new Error("Failed to fetch users");
    const users = await res.json() || [];

    if (countEl) countEl.textContent = users.length;

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: #9ca3af;">No users found</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(user => `
      <tr style="border-bottom: 1px solid #1e2330;">
        <td style="padding: 0.75rem 1rem; color: #9ca3af;">#${user.ID}</td>
        <td style="padding: 0.75rem 1rem; font-weight: 600;">${escapeHTML(user.Nickname)}</td>
        <td style="padding: 0.75rem 1rem;">${escapeHTML(user.FirstName)} ${escapeHTML(user.LastName)}</td>
        <td style="padding: 0.75rem 1rem; color: #9ca3af;">${escapeHTML(user.Email)}</td>
        <td style="padding: 0.75rem 1rem;">${user.Age} / ${escapeHTML(user.Gender)}</td>
        <td style="padding: 0.75rem 1rem;">
          <button data-delete-user="${user.ID}" style="background: #ef4444; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">Delete</button>
        </td>
      </tr>
    `).join("");

    // Attach click listeners
    tbody.querySelectorAll("[data-delete-user]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-delete-user");
        if (confirm(`Are you sure you want to delete User #${id}?`)) {
          await deleteUser(id);
        }
      });
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: #ef4444;">Failed to load users</td></tr>`;
  }
}

async function fetchSessions() {
  const tbody = document.querySelector("#sessionsTableBody");
  const countEl = document.querySelector("#totalSessionsCount");
  if (!tbody) return;

  try {
    const res = await fetch("/api/admin/sessions");
    if (!res.ok) throw new Error("Failed to fetch sessions");
    const sessions = await res.json() || [];

    if (countEl) countEl.textContent = sessions.length;

    if (sessions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: #9ca3af;">No active sessions</td></tr>`;
      return;
    }

    tbody.innerHTML = sessions.map(s => `
      <tr style="border-bottom: 1px solid #1e2330;">
        <td style="padding: 0.75rem 1rem; color: #9ca3af;">#${s.id}</td>
        <td style="padding: 0.75rem 1rem;">User #${s.userId}</td>
        <td style="padding: 0.75rem 1rem; font-weight: 600;">${escapeHTML(s.nickname)}</td>
        <td style="padding: 0.75rem 1rem; font-family: monospace; color: #9ca3af;">${s.token.substring(0, 12)}...</td>
        <td style="padding: 0.75rem 1rem; color: #9ca3af;">${new Date(s.expiresAt).toLocaleString()}</td>
        <td style="padding: 0.75rem 1rem;">
          <button data-delete-session="${s.id}" style="background: #f59e0b; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">Revoke</button>
        </td>
      </tr>
    `).join("");

    // Attach click listeners
    tbody.querySelectorAll("[data-delete-session]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-delete-session");
        if (confirm(`Revoke Session #${id}?`)) {
          await deleteSession(id);
        }
      });
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: #ef4444;">Failed to load sessions</td></tr>`;
  }
}

async function deleteUser(id) {
  try {
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      loadAdminData();
    } else {
      alert("Failed to delete user");
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteSession(id) {
  try {
    const res = await fetch(`/api/admin/sessions?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      loadAdminData();
    } else {
      alert("Failed to revoke session");
    }
  } catch (err) {
    console.error(err);
  }
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
