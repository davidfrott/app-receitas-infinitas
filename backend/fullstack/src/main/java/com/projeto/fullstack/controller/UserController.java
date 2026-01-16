package com.projeto.fullstack.controller;

import com.projeto.fullstack.model.Usuario;
import com.projeto.fullstack.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin
public class UserController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder; 

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(Map.of(
            "id", usuario.getId(),
            "nome", usuario.getNome(),
            "email", usuario.getEmail(),
            "role", usuario.getRole(),
            "totalFavoritos", usuario.getFavoritos().size()
        ));
    }

    @PutMapping("/details")
    public ResponseEntity<?> updateDetails(@RequestBody Map<String, String> dados, @AuthenticationPrincipal Usuario usuario) {
        usuario.setNome(dados.get("nome"));
        usuario.setEmail(dados.get("email"));
        
        usuarioRepository.save(usuario);
        
        return ResponseEntity.ok(Map.of(
            "message", "Perfil atualizado com sucesso!",
            "user", Map.of("nome", usuario.getNome(), "email", usuario.getEmail(), "role", usuario.getRole()),
            "token", "MantenhaOAtual"
        ));
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> dados, @AuthenticationPrincipal Usuario usuario) {
        String senhaAntiga = dados.get("senhaAntiga");
        String senhaNova = dados.get("senhaNova");

        if (!passwordEncoder.matches(senhaAntiga, usuario.getSenha())) {
            return ResponseEntity.badRequest().body(Map.of("message", "A senha antiga está incorreta."));
        }

        usuario.setSenha(passwordEncoder.encode(senhaNova));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Senha atualizada com sucesso!"));
    }
}