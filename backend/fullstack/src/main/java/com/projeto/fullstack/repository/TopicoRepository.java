package com.projeto.fullstack.repository;

import com.projeto.fullstack.model.Topico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TopicoRepository extends JpaRepository<Topico, String> {
}