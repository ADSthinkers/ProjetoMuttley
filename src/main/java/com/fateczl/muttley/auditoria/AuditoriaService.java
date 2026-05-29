package com.fateczl.muttley.auditoria;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditoriaService {

    private static final Sort DESC = Sort.by("dataHora").descending();

    private final AuditoriaRepository repository;

    public AuditoriaService(AuditoriaRepository repository) {
        this.repository = repository;
    }

    public void registrar(AcaoAuditoria acao, String entidade, Long entidadeId,
                          String descricao, String realizadoPor) {
        Auditoria a = new Auditoria();
        a.setAcao(acao);
        a.setEntidade(entidade);
        a.setEntidadeId(entidadeId);
        a.setDescricao(descricao);
        a.setRealizadoPor(realizadoPor != null ? realizadoPor : "sistema");
        repository.save(a);
    }

    public List<Auditoria> listarTodos() {
        return repository.findAll(DESC);
    }

    public List<Auditoria> listarPorEntidade(String entidade) {
        return repository.findByEntidade(entidade, DESC);
    }

    public List<Auditoria> listarPorEntidadeEId(String entidade, Long entidadeId) {
        return repository.findByEntidadeAndEntidadeId(entidade, entidadeId, DESC);
    }

    public List<Auditoria> listarPorAcao(AcaoAuditoria acao) {
        return repository.findByAcao(acao, DESC);
    }

    public List<Auditoria> listarPorAtor(String realizadoPor) {
        return repository.findByRealizadoPor(realizadoPor, DESC);
    }
}
