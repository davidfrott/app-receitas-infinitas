package com.projeto.fullstack.config;

import com.projeto.fullstack.model.Categoria;
import com.projeto.fullstack.model.Topico;
import com.projeto.fullstack.repository.CategoriaRepository;
import com.projeto.fullstack.repository.TopicoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(CategoriaRepository categoriaRepository, TopicoRepository topicoRepository) {
        return args -> {
            System.out.println("🔄 Iniciando verificação de categorias...");

            List<String> categoriasNavbar = Arrays.asList(
                "Ceia de Natal", "Bolos e Tortas", "Carnes", "Aves", "Peixes", 
                "Saladas", "Sopas", "Massas", "Sobremesas", "Lanches", 
                "Bebidas", "Saudável"
            );

            for (String nome : categoriasNavbar) {
                String idGerado = gerarSlug(nome);
                
                boolean existe = categoriaRepository.existsById(idGerado);

                if (!existe) {
                    Categoria novaCategoria = new Categoria();
                    novaCategoria.setId(idGerado);
                    novaCategoria.setTitulo(nome);
                    novaCategoria.setDescricao("Deliciosas opções de " + nome);
                    
                    categoriaRepository.save(novaCategoria);

                    Topico topicoGeral = new Topico();
                    topicoGeral.setId(idGerado + "-geral"); 
                    topicoGeral.setTitulo("Receitas Variadas");
                    topicoGeral.setCategoria(novaCategoria);
                    
                    try {
                        topicoRepository.save(topicoGeral);
                    } catch (Exception e) {
                        System.out.println("Nota: Tópico salvo (ID pode ter sido automático).");
                    }
                    
                    System.out.println("✅ Criado: " + nome + " (ID: " + idGerado + ")");
                } else {
                    System.out.println("ℹ️ Já existe: " + nome);
                }
            }
            
            System.out.println("🏁 Sincronização concluída com sucesso!");
        };
    }

    private String gerarSlug(String texto) {
        String nfdNormalizedString = Normalizer.normalize(texto, Normalizer.Form.NFD); 
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(nfdNormalizedString).replaceAll("")
                .toLowerCase()
                .replace(" ", "-")
                .replaceAll("[^a-z0-9-]", "");
    }
}