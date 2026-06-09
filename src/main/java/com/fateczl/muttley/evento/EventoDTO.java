package com.fateczl.muttley.evento;

import com.fateczl.muttley.tipo.Modalidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record EventoDTO(
    Long id,
    @NotBlank(message = "Título é obrigatório") String titulo,
    String descricao,
    @NotNull(message = "Data de início é obrigatória") LocalDate dataInicio,
    LocalDate dataFim,
    Long categoriaId,
    Modalidade modalidade,
    String banner,
    Long patrocinadorId,
    @NotEmpty(message = "Selecione pelo menos um assinante")
    List<Long> assinanteIds
) {}
