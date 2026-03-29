package com.fateczl.muttley.palestra;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PalestraDTO(
    Long id, 

    @NotBlank(message = "Título obrigatório")
    @Size(max = 50, message = "Título não pode ultrapassar de 50 caracteres")
    String titulo,

    @NotBlank(message = "Descrição obrigatória")
    String descricao,

    @NotEmpty(message = "Competência(s) são obrigatórias")
    List<@NotNull(message = "Competência não pode estar vazia") Long> competencia_ids,

    @NotEmpty(message = "Palestrante(s) são obrigatórios")
    List<@NotBlank(message = "Nome do palestrante não pode ser vazio") String> palestrantes,

    @NotNull(message = "Data/Horario inicial é obrigatório")
    @FutureOrPresent(message = "Data/hora inicial inválida")
    LocalDateTime inicio,

    @NotNull(message = "Data/Horario final é obrigatório")
    @Future(message = "Data/hora final deve ser futura")
    LocalDateTime fim
) {}
