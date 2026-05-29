package com.fateczl.muttley.medalha;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.participante.Participante;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

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
    @JoinColumn(name = "palestra_id")
    private Palestra palestra;

    private LocalDate dataConquista;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "medalha_competencia",
        joinColumns = @JoinColumn(name = "medalha_id"),
        inverseJoinColumns = @JoinColumn(name = "competencia_id")
    )
    private List<Competencia> competencias;
}
