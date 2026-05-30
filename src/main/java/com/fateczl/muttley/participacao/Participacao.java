package com.fateczl.muttley.participacao;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.participante.Participante;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// entidade que registra a participação de um participante em uma palestra com a carga horária cursada
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Participacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Horas é obrigatório")
    @PositiveOrZero(message = "Horas deve ser zero ou positivo")
    private Float horas;

    @ManyToOne
    @JoinColumn(name = "participante_id")
    @NotNull(message = "Participante é obrigatório")
    private Participante participante;

    @ManyToOne
    @JoinColumn(name = "palestra_id")
    @NotNull(message = "Palestra é obrigatória")
    private Palestra palestra;
}
