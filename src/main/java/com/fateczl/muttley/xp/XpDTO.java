package com.fateczl.muttley.xp;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

//Notblank?? não inserimos dados aqui

public record XpDTO(
    Long id,
    @NotNull(message ="Horas é obrigatório")
    @PositiveOrZero
    float horas,
    Long palestraId,
    Long alunoId
) {}

