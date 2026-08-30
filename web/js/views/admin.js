export function renderAdmin() {
  return /* html */`
    <div id="admin-view" class="admin-container">
      <header class="admin-header">
        <div class="admin-brand">
          <i class="fa-solid fa-shield-halved"></i>
          <h1>Database Admin Dashboard</h1>
        </div>
        <a href="/" data-link class="btn btn-accent admin-exit-btn">
          <i class="fa-solid fa-house"></i> Exit Admin
        </a>
      </header>

      <nav class="admin-tabs">
        <button type="button" class="admin-tab active" data-tab="users">
          <i class="fa-solid fa-users"></i> Users
        </button>
        <button type="button" class="admin-tab" data-tab="sessions">
          <i class="fa-solid fa-key"></i> Sessions / Tokens
        </button>
        <button type="button" class="admin-tab" data-tab="posts">
          <i class="fa-solid fa-newspaper"></i> Posts
        </button>
        <button type="button" class="admin-tab" data-tab="categories">
          <i class="fa-solid fa-tags"></i> Categories
        </button>
        <button type="button" class="admin-tab" data-tab="comments">
          <i class="fa-solid fa-comments"></i> Comments
        </button>
      </nav>

      <div class="admin-toolbar">
        <div class="admin-search">
          <i class="fa-solid fa-magnifying-glass input-icon"></i>
          <input type="search" id="admin-search-input" placeholder="Search across all fields...">
        </div>
        <div class="admin-actions">
          <span id="selected-count-badge" class="selected-count-badge">0 selected</span>
          <button type="button" id="admin-add-category-btn" class="btn btn-primary admin-add-btn hidden">
            <i class="fa-solid fa-plus"></i> New Category
          </button>
          <button type="button" id="batch-delete-btn" class="btn btn-delete-batch" disabled>
            <i class="fa-solid fa-trash"></i> Delete Selected
          </button>
        </div>
      </div>

      <div id="admin-table-container" class="admin-table-wrapper">
        <p class="admin-loading">Loading records...</p>
      </div>

      <!-- Admin Edit Modal -->
      <div id="admin-edit-modal" class="mobile-overlay hidden">
        <div class="mobile-overlay__content admin-edit-modal-content">
          <div class="mobile-overlay__header">
            <h2 id="admin-modal-title">Edit Record</h2>
            <button type="button" id="close-admin-modal-btn" class="mobile-overlay__close-btn">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="admin-edit-form" class="admin-edit-form">
            <div id="admin-modal-body"></div>
            <p id="admin-modal-error" class="error"></p>
            <button type="submit" class="btn btn-accent mt-2">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  `;
}

let activeTab = "users";
let currentData = [];
let selectedIDs = new Set();

export function initAdmin() {
  const tabs = document.querySelectorAll(".admin-tab");
  const searchInput = document.querySelector("#admin-search-input");
  const batchDeleteBtn = document.querySelector("#batch-delete-btn");
  const addCategoryBtn = document.querySelector("#admin-add-category-btn");

  const modal = document.querySelector("#admin-edit-modal");
  const closeModalBtn = document.querySelector("#close-admin-modal-btn");
  const editForm = document.querySelector("#admin-edit-form");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      selectedIDs.clear();
      updateSelectedBadge();

      if (addCategoryBtn) {
        if (activeTab === "categories") {
          addCategoryBtn.classList.remove("hidden");
        } else {
          addCategoryBtn.classList.add("hidden");
        }
      }

      loadAdminData();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderAdminTable(filterData(searchInput.value.trim()));
    });
  }

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
      openCreateCategoryModal();
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }

  if (batchDeleteBtn) {
    batchDeleteBtn.addEventListener("click", async () => {
      if (selectedIDs.size === 0) return;
      
      const confirmDelete = confirm(`Are you sure you want to delete ${selectedIDs.size} selected row(s)?`);
      if (!confirmDelete) return;

      batchDeleteBtn.disabled = true;
      batchDeleteBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;

      const ids = Array.from(selectedIDs);
      const endpoint = `/api/admin/${activeTab}/delete-batch`;

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids })
        });

        if (res.ok) {
          selectedIDs.clear();
          updateSelectedBadge();
          await loadAdminData();
        } else {
          alert("Failed to delete selected rows.");
        }
      } catch (err) {
        console.error("Batch delete error:", err);
        alert("Network error occurred during bulk deletion.");
      } finally {
        batchDeleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Delete Selected`;
      }
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const modalError = document.querySelector("#admin-modal-error");
      if (modalError) modalError.textContent = "";

      const formType = editForm.dataset.type;
      let endpoint = "";
      let payload = {};

      if (formType === "edit-user") {
        endpoint = "/api/admin/users/update";
        payload = {
          id: parseInt(editForm.querySelector("#edit-user-id").value, 10),
          nickname: editForm.querySelector("#edit-user-nickname").value.trim(),
          email: editForm.querySelector("#edit-user-email").value.trim(),
          firstName: editForm.querySelector("#edit-user-firstname").value.trim(),
          lastName: editForm.querySelector("#edit-user-lastname").value.trim(),
          age: parseInt(editForm.querySelector("#edit-user-age").value, 10),
          gender: editForm.querySelector("#edit-user-gender").value
        };
      } else if (formType === "edit-post") {
        endpoint = "/api/admin/posts/update";
        payload = {
          id: parseInt(editForm.querySelector("#edit-post-id").value, 10),
          content: editForm.querySelector("#edit-post-content").value.trim()
        };
      } else if (formType === "create-category") {
        endpoint = "/api/admin/categories/create";
        payload = {
          name: editForm.querySelector("#create-category-name").value.trim()
        };
      } else if (formType === "edit-category") {
        endpoint = "/api/admin/categories/update";
        payload = {
          id: parseInt(editForm.querySelector("#edit-category-id").value, 10),
          name: editForm.querySelector("#edit-category-name").value.trim()
        };
      }

      try {
        const method = (formType === "create-category") ? "POST" : "PUT";
        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok && data.success) {
          modal.classList.add("hidden");
          await loadAdminData();
        } else {
          if (modalError) modalError.textContent = data.error || "Operation failed.";
        }
      } catch (err) {
        if (modalError) modalError.textContent = "Network error during update.";
      }
    });
  }

  loadAdminData();
}

async function loadAdminData() {
  const container = document.querySelector("#admin-table-container");
  if (!container) return;

  container.innerHTML = `<p class="admin-loading">Loading records...</p>`;

  try {
    const res = await fetch(`/api/admin/${activeTab}`);
    const contentType = res.headers.get("content-type") || "";
    
    if (!res.ok || !contentType.includes("application/json")) {
      container.innerHTML = `<p class="admin-error">Unable to load ${activeTab} data. Please ensure backend server is running.</p>`;
      return;
    }

    const data = await res.json();
    currentData = Array.isArray(data) ? data : [];
    renderAdminTable(currentData);
  } catch (err) {
    console.error("Admin load error:", err);
    container.innerHTML = `<p class="admin-error">Network error loading admin panel data.</p>`;
  }
}

function filterData(query) {
  if (!query) return currentData;
  const q = query.toLowerCase();

  return currentData.filter(item => {
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(q)
    );
  });
}

function safeFormatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const isoStr = String(dateStr).replace(" ", "T");
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleString("en-GB");
  } catch (e) {
    return String(dateStr);
  }
}

function renderAdminTable(data) {
  const container = document.querySelector("#admin-table-container");
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<p class="admin-empty">No ${activeTab} records found.</p>`;
    return;
  }

  let tableHTML = "";

  if (activeTab === "users") {
    tableHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="select-all-checkbox"></th>
            <th>ID</th>
            <th>Nickname</th>
            <th>Email</th>
            <th>Full Name</th>
            <th>Age / Gender</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(u => `
            <tr>
              <td><input type="checkbox" class="row-checkbox" value="${u.id}" ${selectedIDs.has(u.id) ? "checked" : ""}></td>
              <td>#${u.id}</td>
              <td><strong>@${u.nickname || "user"}</strong></td>
              <td>${u.email || "-"}</td>
              <td>${u.first_name || ""} ${u.last_name || ""}</td>
              <td>${u.age || "-"} / ${u.gender || "-"}</td>
              <td>${safeFormatDate(u.created_at || u.createdAt)}</td>
              <td>
                <button type="button" class="admin-btn-icon edit-user-btn" data-id="${u.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" class="admin-btn-icon delete-row-btn text-error" data-id="${u.id}"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (activeTab === "sessions") {
    tableHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="select-all-checkbox"></th>
            <th>Session ID</th>
            <th>User ID</th>
            <th>User Handle</th>
            <th>Token Preview</th>
            <th>Expires At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(s => `
            <tr>
              <td><input type="checkbox" class="row-checkbox" value="${s.id}" ${selectedIDs.has(s.id) ? "checked" : ""}></td>
              <td>#${s.id}</td>
              <td>#${s.userId || s.user_id}</td>
              <td><strong>@${s.nickname || "user"}</strong></td>
              <td><code>${s.token ? s.token.substring(0, 18) + "..." : "-"}</code></td>
              <td>${safeFormatDate(s.expiresAt || s.expires_at)}</td>
              <td>
                <button type="button" class="admin-btn-icon delete-row-btn text-error" data-id="${s.id}"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (activeTab === "posts") {
    tableHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="select-all-checkbox"></th>
            <th>Post ID</th>
            <th>Author</th>
            <th>Content Preview</th>
            <th>Categories</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(p => `
            <tr>
              <td><input type="checkbox" class="row-checkbox" value="${p.id}" ${selectedIDs.has(p.id) ? "checked" : ""}></td>
              <td>#${p.id}</td>
              <td><strong>@${p.author || "user"}</strong></td>
              <td>${p.content ? (p.content.length > 60 ? p.content.substring(0, 60) + "..." : p.content) : "-"}</td>
              <td>${Array.isArray(p.categories) && p.categories.length > 0 ? p.categories.join(", ") : "None"}</td>
              <td>${safeFormatDate(p.createdAt || p.created_at)}</td>
              <td>
                <button type="button" class="admin-btn-icon edit-post-btn" data-id="${p.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" class="admin-btn-icon delete-row-btn text-error" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (activeTab === "categories") {
    tableHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="select-all-checkbox"></th>
            <th>Category ID</th>
            <th>Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(c => `
            <tr>
              <td><input type="checkbox" class="row-checkbox" value="${c.id}" ${selectedIDs.has(c.id) ? "checked" : ""}></td>
              <td>#${c.id}</td>
              <td><strong>${c.name}</strong></td>
              <td>
                <button type="button" class="admin-btn-icon edit-category-btn" data-id="${c.id}" data-name="${c.name}"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" class="admin-btn-icon delete-row-btn text-error" data-id="${c.id}"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (activeTab === "comments") {
    tableHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="select-all-checkbox"></th>
            <th>Comment ID</th>
            <th>Post ID</th>
            <th>Author</th>
            <th>Content</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(cm => `
            <tr>
              <td><input type="checkbox" class="row-checkbox" value="${cm.id}" ${selectedIDs.has(cm.id) ? "checked" : ""}></td>
              <td>#${cm.id}</td>
              <td>#${cm.postId}</td>
              <td><strong>@${cm.author || "user"}</strong></td>
              <td>${cm.content ? (cm.content.length > 50 ? cm.content.substring(0, 50) + "..." : cm.content) : "-"}</td>
              <td>${safeFormatDate(cm.createdAt)}</td>
              <td>
                <button type="button" class="admin-btn-icon delete-row-btn text-error" data-id="${cm.id}"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  container.innerHTML = tableHTML;

  // Bind checkbox events
  const selectAllCb = container.querySelector("#select-all-checkbox");
  const rowCbs = container.querySelectorAll(".row-checkbox");

  if (selectAllCb) {
    selectAllCb.checked = data.length > 0 && data.every(item => selectedIDs.has(item.id));

    selectAllCb.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      data.forEach(item => {
        if (isChecked) {
          selectedIDs.add(item.id);
        } else {
          selectedIDs.delete(item.id);
        }
      });
      rowCbs.forEach(cb => cb.checked = isChecked);
      updateSelectedBadge();
    });
  }

  rowCbs.forEach(cb => {
    cb.addEventListener("change", (e) => {
      const id = parseInt(e.target.value, 10);
      if (e.target.checked) {
        selectedIDs.add(id);
      } else {
        selectedIDs.delete(id);
      }
      if (selectAllCb) {
        selectAllCb.checked = data.every(item => selectedIDs.has(item.id));
      }
      updateSelectedBadge();
    });
  });

  // Single Row Action Event Handlers
  container.querySelectorAll(".delete-row-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = parseInt(btn.dataset.id, 10);
      if (!confirm(`Delete row #${id}?`)) return;
      await singleDelete(id);
    });
  });

  container.querySelectorAll(".edit-user-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id, 10);
      const user = currentData.find(u => u.id === id);
      if (user) openEditUserModal(user);
    });
  });

  container.querySelectorAll(".edit-post-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id, 10);
      const post = currentData.find(p => p.id === id);
      if (post) openEditPostModal(post);
    });
  });

  container.querySelectorAll(".edit-category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id, 10);
      const name = btn.dataset.name;
      openEditCategoryModal(id, name);
    });
  });
}

async function singleDelete(id) {
  try {
    const res = await fetch(`/api/admin/${activeTab}/delete-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] })
    });
    if (res.ok) {
      selectedIDs.delete(id);
      updateSelectedBadge();
      await loadAdminData();
    } else {
      alert("Failed to delete record.");
    }
  } catch (err) {
    alert("Network error deleting record.");
  }
}

function openEditUserModal(user) {
  const modal = document.querySelector("#admin-edit-modal");
  const modalTitle = document.querySelector("#admin-modal-title");
  const modalBody = document.querySelector("#admin-modal-body");
  const editForm = document.querySelector("#admin-edit-form");

  modalTitle.textContent = `Edit User @${user.nickname}`;
  editForm.dataset.type = "edit-user";

  modalBody.innerHTML = `
    <input type="hidden" id="edit-user-id" value="${user.id}">
    <div>
      <label>Nickname</label>
      <input type="text" id="edit-user-nickname" value="${user.nickname || ""}" required class="input-field-input">
    </div>
    <div>
      <label>Email</label>
      <input type="email" id="edit-user-email" value="${user.email || ""}" required class="input-field-input">
    </div>
    <div class="input-group mt-1">
      <div>
        <label>First Name</label>
        <input type="text" id="edit-user-firstname" value="${user.first_name || ""}">
      </div>
      <div>
        <label>Last Name</label>
        <input type="text" id="edit-user-lastname" value="${user.last_name || ""}">
      </div>
    </div>
    <div class="input-group mt-1">
      <div>
        <label>Age</label>
        <input type="number" id="edit-user-age" value="${user.age || 18}" min="13" max="120">
      </div>
      <div>
        <label>Gender</label>
        <select id="edit-user-gender">
          <option value="Male" ${user.gender === "Male" ? "selected" : ""}>Male</option>
          <option value="Female" ${user.gender === "Female" ? "selected" : ""}>Female</option>
        </select>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

function openEditPostModal(post) {
  const modal = document.querySelector("#admin-edit-modal");
  const modalTitle = document.querySelector("#admin-modal-title");
  const modalBody = document.querySelector("#admin-modal-body");
  const editForm = document.querySelector("#admin-edit-form");

  modalTitle.textContent = `Edit Post #${post.id}`;
  editForm.dataset.type = "edit-post";

  modalBody.innerHTML = `
    <input type="hidden" id="edit-post-id" value="${post.id}">
    <div>
      <label>Post Content</label>
      <textarea id="edit-post-content" required class="admin-textarea">${post.content || ""}</textarea>
    </div>
  `;

  modal.classList.remove("hidden");
}

function openCreateCategoryModal() {
  const modal = document.querySelector("#admin-edit-modal");
  const modalTitle = document.querySelector("#admin-modal-title");
  const modalBody = document.querySelector("#admin-modal-body");
  const editForm = document.querySelector("#admin-edit-form");

  modalTitle.textContent = "Add New Category";
  editForm.dataset.type = "create-category";

  modalBody.innerHTML = `
    <div>
      <label>Category Name</label>
      <input type="text" id="create-category-name" placeholder="e.g. Technology, Gaming" required class="input-field-input">
    </div>
  `;

  modal.classList.remove("hidden");
}

function openEditCategoryModal(id, name) {
  const modal = document.querySelector("#admin-edit-modal");
  const modalTitle = document.querySelector("#admin-modal-title");
  const modalBody = document.querySelector("#admin-modal-body");
  const editForm = document.querySelector("#admin-edit-form");

  modalTitle.textContent = `Edit Category #${id}`;
  editForm.dataset.type = "edit-category";

  modalBody.innerHTML = `
    <input type="hidden" id="edit-category-id" value="${id}">
    <div>
      <label>Category Name</label>
      <input type="text" id="edit-category-name" value="${name}" required class="input-field-input">
    </div>
  `;

  modal.classList.remove("hidden");
}

function updateSelectedBadge() {
  const badge = document.querySelector("#selected-count-badge");
  const batchBtn = document.querySelector("#batch-delete-btn");

  if (badge) {
    badge.textContent = `${selectedIDs.size} selected`;
  }

  if (batchBtn) {
    batchBtn.disabled = selectedIDs.size === 0;
  }
}
