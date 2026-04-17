package com.fateczl.muttley.evento;

import java.util.Date;

public record EventoListagem(
    Long id,
    String titulo,
    Date dataInicio,
    String local
) {}