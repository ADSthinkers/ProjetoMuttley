package com.fateczl.muttley.palestra;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.evento.Evento;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.tipo.Modalidade;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "palestra")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Palestra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descricao;

    @Enumerated(EnumType.STRING)
    private TipoPalestra tipo;

    @Enumerated(EnumType.STRING)
    private Modalidade modalidade;

    private Float cargaHoraria;
    private Integer vagas;
    private String banner;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "palestra_competencia",
        joinColumns = @JoinColumn(name = "palestra_id"),
        inverseJoinColumns = @JoinColumn(name = "competencia_id")
    )
    private List<Competencia> competencias;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "palestra_palestrante",
        joinColumns = @JoinColumn(name = "palestra_id"),
        inverseJoinColumns = @JoinColumn(name = "palestrante_id")
    )
    private List<Palestrante> palestrantes;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

    private LocalDateTime inicio;
    private LocalDateTime fim;

    @Column(unique = true)
    private String qrCodeToken;
}
