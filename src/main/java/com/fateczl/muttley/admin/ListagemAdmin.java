package com.fateczl.muttley.admin;

public record ListagemAdmin(
    Long id,
    String login,
    String nome,
    String cpf,
    String email
) {}