package com.fateczl.muttley.auditoria;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

import java.util.List;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    List<Auditoria> findByEntidade(String entidade, Sort sort);
    List<Auditoria> findByEntidadeAndEntidadeId(String entidade, Long entidadeId, Sort sort);
    List<Auditoria> findByAcao(AcaoAuditoria acao, Sort sort);
    List<Auditoria> findByRealizadoPor(String realizadoPor, Sort sort);
}
