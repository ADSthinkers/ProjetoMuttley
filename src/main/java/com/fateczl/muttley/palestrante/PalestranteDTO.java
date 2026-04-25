package com.fateczl.muttley.palestrante;

public record PalestranteDTO(
    Long id,
    String nome,
    String cpf,
    String email,
    String senha
) {}
