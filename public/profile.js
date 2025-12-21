const profileContent = document.getElementById("profile-content");
const token = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', loadProfilePage);

async function loadProfilePage() {
  if (!token) {
    alert("Você precisa estar logado para ver seu perfil.");
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar seu perfil.");
    }
    
    const user = await response.json();

    buildProfileHtml(user);

  } catch (error) {
    console.error(error);
    profileContent.innerHTML = `<p class="error-message">${error.message}</p>`;
  }
}


function buildProfileHtml(user) {
  profileContent.innerHTML = `
    <div class="profile-header">
      <i class="fas fa-user-circle profile-icon"></i>
      <div class="profile-header-info">
        <h1>${user.nome}</h1>
        <p>${user.role === 'admin' ? 'Administrador' : 'Membro'}</p>
      </div>
    </div>
    
    <div class="profile-body">
      <div class="profile-section">
        <h2>Minhas Informações</h2>
        <div class="profile-info-grid">
          <div class="info-card">
            <h3>E-mail</h3>
            <p>${user.email}</p>
          </div>
          <div class="info-card">
            <h3>Receitas Favoritas</h3>
            <p>${user.totalFavoritos}</p>
          </div>
        </div>
        <a href="edit-profile.html" class="edit-link">Editar Perfil &rarr;</a>
      </div>
      
      </div>
  `;
}