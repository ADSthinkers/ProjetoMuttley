package com.fateczl.muttley.certificado;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CertificadoDTO(
    Long id,
    @NotNull(message = "Participante é obrigatório") Long participanteId,
    @NotNull(message = "Palestra é obrigatória") Long palestraId,
    LocalDateTime dataEmissao,
    Float cargaHoraria,
    String codigoValidacao
) {}
