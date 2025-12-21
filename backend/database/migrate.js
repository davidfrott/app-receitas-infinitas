import db from './database.js';

const DADOS_ESQUELETO = {
  "bolos-e-tortas": {
    titulo: "Bolos e Tortas",
    descricao: "Encontre as melhores receitas de bolos e tortas, do café da manhã à sobremesa.",
    topicos: {
      "bolo-de-chocolate": {
        titulo: "Bolos de Chocolate",
        receitas: [
          { id: "btc-01", titulo: "Bolo de Chocolate Tradicional", imagem: "https://images.pexels.com/photos/4110007/pexels-photo-4110007.jpeg", tempo: "50 min", porcoes: 8, ingredientes: "4 ovos\n1 xícara (chá) de açúcar\n2 xícaras (chá) de farinha de trigo\n1 xícara (chá) de chocolate em pó\n1/2 xícara (chá) de óleo\n1 xícara (chá) de água quente\n1 colher (sopa) de fermento em pó", instrucoes: "1. Bata os ovos com o açúcar.\n2. Adicione o óleo, a farinha e o chocolate.\n3. Misture a água quente e o fermento.\n4. Asse em forno a 180°C por 40 minutos." },
          { id: "btc-02", titulo: "Bolo de Cenoura com Cobertura de Chocolate", imagem: "https://images.pexels.com/photos/1027811/pexels-photo-1027811.jpeg", tempo: "1h", porcoes: 10, ingredientes: "3 cenouras médias\n4 ovos\n1/2 xícara (chá) de óleo\n2 xícaras (chá) de açúcar\n2 1/2 xícaras (chá) de farinha de trigo\n1 colher (sopa) de fermento em pó\nPara cobertura: 1 colher (sopa) de manteiga, 3 colheres (sopa) de chocolate em pó, 1 xícara (chá) de açúcar, 1/2 xícara (chá) de leite", instrucoes: "1. Bata no liquidificador a cenoura, os ovos, o óleo e o açúcar.\n2. Despeje em uma tigela e misture a farinha e o fermento.\n3. Asse a 180°C.\n4. Para a cobertura, misture tudo e leve ao fogo baixo." }
        ]
      },
      "bolo-de-banana": {
        titulo: "Bolos de Banana",
        receitas: [
          { id: "btb-01", titulo: "Bolo de Banana de Liquidificador", imagem: "https://images.pexels.com/photos/1910472/pexels-photo-1910472.jpeg", tempo: "45 min", porcoes: 6, ingredientes: "3 bananas nanicas maduras\n3 ovos\n1 xícara (chá) de óleo\n2 xícaras (chá) de açúcar\n2 xícaras (chá) de farinha de rosca\n1 colher (sopa) de fermento em pó", instrucoes: "1. Bata todos os ingredientes (exceto o fermento) no liquidificador.\n2. Adicione o fermento e misture levemente.\n3. Asse em forma untada." }
        ]
      }
    }
  },
  "carnes": {
    titulo: "Carnes",
    descricao: "Receitas suculentas com carne bovina, suína e mais.",
    topicos: {
      "carne-assada": {
        titulo: "Carnes Assadas",
        receitas: [
           { id: "car-01", titulo: "Lagarto Assado ao Molho Madeira", imagem: "https://images.pexels.com/photos/6517328/pexels-photo-6517328.jpeg", tempo: "2h 30m", porcoes: 8, ingredientes: "1 peça de lagarto (aprox. 1.5kg)\nSal e pimenta a gosto\n2 cebolas\n1/2 xícara de vinho tinto\nMolho madeira pronto ou caseiro", instrucoes: "1. Tempere o lagarto com sal e pimenta.\n2. Sele a carne de todos os lados em uma panela de pressão.\n3. Adicione a cebola e o vinho.\n4. Cozinhe na pressão por 50 minutos.\n5. Retire a carne, fatie e sirva com o molho madeira." }
        ]
      }
    }
  },
  "aves": {
    titulo: "Aves",
    descricao: "Receitas leves e deliciosas com frango, peru e outras aves.",
    topicos: {
       "frango-grelhado": { titulo: "Frango Grelhado", receitas: [] },
       "frango-assado": { titulo: "Frango Assado", receitas: [] }
    }
  },
  "peixes-e-frutos-do-mar": {
    titulo: "Peixes e Frutos do Mar",
    descricao: "Receitas frescas e saborosas do mar.",
    topicos: {
      "peixe-assado": { titulo: "Peixe Assado", receitas: [] },
      "camarao": { titulo: "Camarão", receitas: [] }
    }
  },
  "saladas-e-molhos": {
    titulo: "Saladas e Molhos",
    descricao: "Opções leves, acompanhamentos e molhos saborosos.",
    topicos: {
      "saladas-completas": { titulo: "Saladas Completas", receitas: [] },
      "molhos": { titulo: "Molhos", receitas: [] }
    }
  },
  "sopas": {
    titulo: "Sopas",
    descricao: "Caldeiradas, cremes e sopas para aquecer.",
    topicos: {
      "caldos": { titulo: "Caldos", receitas: [] }
    }
  },
  "massas": {
    titulo: "Massas",
    descricao: "Do espaguete à lasanha, clássicos italianos.",
    topicos: {
      "molho-vermelho": { titulo: "Molho Vermelho", receitas: [] }
    }
  },
  "doces-e-sobremesas": {
    titulo: "Doces e Sobremesas",
    descricao: "Para fechar a refeição com chave de ouro.",
    topicos: {
      "pudim": { titulo: "Pudins", receitas: [] }
    }
  },
  "lanches": {
    titulo: "Lanches",
    descricao: "Receitas rápidas para o lanche da tarde.",
    topicos: {
      "sanduiches": { titulo: "Sanduíches", receitas: [] }
    }
  },
  "bebidas": {
    titulo: "Bebidas",
    descricao: "Sucos, drinks e coquetéis.",
    topicos: {
      "sucos": { titulo: "Sucos", receitas: [] }
    }
  },
  "alimentacao-saudavel": {
    titulo: "Alimentação Saudável",
    descricao: "Receitas fit, low carb e funcionais.",
    topicos: {
      "low-carb": { titulo: "Low Carb", receitas: [] }
    }
  },
  "ceia-de-natal": {
    titulo: "Ceia de Natal",
    descricao: "Receitas especiais para as festas de fim de ano.",
    topicos: {
      "pratos-natalinos": { titulo: "Pratos Natalinos", receitas: [] }
    }
  }
};


console.log("Iniciando migração do banco de dados...");

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS favoritos");
  db.run("DROP TABLE IF EXISTS receitas");
  db.run("DROP TABLE IF EXISTS topicos");
  db.run("DROP TABLE IF EXISTS categorias");
  db.run("DROP TABLE IF EXISTS usuarios");

  console.log("Criando tabelas...");
  
  db.run(`
    CREATE TABLE categorias (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      descricao TEXT
    )
  `);
  
  db.run(`
    CREATE TABLE topicos (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      categoria_id TEXT,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )
  `);

  db.run(`
    CREATE TABLE receitas (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      imagem TEXT,
      tempo TEXT,
      porcoes INTEGER,
      ingredientes TEXT,
      instrucoes TEXT,
      topico_id TEXT,
      FOREIGN KEY (topico_id) REFERENCES topicos(id)
    )
  `);

  db.run(`
    CREATE TABLE usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' 
    )
  `);
  console.log("Tabela 'usuarios' criada.");

  db.run(`
    CREATE TABLE favoritos (
      usuario_id INTEGER NOT NULL,
      receita_id TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (receita_id) REFERENCES receitas(id),
      PRIMARY KEY (usuario_id, receita_id) 
    )
  `);
  console.log("Tabela 'favoritos' criada.");
  
  console.log("Preparando inserções...");
  const stmtCat = db.prepare("INSERT INTO categorias (id, titulo, descricao) VALUES (?, ?, ?)");
  const stmtTop = db.prepare("INSERT INTO topicos (id, titulo, categoria_id) VALUES (?, ?, ?)");
  const stmtRec = db.prepare("INSERT INTO receitas (id, titulo, imagem, tempo, porcoes, ingredientes, instrucoes, topico_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

  console.log("Populando dados de receitas...");
  for (const catId in DADOS_ESQUELETO) {
    const cat = DADOS_ESQUELETO[catId];
    stmtCat.run(catId, cat.titulo, cat.descricao);

    for (const topId in cat.topicos) {
      const top = cat.topicos[topId];
      stmtTop.run(topId, top.titulo, catId);

      for (const rec of top.receitas) {
        stmtRec.run(
          rec.id, 
          rec.titulo, 
          rec.imagem, 
          rec.tempo, 
          rec.porcoes, 
          rec.ingredientes, 
          rec.instrucoes, 
          topId
        );
      }
    }
  }

  stmtCat.finalize();
  stmtTop.finalize();
  stmtRec.finalize();

  console.log("Migração concluída com sucesso!");
});

db.close();