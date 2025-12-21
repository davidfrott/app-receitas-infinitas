const categoryContent = document.getElementById("category-content");
const breadcrumbsContainer = document.getElementById("breadcrumbs-container");

let userFavoriteIds = new Set();
const token = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', loadCategoryPage);
categoryContent.addEventListener('click', (e) => {
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

async function loadCategoryPage() {
  await fetchFavoriteIds();
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get('id');
  if (!categoryId) {
    showError("Nenhuma categoria foi especificada.");
    return;
  }

  try {
    const response = await fetch(`/api/categorias/${categoryId}`);
    if (!response.ok) {
      throw new Error(`A categoria "${categoryId}" não foi encontrada.`);
    }
    const categoria = await response.json();
    document.title = `${categoria.titulo} | Receitas Infinitas`;
    buildBreadcrumbs(categoria);

    categoryContent.innerHTML = `
      <h1 class="category-page-title">${categoria.titulo}</h1>
      <p class="category-page-description">${categoria.descricao}</p>
    `;

    for (const topico of categoria.topicos) {
      const topicTitleEl = document.createElement('h2');
      topicTitleEl.className = 'topic-title';
      topicTitleEl.textContent = topico.titulo;
      categoryContent.appendChild(topicTitleEl);

      const recipeGridEl = document.createElement('div');
      recipeGridEl.className = 'meals-container';

      if (topico.receitas && topico.receitas[0] !== null) {
        appendRecipes(topico.receitas, recipeGridEl);
      } else {
        recipeGridEl.innerHTML = `<p>Nenhuma receita encontrada para este tópico.</p>`;
      }
      categoryContent.appendChild(recipeGridEl);
    }
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

function buildBreadcrumbs(categoria) {
  breadcrumbsContainer.innerHTML = `
    <div class="breadcrumbs">
      <a href="app.html">Receitas Infinitas</a>
      <span class="separator">&gt;</span>
      <span>${categoria.titulo}</span>
    </div>
  `;
}

function showError(message) {
  breadcrumbsContainer.innerHTML = "";
  categoryContent.innerHTML = `<p class="error-message">${message}</p>`;
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