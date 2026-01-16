package com.projeto.fullstack.repository;

import com.projeto.fullstack.model.Receita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceitaRepository extends JpaRepository<Receita, Long> {
    
    List<Receita> findByTituloContainingIgnoreCase(String titulo);
    List<Receita> findByTopicoCategoriaId(String categoriaId);
    @Query(value = "SELECT * FROM receitas ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Receita> findRandom(@Param("limit") int limit);
}