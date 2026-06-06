package com.fateczl.muttley.evento;

import jakarta.validation.constraints.NotBlank;

public record CategoriaEventoDTO(
    Long id,
    @NotBlank(message = "Nome é obrigatório") String nome
) {}
