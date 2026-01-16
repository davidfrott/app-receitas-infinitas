const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameInput = document.getElementById("name");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const nameError = document.getElementById("name-error");
const nameGroup = document.getElementById("name-group");
const submitBtn = document.getElementById("submit-btn");
const formSubtitle = document.getElementById("form-subtitle");
const toggleToRegister = document.getElementById("toggle-to-register");
const toggleToLogin = document.getElementById("toggle-to-login");
const toggleRegisterLink = document.getElementById("toggle-register-link");
const toggleLoginLink = document.getElementById("toggle-login-link");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let isRegisterMode = false;

toggleRegisterLink.addEventListener("click", (e) => {
  e.preventDefault();
  isRegisterMode = true;
  updateFormMode();
});

toggleLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  isRegisterMode = false;
  updateFormMode();
});

loginForm.addEventListener("submit", function (e) {
  e.preventDefault(); 
  if (!validateForm()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Aguarde...";

  if (isRegisterMode) {
    handleRegister();
  } else {
    handleLogin();
  }
});

async function handleRegister() {
  const nome = nameInput.value;
  const email = emailInput.value;
  const senha = passwordInput.value;

  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro ao registar");

    alert("Registo bem-sucedido! Pode fazer login agora.");
    isRegisterMode = false;
    updateFormMode();

  } catch (error) {
    showFormError(error.message);
  } finally {
    submitBtn.disabled = false;
    updateFormMode();
  }
}

async function handleLogin() {
  const email = emailInput.value;
  const senha = passwordInput.value;

  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro ao fazer login");

    const { token, user, message } = data;

    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    alert(message); 
    window.location.href = "app.html"; 

  } catch (error) {
    showFormError(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Entrar";
  }
}

function showFormError(message) {
  emailError.textContent = message;
  emailInput.classList.add("invalid");
}

function updateFormMode() {
  clearErrors();
  if (isRegisterMode) {
    nameGroup.classList.remove("hidden");
    formSubtitle.textContent = "Crie sua conta para continuar";
    submitBtn.textContent = "Registar";
    toggleToRegister.classList.add("hidden");
    toggleToLogin.classList.remove("hidden");
  } else {
    nameGroup.classList.add("hidden");
    formSubtitle.textContent = "Entre com sua conta para continuar";
    submitBtn.textContent = "Entrar";
    toggleToRegister.classList.remove("hidden");
    toggleToLogin.classList.add("hidden");
  }
}

function clearErrors() {
  emailError.textContent = "";
  passwordError.textContent = "";
  nameError.textContent = "";
  emailInput.classList.remove("invalid");
  passwordInput.classList.remove("invalid");
  nameInput.classList.remove("invalid");
}

function validateForm() {
  clearErrors();
  let isValid = true;
  if (!validateEmail()) isValid = false;
  if (!validatePassword()) isValid = false;
  if (isRegisterMode && !validateName()) isValid = false;
  return isValid;
}

function validateEmail() {
  if (!emailInput.value) {
    emailError.textContent = "E-mail é obrigatório.";
    emailInput.classList.add("invalid");
    return false;
  }
  if (!EMAIL_REGEX.test(emailInput.value)) {
    emailError.textContent = "Por favor, insira um e-mail válido.";
    emailInput.classList.add("invalid");
    return false;
  }
  return true;
}

function validatePassword() {
  if (!passwordInput.value) {
    passwordError.textContent = "Senha é obrigatória.";
    passwordInput.classList.add("invalid");
    return false;
  }
  if (passwordInput.value.length < 6) {
    passwordError.textContent = "A senha deve ter pelo menos 6 caracteres.";
    passwordInput.classList.add("invalid");
    return false;
  }
  return true;
}

function validateName() {
  if (!nameInput.value) {
    nameError.textContent = "Nome é obrigatório.";
    nameInput.classList.add("invalid");
    return false;
  }
  return true;
}