package com.fateczl.muttley.evento;

import java.time.LocalDate;

public record EventoDTO(
    Long id,
    String titulo,
    LocalDate dataInicio,
    String local
) {}