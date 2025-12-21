const detailsForm = document.getElementById("details-form");
const passwordForm = document.getElementById("password-form");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const detailsBtn = document.getElementById("details-submit");
const detailsMsg = document.getElementById("details-message");
const senhaAntigaInput = document.getElementById("senha-antiga");
const senhaNovaInput = document.getElementById("senha-nova");
const passwordBtn = document.getElementById("password-submit");
const passwordMsg = document.getElementById("password-message");
const token = localStorage.getItem('authToken');
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

function initializeEditPage() {
  if (!token || !currentUser) {
    alert("Acesso negado. Por favor, faça login.");
    window.location.href = "index.html";
    return;
  }
  
  nomeInput.value = currentUser.nome;
  emailInput.value = currentUser.email;
}

async function handleUpdateDetails(e) {
  e.preventDefault();
  detailsBtn.disabled = true;
  detailsBtn.textContent = "Salvando...";
  detailsMsg.textContent = "";

  const nome = nomeInput.value;
  const email = emailInput.value;

  try {
    const response = await fetch('/api/profile/details', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nome, email })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    detailsMsg.textContent = "Perfil atualizado com sucesso!";
    detailsMsg.className = "form-message success";
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    
    document.getElementById("profile-name").textContent = data.user.nome.split(' ')[0];

  } catch (error) {
    detailsMsg.textContent = `Erro: ${error.message}`;
    detailsMsg.className = "form-message error";
  } finally {
    detailsBtn.disabled = false;
    detailsBtn.textContent = "Salvar Alterações";
  }
}

async function handleUpdatePassword(e) {
  e.preventDefault();
  passwordBtn.disabled = true;
  passwordBtn.textContent = "Atualizando...";
  passwordMsg.textContent = "";

  const senhaAntiga = senhaAntigaInput.value;
  const senhaNova = senhaNovaInput.value;

  try {
    const response = await fetch('/api/profile/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ senhaAntiga, senhaNova })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    passwordMsg.textContent = "Senha atualizada com sucesso!";
    passwordMsg.className = "form-message success";
    passwordForm.reset(); 

  } catch (error) {
    passwordMsg.textContent = `Erro: ${error.message}`;
    passwordMsg.className = "form-message error";
  } finally {
    passwordBtn.disabled = false;
    passwordBtn.textContent = "Atualizar Senha";
  }
}

initializeEditPage();
detailsForm.addEventListener('submit', handleUpdateDetails);
passwordForm.addEventListener('submit', handleUpdatePassword);