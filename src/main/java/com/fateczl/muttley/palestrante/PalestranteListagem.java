package com.fateczl.muttley.palestrante;

public record PalestranteListagem(
    Long id,
    String nome,
    String cpf,
    String email,
    String areaAtuacao,
    String instituicao,
    String linkedin
) {}
