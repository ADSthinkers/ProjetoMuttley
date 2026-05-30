package com.fateczl.muttley.auditoria;

import java.time.LocalDateTime;

// DTO de projeção com os dados de um registro de auditoria para exibição
public record AuditoriaListagem(
    Long id,
    AcaoAuditoria acao,
    String entidade,
    Long entidadeId,
    String descricao,
    LocalDateTime dataHora,
    String realizadoPor
) {}
