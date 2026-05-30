package com.fateczl.muttley.auditoria;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/auditoria")
public class AuditoriaController {

    private final AuditoriaService service;

    public AuditoriaController(AuditoriaService service) {
        this.service = service;
    }

    @GetMapping
    public String listar(
            @RequestParam(required = false) String entidade,
            @RequestParam(required = false) AcaoAuditoria acao,
            @RequestParam(required = false) String realizadoPor,
            Model model) {

        List<Auditoria> lista;

        if (entidade != null && !entidade.isBlank() && acao != null) {
            lista = service.listarPorEntidade(entidade.trim());
            lista = lista.stream().filter(a -> a.getAcao() == acao).toList();
        } else if (entidade != null && !entidade.isBlank()) {
            lista = service.listarPorEntidade(entidade.trim());
        } else if (acao != null) {
            lista = service.listarPorAcao(acao);
        } else if (realizadoPor != null && !realizadoPor.isBlank()) {
            lista = service.listarPorAtor(realizadoPor.trim());
        } else {
            lista = service.listarTodos();
        }

        model.addAttribute("listaAuditorias", lista.stream().map(a ->
                new AuditoriaListagem(a.getId(), a.getAcao(), a.getEntidade(),
                        a.getEntidadeId(), a.getDescricao(), a.getDataHora(), a.getRealizadoPor())
        ).toList());

        model.addAttribute("acoes", AcaoAuditoria.values());
        model.addAttribute("filtroEntidade", entidade);
        model.addAttribute("filtroAcao", acao);
        model.addAttribute("filtroRealizadoPor", realizadoPor);

        return "auditoria/listagem";
    }
}
