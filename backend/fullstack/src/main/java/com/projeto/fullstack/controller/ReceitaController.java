package com.projeto.fullstack.controller;

import com.projeto.fullstack.model.Receita;
import com.projeto.fullstack.model.Usuario;
import com.projeto.fullstack.repository.ReceitaRepository;
import com.projeto.fullstack.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/receitas")
@CrossOrigin 
public class ReceitaController {

    @Autowired
    private ReceitaRepository receitaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Receita> listarTodas() {
        return receitaRepository.findAll();
    }

    @GetMapping("/categoria/{id}")
    public List<Receita> buscarPorCategoria(@PathVariable String id) {
        return receitaRepository.findByTopicoCategoriaId(id);
    }

    @GetMapping("/busca")
    public List<Receita> buscar(@RequestParam("q") String query) {
        return receitaRepository.findByTituloContainingIgnoreCase(query);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Receita> buscarPorId(@PathVariable Long id) {
        return receitaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/populares")
    public List<Receita> listarPopulares(@RequestParam(defaultValue = "12") int limit) {
        return receitaRepository.findRandom(limit);
    }

    @PostMapping("/{id}/favoritar")
    public ResponseEntity<?> favoritar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        Optional<Receita> receitaOpt = receitaRepository.findById(id);
        
        if (receitaOpt.isEmpty() || usuario == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Receita ou usuário não encontrado"));
        }

        Receita receita = receitaOpt.get();
        boolean jaFavoritou = usuario.getFavoritos().contains(receita);

        if (jaFavoritou) {
            usuario.getFavoritos().remove(receita);
        } else {
            usuario.getFavoritos().add(receita);
        }

        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of(
            "favoritado", !jaFavoritou,
            "message", jaFavoritou ? "Removido dos favoritos" : "Adicionado aos favoritos"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarReceita(@PathVariable Long id) {
        Optional<Receita> receitaOpt = receitaRepository.findById(id);

        if (receitaOpt.isPresent()) {
            Receita receita = receitaOpt.get();

            List<Usuario> todosUsuarios = usuarioRepository.findAll();
            for (Usuario u : todosUsuarios) {
                if (u.getFavoritos().contains(receita)) {
                    u.getFavoritos().remove(receita);
                    usuarioRepository.save(u);
                }
            }

            receitaRepository.delete(receita);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping
    public ResponseEntity<?> criarReceita(@RequestBody Receita receita) {
        Receita novaReceita = receitaRepository.save(receita);
        return ResponseEntity.ok(novaReceita);
    }
}