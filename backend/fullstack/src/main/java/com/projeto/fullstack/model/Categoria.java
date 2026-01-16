package com.projeto.fullstack.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "categorias")
@EqualsAndHashCode(exclude = "topicos")
public class Categoria {
    @Id
    private String id; 

    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String descricao;

    @OneToMany(mappedBy = "categoria", cascade = CascadeType.ALL)
    @JsonManagedReference 
    private List<Topico> topicos = new ArrayList<>();
}