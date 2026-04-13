package com.fateczl.muttley.aluno;

public record AlunoDTO(
    Long id,
    String nome,
    String ra,
    String cpf,
    String email
) {}