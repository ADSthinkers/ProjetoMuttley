package com.fateczl.muttley.xp;

import jakarta.validation.constraints.NotBlank;

//Notblank?? não inserimos dados aqui

public record XpDTO(
    Long id,
    @NotBlank(message ="Horas é obrigatório")
    float horas
) {}

