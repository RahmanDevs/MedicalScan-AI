/**
 * MedAI-CV — Enterprise Medical AI Portal
 * Client-side Interaction & Security Handlers
 */

document.addEventListener("DOMContentLoaded", () => {
  // Password Visibility Toggle
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const passwordInput = document.getElementById("accountPassword");
  const toggleIcon = document.getElementById("togglePasswordIcon");

  if (togglePasswordBtn && passwordInput && toggleIcon) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      toggleIcon.className = isPassword ? "bi bi-eye-slash" : "bi bi-eye";
    });
  }

  // Form Submission Handler
  const loginForm = document.getElementById("loginForm");
  const submitBtn = document.getElementById("submitBtn");

  if (loginForm && submitBtn) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("workEmail").value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        return;
      }

      // Simulate Authentication Feedback
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <span>Memverifikasi...</span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        // Redirect seamlessly to the clinical dashboard for PoC demonstration
        window.location.href = "dashboard.html";
      }, 900);
    });
  }
});

