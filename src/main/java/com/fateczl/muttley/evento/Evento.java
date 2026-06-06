package com.fateczl.muttley.evento;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.patrocinador.Patrocinador;
import com.fateczl.muttley.tipo.Modalidade;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

// entidade que representa um evento que agrupa palestras, com patrocinador e modalidade
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Título é obrigatório")
    private String titulo;

    @Column(length = 1000)
    private String descricao;

    @NotNull(message = "Data de início é obrigatória")
    private LocalDate dataInicio;

    private LocalDate dataFim;

    private String categoria;

    @Enumerated(EnumType.STRING)
    private Modalidade modalidade;

    private String banner;

    @ManyToOne
    @JoinColumn(name = "patrocinador_id")
    private Patrocinador patrocinador;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Palestra> palestras;
}
