package com.fateczl.muttley.aluno;

public record AlunoListagem(
    Long id,
    String nome,
    String ra,
    String cpf,
    String email
) {}