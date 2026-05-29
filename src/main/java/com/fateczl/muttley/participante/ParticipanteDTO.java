package com.fateczl.muttley.participante;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ParticipanteDTO(
    Long id,
    @NotBlank(message = "Nome é obrigatório") String nome,
    String ra,
    @NotBlank(message = "CPF é obrigatório") String cpf,
    @Email(message = "E-mail inválido") @NotBlank(message = "E-mail é obrigatório") String email,
    @Email(message = "Segundo e-mail inválido") String email2,
    String telefone,
    String curso
) {}
