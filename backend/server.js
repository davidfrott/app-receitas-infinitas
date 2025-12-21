import express from 'express';
import cors from 'cors';
import path from 'path';
import db from './database/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "sua_chave_secreta_super_segura_12345";
const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json());
const __dirname = path.resolve(new URL('.', import.meta.url).pathname);
const PUBLIC_PATH = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_PATH));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (token == null) return res.status(401).json({ message: "Acesso negado." });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido." });
    req.user = user;
    next(); 
  });
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ message: "Preencha todos os campos." });
    db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, row) => {
      if (err) return res.status(500).json({ message: "Erro de servidor", error: err.message });
      if (row) return res.status(409).json({ message: "Este e-mail já está registado." });
      const senhaHash = await bcrypt.hash(senha, 10);
      db.run("INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)", [nome, email, senhaHash], function(err) {
        if (err) return res.status(500).json({ message: "Erro ao registar", error: err.message });
        if (this.lastID === 1) { db.run("UPDATE usuarios SET role = 'admin' WHERE id = 1"); }
        res.status(201).json({ message: "Usuário registado com sucesso!" });
      });
    });
  } catch (error) { res.status(500).json({ message: "Erro inesperado", error: error.message }); }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: "Preencha todos os campos." });
    db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, user) => {
      if (err) return res.status(500).json({ message: "Erro de servidor", error: err.message });
      if (!user) return res.status(404).json({ message: "E-mail ou senha incorretos." });
      const match = await bcrypt.compare(senha, user.senha_hash);
      if (match) {
        const payload = { id: user.id, email: user.email, nome: user.nome, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });
        res.status(200).json({ message: "Login bem-sucedido!", token: token, user: payload });
      } else {
        res.status(401).json({ message: "E-mail ou senha incorretos." });
      }
    });
  } catch (error) { res.status(500).json({ message: "Erro inesperado", error: error.message }); }
});


app.get('/api/categorias', (req, res) => { db.all("SELECT * FROM categorias ORDER BY titulo", [], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); }); });
app.get('/api/receitas/populares', (req, res) => { const limit = req.query.limit || 12; db.all("SELECT * FROM receitas ORDER BY RANDOM() LIMIT ?", [limit], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); }); });
app.get('/api/categorias/:id', (req, res) => { const categoryId = req.params.id; const sqlCategoria = "SELECT * FROM categorias WHERE id = ?"; const sqlTopicos = `SELECT t.id, t.titulo, json_group_array(json_object('id', r.id, 'titulo', r.titulo, 'imagem', r.imagem, 'tempo', r.tempo, 'porcoes', r.porcoes)) AS receitas FROM topicos t LEFT JOIN receitas r ON r.topico_id = t.id WHERE t.categoria_id = ? GROUP BY t.id`; db.get(sqlCategoria, [categoryId], (err, categoria) => { if (err) return res.status(500).json({ error: err.message }); if (!categoria) return res.status(404).json({ error: "Categoria não encontrada" }); db.all(sqlTopicos, [categoryId], (err, topicos) => { if (err) return res.status(500).json({ error: err.message }); const topicosParsed = topicos.map(t => ({...t, receitas: JSON.parse(t.receitas)})); res.json({ ...categoria, topicos: topicosParsed }); }); }); });
app.get('/api/receitas/:id', (req, res) => { const recipeId = req.params.id; const sql = `SELECT r.*, t.id AS topicoId, t.titulo AS topicoTitulo, c.id AS categoriaId, c.titulo AS categoriaTitulo FROM receitas r JOIN topicos t ON r.topico_id = t.id JOIN categorias c ON t.categoria_id = c.id WHERE r.id = ?`; db.get(sql, [recipeId], (err, row) => { if (err) return res.status(500).json({ error: err.message }); if (!row) return res.status(404).json({ error: "Receita não encontrada" }); res.json(row); }); });
app.get('/api/busca', (req, res) => { const query = req.query.q || ""; const searchTerm = `%${query}%`; const sql = "SELECT * FROM receitas WHERE titulo LIKE ?"; db.all(sql, [searchTerm], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); }); });

app.get('/api/admin/form-data', authenticateToken, (req, res) => { const sql = `SELECT c.id AS categoriaId, c.titulo AS categoriaTitulo, json_group_array(json_object('id', t.id, 'titulo', t.titulo)) AS topicos FROM categorias c LEFT JOIN topicos t ON t.categoria_id = c.id GROUP BY c.id ORDER BY c.titulo`; db.all(sql, [], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); const data = rows.map(row => ({...row, topicos: JSON.parse(row.topicos)})); res.json(data); }); });
app.post('/api/receitas', authenticateToken, (req, res) => { const { titulo, imagem, tempo, porcoes, ingredientes, instrucoes, topicoId } = req.body; if (!titulo || !ingredientes || !instrucoes || !topicoId) return res.status(400).json({ message: "Campos obrigatórios em falta." }); const novoId = `rec-${Date.now()}`; const sql = `INSERT INTO receitas (id, titulo, imagem, tempo, porcoes, ingredientes, instrucoes, topico_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; db.run(sql, [novoId, titulo, imagem, tempo, porcoes, ingredientes, instrucoes, topicoId], function(err) { if (err) return res.status(500).json({ message: "Erro ao salvar no banco de dados.", error: err.message }); res.status(201).json({ message: "Receita adicionada com sucesso!", id: novoId }); }); });
app.post('/api/receitas/:id/favoritar', authenticateToken, (req, res) => { const receitaId = req.params.id; const usuarioId = req.user.id; db.get("SELECT * FROM favoritos WHERE usuario_id = ? AND receita_id = ?", [usuarioId, receitaId], (err, row) => { if (err) return res.status(500).json({ error: err.message }); if (row) { db.run("DELETE FROM favoritos WHERE usuario_id = ? AND receita_id = ?", [usuarioId, receitaId], (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ message: "Receita removida dos favoritos", favoritado: false }); }); } else { db.run("INSERT INTO favoritos (usuario_id, receita_id) VALUES (?, ?)", [usuarioId, receitaId], (err) => { if (err) return res.status(500).json({ error: err.message }); res.json({ message: "Receita adicionada aos favoritos", favoritado: true }); }); } }); });
app.get('/api/favoritos/ids', authenticateToken, (req, res) => { const usuarioId = req.user.id; db.all("SELECT receita_id FROM favoritos WHERE usuario_id = ?", [usuarioId], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); const ids = rows.map(row => row.receita_id); res.json(ids); }); });
app.get('/api/favoritos', authenticateToken, (req, res) => { const usuarioId = req.user.id; const sql = `SELECT r.* FROM receitas r JOIN favoritos f ON r.id = f.receita_id WHERE f.usuario_id = ?`; db.all(sql, [usuarioId], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); }); });
app.get('/api/profile', authenticateToken, (req, res) => { const usuarioId = req.user.id; const sqlUser = "SELECT id, nome, email, role FROM usuarios WHERE id = ?"; const sqlCount = "SELECT COUNT(receita_id) AS totalFavoritos FROM favoritos WHERE usuario_id = ?"; db.get(sqlUser, [usuarioId], (err, user) => { if (err) return res.status(500).json({ error: err.message }); if (!user) return res.status(404).json({ error: "Usuário não encontrado." }); db.get(sqlCount, [usuarioId], (err, count) => { if (err) return res.status(500).json({ error: err.message }); res.json({ ...user, totalFavoritos: count.totalFavoritos || 0 }); }); }); });




app.put('/api/profile/details', authenticateToken, (req, res) => {
  const { nome, email } = req.body;
  const usuarioId = req.user.id;

  if (!nome || !email) {
    return res.status(400).json({ message: "Nome e e-mail são obrigatórios." });
  }

  db.get("SELECT * FROM usuarios WHERE email = ? AND id != ?", [email, usuarioId], (err, row) => {
    if (err) return res.status(500).json({ message: "Erro de servidor", error: err.message });
    if (row) return res.status(409).json({ message: "Este e-mail já está em uso." });

    db.run("UPDATE usuarios SET nome = ?, email = ? WHERE id = ?", [nome, email, usuarioId], (err) => {
      if (err) return res.status(500).json({ message: "Erro ao atualizar perfil", error: err.message });
      
      
      const novoPayload = { 
        id: req.user.id,
        role: req.user.role,
        nome: nome,   
        email: email  
      };

      const token = jwt.sign(novoPayload, JWT_SECRET, { expiresIn: '3h' });
      
      res.json({ 
        message: "Perfil atualizado com sucesso!", 
        user: novoPayload,
        token: token 
      });
    });
  });
});

app.put('/api/profile/password', authenticateToken, (req, res) => {
  const { senhaAntiga, senhaNova } = req.body;
  const usuarioId = req.user.id;

  if (!senhaAntiga || !senhaNova) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  db.get("SELECT senha_hash FROM usuarios WHERE id = ?", [usuarioId], async (err, user) => {
    if (err) return res.status(500).json({ message: "Erro de servidor", error: err.message });
    
    const match = await bcrypt.compare(senhaAntiga, user.senha_hash);
    if (!match) {
      return res.status(401).json({ message: "A senha antiga está incorreta." });
    }
    
    const novaSenhaHash = await bcrypt.hash(senhaNova, 10);
    
    db.run("UPDATE usuarios SET senha_hash = ? WHERE id = ?", [novaSenhaHash, usuarioId], (err) => {
      if (err) return res.status(500).json({ message: "Erro ao atualizar a senha", error: err.message });
      res.json({ message: "Senha atualizada com sucesso!" });
    });
  });
});


app.get('/app', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'app.html')));
app.get('/category', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'category.html')));
app.get('/recipe', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'recipe.html')));
app.get('/search', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'search.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'admin.html'))); 
app.get('/favoritos', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'favoritos.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'profile.html')));
app.get('/edit-profile', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'edit-profile.html')));
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_PATH, 'index.html')));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});