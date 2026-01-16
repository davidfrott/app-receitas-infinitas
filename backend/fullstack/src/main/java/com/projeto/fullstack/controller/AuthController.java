package com.projeto.fullstack.controller;

import com.projeto.fullstack.model.Usuario;
import com.projeto.fullstack.repository.UsuarioRepository;
import com.projeto.fullstack.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private TokenService tokenService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario user) {
        if (usuarioRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "Este e-mail já está registrado."));
        }
        
        if (usuarioRepository.count() == 0) {
            user.setRole("admin");
        } else {
            user.setRole("user");
        }

        user.setSenha(passwordEncoder.encode(user.getSenha()));
        usuarioRepository.save(user);
        
        return ResponseEntity.status(201).body(Map.of("message", "Usuário registrado com sucesso!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String senha = body.get("senha");
        
        Optional<Usuario> userOpt = usuarioRepository.findByEmail(email);
        
        if (userOpt.isPresent() && passwordEncoder.matches(senha, userOpt.get().getSenha())) {
            String token = tokenService.gerarToken(userOpt.get());
            
            return ResponseEntity.ok(Map.of(
                "message", "Login bem-sucedido!",
                "token", token,
                "user", userOpt.get()
            ));
        }
        return ResponseEntity.status(401).body(Map.of("message", "E-mail ou senha incorretos."));
    }
}