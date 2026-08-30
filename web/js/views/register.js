import { register } from "../api/auth.js";
import { navigateTo } from "../router.js";

export function renderRegister() {
  return /* html */`
    <div class="auth-wrapper">
      <form class="auth-form">
        <h1 class="form-title">Create Account</h1>
        <div class="input-group">
          <div>
            <label for="firstName">First name</label>
            <div class="input-field">
              <i class="fa-solid fa-user input-icon"></i>
              <input type="text" name="firstName" id="firstName" placeholder="First name" required minlength="2" maxlength="50">
            </div>
          </div>
          <div>
            <label for="lastName">Last name</label>
            <div class="input-field">
              <i class="fa-solid fa-user input-icon"></i>
              <input type="text" name="lastName" id="lastName" placeholder="Last name" required minlength="2" maxlength="50">
            </div>
          </div>
        </div>
        <div>
          <label for="username">Username</label>
          <div class="input-field">
            <i class="fa-solid fa-at input-icon"></i>
            <input type="text" name="username" id="username" placeholder="Username" required minlength="3" maxlength="30">
          </div>
        </div>
        <div>
          <label for="email">Email</label>
          <div class="input-field">
            <i class="fa-solid fa-envelope input-icon"></i>
            <input type="email" name="email" id="email" placeholder="Email" required maxlength="254">
          </div>
        </div>
        <div class="input-group">
          <div>
            <label for="age">Age</label>
            <div class="input-field">
              <i class="fa-solid fa-calendar input-icon"></i>
              <input type="number" name="age" id="age" placeholder="Age" min="13" max="120" required>
            </div>
          </div>
          <div>
            <label for="gender">Gender</label>
            <div class="input-field">
              <i class="fa-solid fa-venus-mars input-icon"></i>
              <select name="gender" id="gender" required>
                <option value="" disabled selected>Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
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
          <input type="submit" id="registerBtn" class="btn-primary" value="Create Account">
        </div>
        <p class="error"></p>
        <div class="auth-footer">
          <a href="/login" data-link>Already a member? Login</a>
        </div>
      </form>
    </div>
  `;
}

export function initRegister() {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  // Toggle Password Visibility with FontAwesome Icons
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

    const firstName = form.querySelector("#firstName").value.trim();
    const lastName = form.querySelector("#lastName").value.trim();
    const username = form.querySelector("#username").value.trim();
    const email = form.querySelector("#email").value.trim();
    const password = passwordInput.value;
    const ageRaw = form.querySelector("#age").value.trim();
    const gender = form.querySelector("#gender").value.trim();

    const submitBtn = form.querySelector("#registerBtn");
    const errorElement = form.querySelector(".error");
    errorElement.textContent = "";

    // Validation rules
    if (firstName.length < 2 || firstName.length > 50) {
      errorElement.textContent = "First name must be between 2 and 50 characters.";
      return;
    }

    if (lastName.length < 2 || lastName.length > 50) {
      errorElement.textContent = "Last name must be between 2 and 50 characters.";
      return;
    }

    if (username.length < 3 || username.length > 30) {
      errorElement.textContent = "Username must be between 3 and 30 characters.";
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      errorElement.textContent = "Please enter a valid email address.";
      return;
    }

    const ageNum = parseInt(ageRaw, 10);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      errorElement.textContent = "Age must be a number between 13 and 120.";
      return;
    }

    if (gender !== "Male" && gender !== "Female") {
      errorElement.textContent = "Please select a valid gender.";
      return;
    }

    if (password.length < 8 || password.length > 72) {
      errorElement.textContent = "Password must be between 8 and 72 characters.";
      return;
    }

    // Submit payload
    submitBtn.disabled = true;
    errorElement.textContent = "Creating account...";

    const res = await register(username, email, password, firstName, lastName, ageNum, gender);

    if (res && !res.error) {
      navigateTo("/login");
    } else {
      errorElement.textContent = res?.error || "Registration failed. Please try again.";
      submitBtn.disabled = false;
    }
  });
}