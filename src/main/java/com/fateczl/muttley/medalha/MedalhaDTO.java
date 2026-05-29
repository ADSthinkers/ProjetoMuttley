package com.fateczl.muttley.medalha;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record MedalhaDTO(
    Long id,
    @NotNull(message = "Tipo é obrigatório") TipoMedalha tipo,
    String nome,
    String descricao,
    @NotNull(message = "Participante é obrigatório") Long participanteId,
    @NotNull(message = "Palestra é obrigatória") Long palestraId,
    LocalDate dataConquista,
    List<Long> competenciaIds
) {}
