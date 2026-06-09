package com.fateczl.muttley.palestrante;

import jakarta.validation.constraints.NotBlank;

public record PalestranteDTO(
    Long id,
    @NotBlank(message = "Nome é obrigatório") String nome,
    String cpf,
    String email,
    String miniCurriculo,
    String formacao,
    String areaAtuacao,
    String instituicao,
    String linkedin,
    String foto
) {}
