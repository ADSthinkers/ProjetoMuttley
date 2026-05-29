package com.fateczl.muttley.participante;

public record ParticipanteListagem(
    Long id,
    String nome,
    String ra,
    String cpf,
    String email,
    String email2,
    String telefone,
    String curso
) {}
