package com.projeto.fullstack.controller;

import com.projeto.fullstack.model.Categoria;
import com.projeto.fullstack.model.Receita;
import com.projeto.fullstack.repository.CategoriaRepository;
import com.projeto.fullstack.repository.ReceitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class PublicDataController {

    @Autowired private CategoriaRepository categoriaRepository;
    @Autowired private ReceitaRepository receitaRepository;

    @GetMapping("/categorias")
    public List<Categoria> getCategorias() {
        return categoriaRepository.findAll();
    }

    @GetMapping("/categorias/{id}")
    public Categoria getCategoriaDetalhes(@PathVariable String id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
    }

    @GetMapping("/busca")
    public List<Receita> buscar(@RequestParam("q") String query) {
        return receitaRepository.findByTituloContainingIgnoreCase(query);
    }
    
}