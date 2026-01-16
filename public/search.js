const searchGrid = document.getElementById("search-results-grid");
const breadcrumbsContainer = document.getElementById("breadcrumbs-container");

let userFavoriteIds = new Set();
const token = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', loadSearchResults);

if (searchGrid) {
    searchGrid.addEventListener('click', (e) => {
        const favoriteBtn = e.target.closest('.favorite-btn');
        if (favoriteBtn) {
            e.preventDefault(); 
            e.stopPropagation(); 
            const recipeId = favoriteBtn.dataset.id;
            toggleFavorite(recipeId, favoriteBtn);
        }
    });
}

async function fetchFavoriteIds() {
    if (!token) return;
    try {
        const response = await fetch('http://localhost:8080/api/favoritos/ids', {
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
        searchGrid.innerHTML = "<p>Por favor, digite um termo na barra de pesquisa.</p>";
        return;
    }

    document.title = `Busca por "${query}" | Receitas Infinitas`;
    
    if(breadcrumbsContainer) {
        breadcrumbsContainer.innerHTML = `
            <div class="breadcrumbs">
              <a href="app.html">Home</a>
              <span class="separator">&gt;</span>
              <span>Busca: "${query}"</span>
            </div>
        `;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/receitas/busca?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) throw new Error('Erro ao buscar receitas.');
        
        const receitas = await response.json();

        searchGrid.innerHTML = "";

        if (receitas.length === 0) {
            searchGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <h3>Nenhuma receita encontrada para "${query}" 😕</h3>
                    <p>Tente buscar por outro ingrediente ou nome.</p>
                </div>
            `;
            return;
        }

        receitas.forEach(receita => {
            const isFavorited = userFavoriteIds.has(receita.id);
            const favoritedClass = isFavorited ? 'favorited' : '';
            
            const favoriteBtnHtml = token ? `
                <button class="favorite-btn ${favoritedClass}" data-id="${receita.id}">
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
                                <span><i class="fas fa-user-friends"></i> ${receita.porcoes || '?'}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            searchGrid.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error(error);
        searchGrid.innerHTML = `<p class="error-message">Erro na busca: ${error.message}</p>`;
    }
}

async function toggleFavorite(recipeId, buttonEl) {
    if (!token) return alert("Faça login para favoritar.");
    buttonEl.disabled = true;
    try {
        const response = await fetch(`http://localhost:8080/api/receitas/${recipeId}/favoritar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
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