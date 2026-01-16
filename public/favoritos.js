const favoritesGrid = document.getElementById("favorites-grid");
const token = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', loadFavoritesPage);

async function loadFavoritesPage() {
  if (!token) {
    alert("Você precisa estar logado para ver seus favoritos.");
    window.location.href = "index.html"; 
    return;
  }

  const authHeader = `Bearer ${token}`;
    
    console.log("--- DIAGNÓSTICO DO TOKEN ---");
    console.log("Token bruto:", token);
    console.log("Cabeçalho montado:", authHeader);

  try {
    const response = await fetch('http://localhost:8080/api/favoritos', {
      headers: { 'Authorization': authHeader}
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar seus favoritos.");
    }
    
    const receitas = await response.json();

    if (receitas.length === 0) {
      favoritesGrid.innerHTML = "<p>Você ainda não favoritou nenhuma receita.</p>";
      return;
    }
    
    appendRecipes(receitas, favoritesGrid);

  } catch (error) {
    console.error(error);
    favoritesGrid.innerHTML = `<p>${error.message}</p>`;
  }
}

function appendRecipes(recipes, container) {
  recipes.forEach(receita => {
    const imgUrl = receita.imagem || 'https://via.placeholder.com/300?text=Sem+Imagem';
    
    const cardHtml = `
      <div class="meal">
        <a href="recipe.html?id=${receita.id}" class="meal-link-wrapper">
          <img src="${imgUrl}" alt="${receita.titulo}">
          <div class="meal-info">
            <h3 class="meal-title">${receita.titulo}</h3>
            <div class="meal-meta">
              <span>
                <i class="fas fa-clock"></i> ${receita.tempo || 'N/A'}
              </span>
              <span>
                <i class="fas fa-user-friends"></i> ${receita.porcoes || '?'} porções
              </span>
            </div>
          </div>
        </a>
      </div>
    `;
    container.innerHTML += cardHtml;
  });
}