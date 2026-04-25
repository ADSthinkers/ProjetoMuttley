package com.fateczl.muttley.local;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record LocalDTO(
    Long id,
    @NotBlank(message = "Nome é obrigatório")
    String nome,
    @NotNull(message = "Capacidade é obrigatória")
    @Positive(message = "Capacidade deve ser positiva")
    Integer capacidade
) {}
