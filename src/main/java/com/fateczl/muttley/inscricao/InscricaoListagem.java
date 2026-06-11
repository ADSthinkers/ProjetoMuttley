package com.fateczl.muttley.inscricao;

import java.time.LocalDateTime;

public record InscricaoListagem(
    Long id,
    String participanteNome,
    String palestraTitulo,
    LocalDateTime dataInscricao,
    LocalDateTime dataCheckin,
    StatusInscricao status
) {}
