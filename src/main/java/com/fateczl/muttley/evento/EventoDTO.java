package com.fateczl.muttley.evento;

import java.util.Date;

public record EventoDTO(
    Long id,
    String titulo,
    Date dataInicio,
    String local
) {}