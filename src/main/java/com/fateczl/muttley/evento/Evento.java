package com.fateczl.muttley.evento;

import java.util.Date;
import java.util.List;

import com.fateczl.muttley.palestra.Palestra;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

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

    @NotNull(message = "Data de início é obrigatória")
    @Temporal(TemporalType.DATE)
    private Date dataInicio;

    @NotBlank(message = "Local é obrigatório")
    private String local;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Palestra> palestras;
}