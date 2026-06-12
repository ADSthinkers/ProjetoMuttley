package com.fateczl.muttley.apresentacao;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestrante.Palestrante;
import jakarta.persistence.*;
import lombok.*;

// entidade associativa que representa uma apresentacao de um palestrante em uma palestra
@Entity
@Table(
    name = "apresentacao",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_apresentacao_palestra_palestrante",
        columnNames = {"palestra_id", "palestrante_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Apresentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "palestra_id", nullable = false)
    private Palestra palestra;

    @ManyToOne(optional = false)
    @JoinColumn(name = "palestrante_id", nullable = false)
    private Palestrante palestrante;

    public Apresentacao(Palestra palestra, Palestrante palestrante) {
        this.palestra = palestra;
        this.palestrante = palestrante;
    }
}
