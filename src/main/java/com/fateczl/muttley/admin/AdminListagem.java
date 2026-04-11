package com.fateczl.muttley.admin;

public record AdminListagem(
    Long id,
    String login,
    String nome,
    String cpf,
    String email
) {}