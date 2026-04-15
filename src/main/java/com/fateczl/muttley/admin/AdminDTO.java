package com.fateczl.muttley.admin;

public record AdminDTO(
    Long id,
    String login,
    String senha,
    String nome,
    String cpf,
    String email
) {}