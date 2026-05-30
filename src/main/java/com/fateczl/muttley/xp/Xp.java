package com.fateczl.muttley.xp;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.participante.Participante;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "xp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
// entidade que registra o acúmulo de horas de experiência de um participante em uma competência
public class Xp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "xp_id")
    private long id;

    private float horas;

    @ManyToOne
    @JoinColumn(name = "competencia_id")
    private Competencia competencia;

    @ManyToOne
    @JoinColumn(name = "participante_id")
    private Participante participante;
}
