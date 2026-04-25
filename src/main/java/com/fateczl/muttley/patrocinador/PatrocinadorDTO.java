package com.fateczl.muttley.patrocinador;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PatrocinadorDTO(
    Long id,
    @NotNull(message = "Tipo é obrigatório")
    TipoPatrocinador tipo,
    
    // PJ
    String razaoSocial,
    String nomeFantasia,
    String cnpj,
    String inscricaoEstadual,
    
    // PF
    String nomeCompleto,
    String cpf,
    
    // Contato
    @NotBlank(message = "Telefone é obrigatório")
    String telefone,
    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    String email,
    @NotBlank(message = "Nome do responsável é obrigatório")
    String nomeResponsavel,
    
    // Localização
    @NotBlank(message = "Logradouro é obrigatório")
    String logradouro,
    @NotBlank(message = "Número é obrigatório")
    String numero,
    String complemento,
    @NotBlank(message = "Bairro é obrigatório")
    String bairro,
    @NotBlank(message = "CEP é obrigatório")
    String cep,
    @NotBlank(message = "Cidade é obrigatória")
    String cidade,
    @NotBlank(message = "UF é obrigatória")
    String uf,
    
    // Social
    String linkedin
) {}
