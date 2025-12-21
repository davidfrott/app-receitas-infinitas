const favoritesGrid = document.getElementById("favorites-grid");
const token = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', loadFavoritesPage);

async function loadFavoritesPage() {
  if (!token) {
    alert("Você precisa estar logado para ver seus favoritos.");
    window.location.href = "index.html"; 
    return;
  }

  try {
    const response = await fetch('/api/favoritos', {
      headers: { 'Authorization': `Bearer ${token}` }
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
    const cardHtml = `
      <a href="recipe.html?id=${receita.id}" class="meal">
        <img src="${receita.imagem}" alt="${receita.titulo}">
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
    `;
    container.innerHTML += cardHtml;
  });
}