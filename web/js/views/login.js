import { login } from "../api/auth.js";
import { navigateTo } from "../router.js";

export function renderLogin() {
  return /* html */`
    <div class="auth-wrapper">
      <form class="auth-form">
        <h1 class="form-title">Welcome Back</h1>
        <div>
          <label for="identifier">Identifier</label>
          <div class="input-field">
            <i class="fa-solid fa-user input-icon"></i>
            <input type="text" name="identifier" id="identifier" placeholder="Nickname or Email" required minlength="3" maxlength="254">
          </div>
        </div>
        <div>
          <label for="password">Password</label>
          <div class="input-field">
            <i class="fa-solid fa-lock input-icon"></i>
            <input type="password" name="password" id="password" placeholder="Password" required minlength="8" maxlength="72">
            <button type="button" id="togglePasswordBtn" class="toggle-password-btn" title="Show/Hide Password">
              <i class="fa-solid fa-eye"></i>
            </button>
          </div>
        </div>
        <div>
          <input type="submit" id="loginBtn" class="btn-primary" value="Sign in">
        </div>
        <p class="error"></p>
        <div class="auth-footer">
          <a href="/register" data-link>Don't have an account? Register</a>
        </div>
      </form>
    </div>
  `;
}

export function initLogin() {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  // Toggle Password Visibility with FontAwesome Eye Icons
  const passwordInput = form.querySelector("#password");
  const toggleBtn = form.querySelector("#togglePasswordBtn");
  if (passwordInput && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      toggleBtn.innerHTML = isPassword 
        ? `<i class="fa-solid fa-eye-slash"></i>` 
        : `<i class="fa-solid fa-eye"></i>`;
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identifier = form.querySelector("#identifier").value.trim();
    const password = passwordInput.value;
    const submitBtn = form.querySelector("#loginBtn");
    const errorElement = form.querySelector(".error");
    errorElement.textContent = "";

    if (identifier.length < 3 || identifier.length > 254) {
      errorElement.textContent = "Identifier must be between 3 and 254 characters.";
      return;
    }

    if (password.length < 8 || password.length > 72) {
      errorElement.textContent = "Password must be between 8 and 72 characters.";
      return;
    }

    submitBtn.disabled = true;
    errorElement.textContent = "Signing in...";

    const res = await login(identifier, password);

    if (res && !res.error) {
      navigateTo("/");
    } else {
      errorElement.textContent = res?.error || "Invalid identifier or password!";
      submitBtn.disabled = false;
    }
  });
}