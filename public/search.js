const searchHeading = document.getElementById("search-heading");
const searchGrid = document.getElementById("search-results-grid");
const breadcrumbsContainer = document.getElementById("breadcrumbs-container");

let userFavoriteIds = new Set();
const token = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', loadSearchResults);
searchGrid.addEventListener('click', (e) => {
  const favoriteBtn = e.target.closest('.favorite-btn');
  if (favoriteBtn) {
    e.preventDefault(); 
    e.stopPropagation(); 
    const recipeId = favoriteBtn.dataset.id;
    toggleFavorite(recipeId, favoriteBtn);
  }
});

async function fetchFavoriteIds() {
  if (!token) return;
  try {
    const response = await fetch('/api/favoritos/ids', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return;
    const ids = await response.json();
    userFavoriteIds = new Set(ids);
  } catch (error) {
    console.error("Erro ao buscar IDs de favoritos:", error);
  }
}

async function loadSearchResults() {
  await fetchFavoriteIds();
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (!query) {
    showError("Por favor, digite um termo na barra de pesquisa.");
    document.title = "Busca | Receitas Infinitas";
    return;
  }
  document.title = `Busca por "${query}" | Receitas Infinitas`;
  buildBreadcrumbs(query);

  try {
    const response = await fetch(`/api/busca?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Erro ao realizar a busca');
    const results = await response.json();
    displayResults(results, query);
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

function buildBreadcrumbs(query) {
  breadcrumbsContainer.innerHTML = `
    <div class="breadcrumbs">
      <a href="app.html">Receitas Infinitas</a>
      <span class="separator">&gt;</span>
      <span>Busca por "${query}"</span>
    </div>
  `;
}

function displayResults(results, query) {
  searchGrid.innerHTML = "";
  if (results.length === 0) {
    searchHeading.textContent = `Resultados para "${query}"`;
    searchGrid.innerHTML = `<p class="error-message">Nenhuma receita encontrada.</p>`;
    return;
  }
  searchHeading.textContent = `Resultados para "${query}" (${results.length})`;
  appendRecipes(results, searchGrid);
}

function showError(message) {
  searchHeading.textContent = "Erro";
  searchGrid.innerHTML = `<p class="error-message">${message}</p>`;
}

function appendRecipes(recipes, container) {
  recipes.forEach(receita => {
    const isFavorited = userFavoriteIds.has(receita.id);
    const favoritedClass = isFavorited ? 'favorited' : '';
    const favoriteBtnHtml = token ? `
      <button class="favorite-btn ${favoritedClass}" data-id="${receita.id}" title="Favoritar">
        <i class="fas fa-heart"></i>
      </button>
    ` : '';
    const cardHtml = `
      <div class="meal">
        ${favoriteBtnHtml} 
        <a href="recipe.html?id=${receita.id}" class="meal-link-wrapper">
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
      </div>
    `;
    container.innerHTML += cardHtml;
  });
}

async function toggleFavorite(recipeId, buttonEl) {
  if (!token) {
    alert("Você precisa estar logado para favoritar receitas.");
    return;
  }
  buttonEl.disabled = true;
  try {
    const response = await fetch(`/api/receitas/${recipeId}/favoritar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    if (data.favoritado) {
      buttonEl.classList.add('favorited');
      userFavoriteIds.add(recipeId);
    } else {
      buttonEl.classList.remove('favorited');
      userFavoriteIds.delete(recipeId);
    }
  } catch (error) {
    console.error("Erro ao favoritar:", error.message);
    alert(`Erro: ${error.message}`);
  } finally {
    buttonEl.disabled = false;
  }
}