package com.fateczl.muttley.auditoria;

import java.time.LocalDateTime;

public record AuditoriaListagem(
    Long id,
    AcaoAuditoria acao,
    String entidade,
    Long entidadeId,
    String descricao,
    LocalDateTime dataHora,
    String realizadoPor
) {}
