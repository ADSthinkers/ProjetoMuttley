package com.fateczl.muttley.certificado;

import java.time.LocalDateTime;

public record CertificadoListagem(
    Long id,
    String participanteNome,
    String palestraTitulo,
    LocalDateTime dataEmissao,
    Float cargaHoraria,
    String codigoValidacao
) {}
