package com.fateczl.muttley.inscricao;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record InscricaoDTO(
    Long id,
    @NotNull(message = "Participante é obrigatório") Long participanteId,
    @NotNull(message = "Palestra é obrigatória") Long palestraId,
    LocalDateTime dataInscricao,
    LocalDateTime dataCheckin,
    StatusInscricao status,
    String qrCodeToken
) {}
