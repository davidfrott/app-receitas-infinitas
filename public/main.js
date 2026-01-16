const API_URL = 'http://localhost:8080/api';
let userFavoriteIds = new Set();
const token = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', () => {
    const logoLink = document.querySelector(".logo-link");
    if (logoLink) {
        logoLink.addEventListener("click", (e) => {
            e.preventDefault();
            initializePage();
        });
    }

    initializePage();
});

async function initializePage() {
    const recipeGrid = document.getElementById("recipe-grid");
    const infiniteLoader = document.getElementById("infinite-loader");

    if (!recipeGrid) return;

    setupClicks(recipeGrid);
    await fetchFavoriteIds(); 
    recipeGrid.innerHTML = "";
    
    document.getElementById("recipe-heading")?.classList.remove("hidden");
    if(infiniteLoader) infiniteLoader.classList.remove("hidden");
    
    setupRecipeFeed();
}

function setupClicks(element) {
    if (!element) return;
    element.addEventListener('click', (e) => {
        const favoriteBtn = e.target.closest('.favorite-btn');
        if (favoriteBtn) {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(favoriteBtn.dataset.id, favoriteBtn);
        }
    });
}

async function fetchFavoriteIds() {
    if (!token) return;
    try {
        const response = await fetch(`${API_URL}/favoritos/ids`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const ids = await response.json();
            userFavoriteIds = new Set(ids);
        }
    } catch (error) { console.error("Erro ao buscar favoritos:", error); }
}

function setupRecipeFeed() {
    const recipeGrid = document.getElementById("recipe-grid");
    const loader = document.querySelector('.loader');
    
    if (recipeGrid) recipeGrid.innerHTML = "";
    if (loader) loader.classList.remove("hidden");
    
    loadMoreRecipes();
}

async function loadMoreRecipes() {
    const recipeGrid = document.getElementById("recipe-grid");
    const loader = document.querySelector('.loader');

    try {
        const response = await fetch(`${API_URL}/receitas/populares?limit=12`);
        const recipes = await response.json();
        
        if (loader) loader.classList.add("hidden");
        
        if (recipes.length === 0) {
            if (recipeGrid) recipeGrid.innerHTML = '<p style="padding:20px; width:100%; text-align:center;">Nenhuma receita encontrada.</p>';
            return;
        }

        appendRecipes(recipes, recipeGrid);
        
    } catch (error) {
        console.error(error);
        if (recipeGrid) recipeGrid.innerHTML = "<p>Erro ao conectar com o servidor.</p>";
        if (loader) loader.classList.add("hidden");
    }
}

function appendRecipes(recipes, container) {
    if (!container) return;
    recipes.forEach(receita => {
        const isFavorited = userFavoriteIds.has(receita.id);
        const favoritedClass = isFavorited ? 'favorited' : '';
        const favoriteBtnHtml = token ? `
            <button class="favorite-btn ${favoritedClass}" data-id="${receita.id}" title="Favoritar">
                <i class="fas fa-heart"></i>
            </button>` : '';

        const imgUrl = receita.imagem || 'https://via.placeholder.com/300?text=Sem+Imagem';

        const cardHtml = `
            <div class="meal">
                ${favoriteBtnHtml} 
                <a href="recipe.html?id=${receita.id}" class="meal-link-wrapper">
                    <img src="${imgUrl}" alt="${receita.titulo}">
                    <div class="meal-info">
                        <h3 class="meal-title">${receita.titulo}</h3>
                        <div class="meal-meta">
                            <span><i class="fas fa-clock"></i> ${receita.tempo || 'N/A'}</span>
                            <span><i class="fas fa-user-friends"></i> ${receita.porcoes || '?'} porções</span>
                        </div>
                    </div>
                </a>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

async function toggleFavorite(recipeId, buttonEl) {
    if (!token) return alert("Faça login.");
    buttonEl.disabled = true;
    try {
        const response = await fetch(`${API_URL}/receitas/${recipeId}/favoritar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 403) {
            alert("Sessão expirada.");
            window.location.href = "index.html";
            return;
        }

        const data = await response.json();
        if (data.favoritado) {
            buttonEl.classList.add('favorited');
            userFavoriteIds.add(parseInt(recipeId));
        } else {
            buttonEl.classList.remove('favorited');
            userFavoriteIds.delete(parseInt(recipeId));
        }
    } catch (e) { console.error(e); } 
    finally { buttonEl.disabled = false; }
}