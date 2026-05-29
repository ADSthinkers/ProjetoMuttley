package com.fateczl.muttley.participacao;

public record ParticipacaoListagem(
    Long id,
    String participanteNome,
    String palestraTitulo,
    Float horas
) {}
