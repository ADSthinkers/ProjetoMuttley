package com.fateczl.muttley.evento;

import com.fateczl.muttley.tipo.Modalidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record EventoDTO(
    Long id,
    @NotBlank(message = "Título é obrigatório") String titulo,
    String descricao,
    @NotNull(message = "Data de início é obrigatória") LocalDate dataInicio,
    LocalDate dataFim,
    String categoria,
    Modalidade modalidade,
    String banner,
    Long patrocinadorId
) {}
