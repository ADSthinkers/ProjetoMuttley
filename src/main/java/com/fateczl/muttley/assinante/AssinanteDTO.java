package com.fateczl.muttley.assinante;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AssinanteDTO(
    Long id,
    @NotBlank(message = "Nome é obrigatório")
    String nome,
    @NotBlank(message = "CPF é obrigatório")
    String cpf,
    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    String email,
    @NotBlank(message = "Cargo é obrigatório")
    String cargo,
    @NotNull(message = "Assinatura é obrigatória")
    byte[] assinatura
) {}
