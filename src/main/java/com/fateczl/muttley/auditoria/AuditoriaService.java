package com.fateczl.muttley.auditoria;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

// serviço responsável por registrar e consultar logs de auditoria do sistema
@Service
public class AuditoriaService {

    private static final Sort DESC = Sort.by("dataHora").descending();

    private final AuditoriaRepository repository;

    public AuditoriaService(AuditoriaRepository repository) {
        this.repository = repository;
    }

    // cria e persiste um novo registro de auditoria com os dados da ação realizada
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

    // retorna todos os registros de auditoria ordenados do mais recente ao mais antigo
    public List<Auditoria> listarTodos() {
        return repository.findAll(DESC);
    }

    // filtra os registros de auditoria pelo tipo de entidade informada
    public List<Auditoria> listarPorEntidade(String entidade) {
        return repository.findByEntidade(entidade, DESC);
    }

    // filtra os registros de auditoria por entidade e id específico do registro
    public List<Auditoria> listarPorEntidadeEId(String entidade, Long entidadeId) {
        return repository.findByEntidadeAndEntidadeId(entidade, entidadeId, DESC);
    }

    // filtra os registros de auditoria pelo tipo de ação realizada
    public List<Auditoria> listarPorAcao(AcaoAuditoria acao) {
        return repository.findByAcao(acao, DESC);
    }

    // filtra os registros de auditoria pelo nome do usuário ou sistema que realizou a ação
    public List<Auditoria> listarPorAtor(String realizadoPor) {
        return repository.findByRealizadoPor(realizadoPor, DESC);
    }
}
