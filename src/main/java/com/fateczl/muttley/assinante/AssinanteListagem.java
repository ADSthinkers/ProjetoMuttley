package com.fateczl.muttley.assinante;

public record AssinanteListagem(
    Long id,
    String nome,
    String cpf,
    String email,
    String cargo
) {}
