const recipeGrid = document.getElementById("recipe-grid");
const categoryGrid = document.getElementById("category-grid");
const recipeHeading = document.getElementById("recipe-heading");
const categoryHeading = document.getElementById("category-heading");
const logoLink = document.querySelector(".logo-link");
const infiniteLoader = document.getElementById("infinite-loader");
const infiniteLoaderSpinner = infiniteLoader.querySelector('.loader');

const RECIPES_PER_PAGE = 6;
let currentPage = 0;
let intersectionObserver;
let userFavoriteIds = new Set();
const token = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', initializePage);
logoLink.addEventListener("click", (e) => {
  e.preventDefault();
  initializePage();
});
recipeGrid.addEventListener('click', (e) => {
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

async function initializePage() {
  await fetchFavoriteIds(); 
  currentPage = 0;
  recipeGrid.innerHTML = "";
  categoryGrid.innerHTML = "";
  
  categoryHeading.classList.remove("hidden");
  categoryGrid.classList.remove("hidden");
  recipeHeading.classList.remove("hidden");
  recipeGrid.classList.remove("hidden");
  infiniteLoader.classList.remove("hidden");
  
  displayCategories();
  setupRecipeFeed();
}

async function displayCategories() {
  categoryGrid.innerHTML = "";
  try {
    const response = await fetch('/api/categorias');
    if (!response.ok) throw new Error('Falha ao buscar categorias');
    const categorias = await response.json();
    categorias.forEach(categoria => {
      const cardHtml = `
        <a href="category.html?id=${categoria.id}" class="category-card">
          <div class="category-card-content">
            <h3 class="category-card-title">
              <i class="fas fa-folder"></i>
              ${categoria.titulo}
            </h3>
            <p class="category-card-description">
              ${categoria.descricao}
            </p>
          </div>
        </a>
      `;
      categoryGrid.innerHTML += cardHtml;
    });
  } catch (error) {
    console.error(error);
    categoryGrid.innerHTML = "<p>Erro ao carregar categorias.</p>";
  }
}

function setupRecipeFeed() {
  currentPage = 0;
  recipeGrid.innerHTML = "";
  recipeHeading.textContent = "Receitas Populares 🍲";
  infiniteLoaderSpinner.classList.remove("hidden");
  loadMoreRecipes();
}

async function loadMoreRecipes() {
  infiniteLoaderSpinner.classList.remove("hidden");
  try {
    const response = await fetch('/api/receitas/populares?limit=12');
    if (!response.ok) throw new Error('Falha ao buscar receitas');
    const recipesToLoad = await response.json();
    
    if (currentPage === 0) {
      appendRecipes(recipesToLoad, recipeGrid);
      currentPage++; 
    }
    
    infiniteLoaderSpinner.classList.add("hidden");
  } catch (error) {
    console.error(error);
    recipeGrid.innerHTML = "<p>Erro ao carregar receitas.</p>";
    infiniteLoaderSpinner.classList.add("hidden");
  }
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

function setupIntersectionObserver() {
  if (intersectionObserver) intersectionObserver.disconnect();
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