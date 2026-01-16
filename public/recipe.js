const recipeContent = document.getElementById("recipe-content");
const breadcrumbsContainer = document.getElementById("breadcrumbs-container");
const API_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', loadRecipePage);

async function loadRecipePage() {
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get('id');

  if (!recipeId) {
    showError("Nenhuma receita foi especificada.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/receitas/${recipeId}`);
    if (!response.ok) {
      throw new Error(`A receita com ID "${recipeId}" não foi encontrada.`);
    }

    const receita = await response.json();

    document.title = `${receita.titulo} | Receitas Infinitas`;

    buildBreadcrumbs(receita);
    buildRecipeHtml(receita);
    
    setupDeleteButton(receita.id); 

  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

function buildBreadcrumbs(receita) {
  breadcrumbsContainer.innerHTML = `
    <div class="breadcrumbs">
      <a href="app.html">Receitas Infinitas</a>
      <span class="separator">&gt;</span>
      <a href="category.html?id=${receita.categoriaId || ''}">${receita.categoriaTitulo || 'Categoria'}</a>
      <span class="separator">&gt;</span>
      <span>${receita.titulo}</span>
    </div>
  `;
}

function buildRecipeHtml(receita) {
  const ingredientsHtml = receita.ingredientes.split('\n').map(ing => `
    <li><i class="fas fa-check-circle"></i> ${ing}</li>
  `).join('');

  const instructionsHtml = receita.instrucoes.split('\n').map(inst => `
    <li>${inst.trim()}</li>
  `).join('');

  recipeContent.innerHTML = `
    <div class="recipe-details">
      <div class="recipe-header">
        
        <div class="title-wrapper" style="display: flex; align-items: center; justify-content: space-between; gap: 15px;">
            <h1 class="recipe-title" style="margin: 0;">${receita.titulo}</h1>
            
            <button id="delete-btn" class="delete-btn hidden" title="Excluir Receita">
               <i class="fas fa-trash-alt"></i>
            </button>
        </div>

        <div class="recipe-meta-info">
          <span>
            <i class="fas fa-clock"></i> ${receita.tempo || 'N/A'}
          </span>
          <span>
            <i class="fas fa-user-friends"></i> ${receita.porcoes || '?'} porções
          </span>
        </div>
      </div>

      <img src="${receita.imagem}" alt="${receita.titulo}" class="recipe-image">

      <div class="recipe-body">
        <div class="recipe-section recipe-ingredients">
          <h2><i class="fas fa-shopping-cart"></i> Ingredientes</h2>
          <ul class="ingredients-list">
            ${ingredientsHtml}
          </ul>
        </div>

        <div class="recipe-section recipe-instructions">
          <h2><i class="fas fa-book-open"></i> Modo de Preparo</h2>
          <ol class="instructions-list">
            ${instructionsHtml}
          </ol>
        </div>
      </div>
    </div>
  `;
}

function setupDeleteButton(recipeId) {
    const deleteBtn = document.getElementById("delete-btn");
    const token = localStorage.getItem('authToken');

    if (!token || !deleteBtn) return;
    
    deleteBtn.classList.remove("hidden"); 

    deleteBtn.addEventListener("click", async () => {
        if (confirm("⚠️ Tem certeza que deseja APAGAR esta receita?\nEssa ação não pode ser desfeita.")) {
            try {
                const response = await fetch(`${API_URL}/receitas/${recipeId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    alert("Receita apagada com sucesso!");
                    window.location.href = "app.html";
                } else {
                    alert("Erro ao apagar. Verifique se você tem permissão.");
                }
            } catch (error) {
                console.error("Erro:", error);
                alert("Erro de conexão ao tentar apagar.");
            }
        }
    });
}

function showError(message) {
  breadcrumbsContainer.innerHTML = ""; 
  recipeContent.innerHTML = `<p class="error-message">${message}</p>`;
}