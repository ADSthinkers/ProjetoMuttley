package com.fateczl.muttley.auditoria;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador REST que expõe endpoints de consulta aos registros de auditoria
@RestController
@RequestMapping("/api/auditorias")
public class AuditoriaApiController {

    private final AuditoriaService service;

    public AuditoriaApiController(AuditoriaService service) {
        this.service = service;
    }

    // lista auditorias com filtros opcionais por entidade, id, ação ou ator
    @GetMapping
    public ResponseEntity<List<AuditoriaListagem>> listar(
            @RequestParam(required = false) String entidade,
            @RequestParam(required = false) Long entidadeId,
            @RequestParam(required = false) AcaoAuditoria acao,
            @RequestParam(required = false) String realizadoPor) {

        List<Auditoria> lista;

        if (entidade != null && entidadeId != null) {
            lista = service.listarPorEntidadeEId(entidade, entidadeId);
        } else if (entidade != null) {
            lista = service.listarPorEntidade(entidade);
        } else if (acao != null) {
            lista = service.listarPorAcao(acao);
        } else if (realizadoPor != null) {
            lista = service.listarPorAtor(realizadoPor);
        } else {
            lista = service.listarTodos();
        }

        return ResponseEntity.ok(lista.stream().map(this::toListagem).toList());
    }

    // converte a entidade Auditoria para o DTO de listagem
    private AuditoriaListagem toListagem(Auditoria a) {
        return new AuditoriaListagem(a.getId(), a.getAcao(), a.getEntidade(),
                a.getEntidadeId(), a.getDescricao(), a.getDataHora(), a.getRealizadoPor());
    }
}
