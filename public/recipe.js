const recipeContent = document.getElementById("recipe-content");
const breadcrumbsContainer = document.getElementById("breadcrumbs-container");

document.addEventListener('DOMContentLoaded', loadRecipePage);

async function loadRecipePage() {
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get('id');

  if (!recipeId) {
    showError("Nenhuma receita foi especificada.");
    return;
  }

  try {
    const response = await fetch(`/api/receitas/${recipeId}`);
    if (!response.ok) {
      throw new Error(`A receita com ID "${recipeId}" não foi encontrada.`);
    }

    const receita = await response.json();

    document.title = `${receita.titulo} | Receitas Infinitas`;

    buildBreadcrumbs(receita);

    buildRecipeHtml(receita);

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
      <a href="category.html?id=${receita.categoriaId}">${receita.categoriaTitulo}</a>
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
        <h1 class="recipe-title">${receita.titulo}</h1>
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

function showError(message) {
  breadcrumbsContainer.innerHTML = ""; 
  recipeContent.innerHTML = `<p class="error-message">${message}</p>`;
}