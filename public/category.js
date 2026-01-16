const API_URL = 'http://localhost:8080/api';
let userFavoriteIds = new Set();
const token = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', () => {
    loadCategoryPage();
});

async function loadCategoryPage() {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('id');

    if (!categoryId) {
        window.location.href = "app.html";
        return;
    }

    await fetchFavoriteIds();
    
    fetch(`${API_URL}/categorias/${categoryId}`)
        .then(res => res.json())
        .then(categoria => {
            document.querySelector('.category-page-title').textContent = categoria.titulo;
            document.querySelector('.category-page-description').textContent = categoria.descricao || `As melhores receitas de ${categoria.titulo}`;
            document.title = `${categoria.titulo} | Receitas Infinitas`;
            
            const breadcrumbs = document.getElementById("breadcrumbs");
            if(breadcrumbs) {
                breadcrumbs.innerHTML = `<a href="app.html">Home</a> > <span>${categoria.titulo}</span>`;
            }
        })
        .catch(err => console.error("Erro ao carregar info da categoria", err));

    const container = document.getElementById('category-recipes-grid');
    const mainContainer = container || document.querySelector('.container'); 
    let grid = document.getElementById("recipes-grid");
    if (!grid) {
        grid = document.createElement("div");
        grid.id = "recipes-grid";
        grid.className = "meals-container";
        mainContainer.appendChild(grid);
    } else {
        grid.innerHTML = "";
    }

    try {
        const response = await fetch(`${API_URL}/receitas/categoria/${categoryId}`);
        const receitas = await response.json();

        if (receitas.length === 0) {
            grid.innerHTML = `<p class="error-message">Ainda não há receitas nesta categoria. Seja o primeiro a adicionar!</p>`;
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

            const card = `
                <div class="meal">
                    ${favoriteBtnHtml}
                    <a href="recipe.html?id=${receita.id}" class="meal-link-wrapper">
                        <img src="${imgUrl}" alt="${receita.titulo}">
                        <div class="meal-info">
                            <h3 class="meal-title">${receita.titulo}</h3>
                            <div class="meal-meta">
                                <span><i class="fas fa-clock"></i> ${receita.tempo}</span>
                                <span><i class="fas fa-user-friends"></i> ${receita.porcoes}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            grid.innerHTML += card;
        });
        
        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('.favorite-btn');
            if (btn) toggleFavorite(btn.dataset.id, btn);
        });

    } catch (error) {
        console.error(error);
        grid.innerHTML = `<p class="error-message">Erro ao carregar receitas.</p>`;
    }
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
    } catch (e) { console.error(e); }
}

async function toggleFavorite(id, btn) {
    if (!token) return alert("Faça login!");
    btn.disabled = true;
    try {
        const res = await fetch(`${API_URL}/receitas/${id}/favoritar`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`}
        });
        const data = await res.json();
        if (data.favoritado) {
            btn.classList.add('favorited');
            userFavoriteIds.add(parseInt(id));
        } else {
            btn.classList.remove('favorited');
            userFavoriteIds.delete(parseInt(id));
        }
    } catch(e) { console.error(e); }
    finally { btn.disabled = false; }
}