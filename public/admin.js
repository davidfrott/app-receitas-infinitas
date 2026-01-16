const userNameSpan = document.getElementById("user-name");
const form = document.getElementById("add-recipe-form");
const formMessage = document.getElementById("form-message");
const submitButton = document.getElementById("submit-recipe");
const categoriaSelect = document.getElementById("categoria-select");
const topicoSelect = document.getElementById("topico-select");

const token = localStorage.getItem('authToken');
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

let formDataCache = [];

async function initializeAdminPage() {
  if (!token || !currentUser) {
    alert("Acesso negado. Por favor, faça login.");
    window.location.href = "index.html";
    return; 
  }
  
  userNameSpan.textContent = currentUser.nome || "Usuário";
  
  try {
    const response = await fetch('http://localhost:8080/api/dados/form-data', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Não foi possível carregar os dados do formulário.');
    
    formDataCache = await response.json();
    populateCategoriaSelect(formDataCache);

  } catch (error) {
    console.error(error);
    formMessage.textContent = `Erro: ${error.message}`;
    formMessage.className = "error";
  }
}

function populateCategoriaSelect(data) {
  categoriaSelect.innerHTML = `<option value="">Selecione uma categoria</option>`;
  
  data.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria.categoriaId;
    option.textContent = categoria.categoriaTitulo;
    categoriaSelect.appendChild(option);
  });
}


function handleCategoriaChange() {
  const selectedCategoriaId = categoriaSelect.value;
  topicoSelect.innerHTML = `<option value="">Selecione um tópico</option>`;

  if (!selectedCategoriaId) {
    topicoSelect.disabled = true;
    return;
  }

  const categoria = formDataCache.find(c => c.categoriaId === selectedCategoriaId);
  
  if (categoria && categoria.topicos && categoria.topicos[0].id !== null) {
    categoria.topicos.forEach(topico => {
      const option = document.createElement('option');
      option.value = topico.id;
      option.textContent = topico.titulo;
      topicoSelect.appendChild(option);
    });
    topicoSelect.disabled = false; 
  } else {
    topicoSelect.innerHTML = `<option value="">Nenhum tópico encontrado</option>`;
    topicoSelect.disabled = true;
  }
}


async function handleAddRecipe(e) {
  e.preventDefault(); 

  if (!categoriaSelect.value || !topicoSelect.value) {
    formMessage.textContent = "Por favor, selecione uma categoria e um tópico.";
    formMessage.className = "error";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Salvando...";
  formMessage.textContent = "";

  const formData = {
    titulo: document.getElementById("titulo").value,
    imagem: document.getElementById("imagem").value,
    tempo: document.getElementById("tempo").value,
    porcoes: parseInt(document.getElementById("porcoes").value, 10),
    ingredientes: document.getElementById("ingredientes").value,
    instrucoes: document.getElementById("instrucoes").value,
    topicoId: document.getElementById("topico-select").value 
  };

  try {
    const response = await fetch('http://localhost:8080/api/receitas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Não foi possível salvar a receita.");

    formMessage.textContent = "Receita salva com sucesso!";
    formMessage.className = "success";
    form.reset(); 
    
    topicoSelect.innerHTML = `<option value="">Selecione uma categoria primeiro</option>`;
    topicoSelect.disabled = true;

  } catch (error) {
    formMessage.textContent = `Erro: ${error.message}`;
    formMessage.className = "error";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Salvar Receita";
  }
}

initializeAdminPage();

form.addEventListener('submit', handleAddRecipe);

categoriaSelect.addEventListener('change', handleCategoriaChange);