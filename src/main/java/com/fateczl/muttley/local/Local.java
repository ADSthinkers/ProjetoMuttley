package com.fateczl.muttley.local;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(name = "local")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Local {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotNull(message = "Capacidade é obrigatória")
    @Positive(message = "Capacidade deve ser positiva")
    private Integer capacidade;

    public Local(LocalDTO dados) {
        this.nome = dados.nome();
        this.capacidade = dados.capacidade();
    }

    public void atualizarInformacoes(LocalDTO dados) {
        if (dados.nome() != null) {
            this.nome = dados.nome();
        }
        if (dados.capacidade() != null) {
            this.capacidade = dados.capacidade();
        }
    }

}
