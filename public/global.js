
function handleSearchRedirect() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
  }
}

function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  alert("Você saiu da sua conta.");
  window.location.href = "index.html"; 
}

function setupProfileButton() {
  const profileBtn = document.getElementById("profile-btn");
  const profileDropdown = document.getElementById("profile-dropdown");
  const profileNameSpan = document.getElementById("profile-name");

  if (!profileBtn || !profileDropdown) return;

  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (token && user) {
    profileNameSpan.textContent = user.nome.split(' ')[0]; 

    profileDropdown.innerHTML = `
      <a href="profile.html">Minha Conta</a>
      <a href="favoritos.html">Receitas Favoritas</a> 
      <a href="edit-profile.html">Edição do Perfil</a>
    `;
    
    if (user.role === 'admin') {
      profileDropdown.innerHTML += `
        <a href="admin.html" class="admin-link">Painel de Administrador</a>
      `;
    }
    
    profileDropdown.innerHTML += `
      <a href="#" id="logout-btn" class="logout-link">Sair</a>
    `;

    profileBtn.addEventListener("click", () => {
      profileDropdown.classList.toggle("hidden");
    });
    
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        handleLogout();
      });
    }

  } else {
    profileNameSpan.textContent = "Entrar";
    profileBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", handleSearchRedirect);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSearchRedirect();
    });
  }
  
  setupProfileButton();
});