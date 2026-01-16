package com.projeto.fullstack.controller;

import com.projeto.fullstack.model.Receita;
import com.projeto.fullstack.model.Usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favoritos")
@CrossOrigin
public class FavoritoController {

    @GetMapping
    public ResponseEntity<Set<Receita>> listarFavoritos(@AuthenticationPrincipal Usuario usuario) {
        if (usuario == null) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(usuario.getFavoritos());
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> listarIdsFavoritos(@AuthenticationPrincipal Usuario usuario) {
        if (usuario == null) {
            return ResponseEntity.ok(List.of());
        }
        
        List<Long> ids = usuario.getFavoritos().stream()
                .map(Receita::getId)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(ids);
    }
}