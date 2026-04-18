package com.fateczl.muttley.evento;

import java.time.LocalDate;

public record EventoListagem(
    Long id,
    String titulo,
    LocalDate dataInicio,
    String local
) {}