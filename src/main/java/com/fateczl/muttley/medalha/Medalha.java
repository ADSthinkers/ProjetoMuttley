package com.fateczl.muttley.medalha;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.xp.Xp;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

// entidade que representa uma medalha de participação ou conquista atribuída a um participante
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Medalha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TipoMedalha tipo;

    private String nome;

    @Column(length = 500)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "participante_id")
    private Participante participante;

    @ManyToOne
    @JoinColumn(name = "competencia_id")
    private Competencia competencia;

    @ManyToOne
    @JoinColumn(name = "xp_id")
    private Xp xp;

    private Integer nivelAlcancado;

    private LocalDate dataConquista;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "medalha_competencia",
        joinColumns = @JoinColumn(name = "medalha_id"),
        inverseJoinColumns = @JoinColumn(name = "competencia_id")
    )
    private List<Competencia> competencias;
}
