package com.fateczl.muttley.palestra;

import com.fateczl.muttley.tipo.Modalidade;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public record PalestraDTO(
    Long id,

    @NotBlank(message = "Título obrigatório")
    @Size(max = 50, message = "Título não pode ultrapassar de 50 caracteres")
    String titulo,

    @NotBlank(message = "Descrição obrigatória")
    String descricao,

    @NotNull(message = "Selecione pelo menos uma competência")
    List<Long> competenciaIds,

    @NotEmpty(message = "Selecione pelo menos um palestrante")
    List<Long> palestranteIds,

    Long eventoId,

    @NotNull(message = "Data/Horario inicial é obrigatório")
    @FutureOrPresent(message = "Data/hora inicial inválida")
    LocalDateTime inicio,

    @NotNull(message = "Data/Horario final é obrigatório")
    @Future(message = "Data/hora final deve ser futura")
    LocalDateTime fim,

    String qrCodeToken,
    TipoPalestra tipo,
    Modalidade modalidade,
    Float cargaHoraria,
    Integer vagas,
    String banner
) {}
