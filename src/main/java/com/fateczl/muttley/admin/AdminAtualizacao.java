package com.fateczl.muttley.admin;

public record AdminAtualizacao(
    Long id,
    String login,
    String senha,
    String nome,
    String cpf,
    String email
) {}