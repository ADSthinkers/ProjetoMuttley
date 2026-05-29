package com.fateczl.muttley.xp;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record XpDTO(
    Long id,
    @NotNull(message = "Horas é obrigatório")
    @PositiveOrZero
    float horas,
    Long competenciaId,
    Long participanteId
) {}
