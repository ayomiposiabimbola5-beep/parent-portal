const API_BASE_URL = "/api";

function getSessionUser() {
  return {
    loggedIn: sessionStorage.getItem("parentLoggedIn") === "true",
    isStaff: sessionStorage.getItem("isStaff") === "true"
  };
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  let data = {};
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

function showMessage(text, type = "success") {
  const box = document.getElementById("message");
  box.textContent = text;
  box.className = `message ${type}`;
}

function updateStats(parents) {
  document.getElementById("totalParents").textContent = parents.length;
  document.getElementById("activeParents").textContent = parents.filter(p => p.is_active).length;
  document.getElementById("linkedWards").textContent = parents.reduce((sum, p) => sum + (p.linked_wards || 0), 0);
}

function renderParents(parents) {
  const body = document.getElementById("parentsBody");
  if (!parents.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty">No parent accounts have been created yet.</td></tr>';
    updateStats(parents);
    return;
  }

  body.innerHTML = parents.map(parent => `
    <tr>
      <td><strong>${escapeHtml(parent.full_name || "Unnamed Parent")}</strong></td>
      <td>${escapeHtml(parent.username)}</td>
      <td>${escapeHtml(parent.email || "—")}</td>
      <td>${parent.linked_wards || 0}</td>
      <td><span class="status ${parent.is_active ? "active" : "inactive"}">${parent.is_active ? "Active" : "Inactive"}</span></td>
      <td><button class="table-action" data-id="${parent.id}" data-active="${parent.is_active}">${parent.is_active ? "Deactivate" : "Activate"}</button></td>
    </tr>`).join("");

  updateStats(parents);
  body.querySelectorAll(".table-action").forEach(button => {
    button.addEventListener("click", () => toggleParent(button.dataset.id, button.dataset.active === "true"));
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

async function loadParents() {
  const body = document.getElementById("parentsBody");
  body.innerHTML = '<tr><td colspan="6" class="empty">Loading parent accounts...</td></tr>';
  try {
    const parents = await api("/admin/parents/");
    renderParents(parents);
  } catch (error) {
    body.innerHTML = `<tr><td colspan="6" class="empty">${escapeHtml(error.message)}</td></tr>`;
  }
}

async function toggleParent(id, currentStatus) {
  try {
    await api(`/admin/parents/${id}/status/`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !currentStatus })
    });
    await loadParents();
    showMessage(`Parent account ${currentStatus ? "deactivated" : "activated"}.`);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

document.getElementById("parentForm").addEventListener("submit", async event => {
  event.preventDefault();
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const button = document.getElementById("createBtn");

  if (password !== confirmPassword) {
    showMessage("Passwords do not match.", "error");
    return;
  }

  button.disabled = true;
  button.textContent = "Creating...";
  try {
    const result = await api("/admin/parents/", {
      method: "POST",
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, username, password })
    });
    showMessage(`${result.message} Username: ${result.parent.username}`);
    event.target.reset();
    await loadParents();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    button.disabled = false;
    button.textContent = "Create Account";
  }
});

document.getElementById("refreshBtn").addEventListener("click", loadParents);
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try { await api("/logout/", { method: "POST", body: "{}" }); } catch (_) {}
  sessionStorage.removeItem("parentLoggedIn");
  sessionStorage.removeItem("parentName");
  sessionStorage.removeItem("isStaff");
  window.location.href = "login.html";
});

(async function init() {
  const session = getSessionUser();
  if (!session.loggedIn || !session.isStaff) {
    alert("Administrator login required.");
    window.location.href = "login.html";
    return;
  }
  await loadParents();
})();
