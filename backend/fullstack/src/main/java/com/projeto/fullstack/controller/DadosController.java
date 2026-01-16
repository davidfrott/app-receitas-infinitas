package com.projeto.fullstack.controller;

import com.projeto.fullstack.model.Categoria;
import com.projeto.fullstack.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dados") 
public class DadosController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping("/form-data")
    public ResponseEntity<List<Map<String, Object>>> getDadosParaFormulario() {
        List<Categoria> categorias = categoriaRepository.findAll();

        List<Map<String, Object>> resposta = categorias.stream().map(categoria -> {
            Map<String, Object> catMap = new HashMap<>();
            catMap.put("categoriaId", categoria.getId()); 
            catMap.put("categoriaTitulo", categoria.getTitulo()); 
            
            List<Map<String, Object>> topicos = categoria.getTopicos().stream().map(topico -> {
                Map<String, Object> topMap = new HashMap<>();
                topMap.put("id", topico.getId());
                topMap.put("titulo", topico.getTitulo());
                return topMap;
            }).collect(Collectors.toList());

            catMap.put("topicos", topicos);
            return catMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resposta);
    }
}