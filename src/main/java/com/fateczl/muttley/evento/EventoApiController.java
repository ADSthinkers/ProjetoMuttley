package com.fateczl.muttley.evento;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador REST que expõe os endpoints de CRUD para eventos com registro de auditoria
@RestController
@RequestMapping("/api/eventos")
public class EventoApiController {

    private final EventoService service;
    private final EventoMapper mapper;
    private final AuditoriaService auditoriaService;

    public EventoApiController(EventoService service, EventoMapper mapper,
                                AuditoriaService auditoriaService) {
        this.service = service;
        this.mapper = mapper;
        this.auditoriaService = auditoriaService;
    }

    // lista todos os eventos cadastrados
    @GetMapping
    public ResponseEntity<List<EventoListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream().map(mapper::toListagemDto).toList());
    }

    // busca um evento pelo seu identificador
    @GetMapping("/{id}")
    public ResponseEntity<EventoDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id).map(mapper::toAtualizacaoDto).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // cria um novo evento e registra a ação no log de auditoria
    @PostMapping
    public ResponseEntity<EventoDTO> criar(@RequestBody @Valid EventoDTO dto,
                                            HttpServletRequest request) {
        Evento salvo = service.salvarOuAtualizar(dto);
        auditoriaService.registrar(AcaoAuditoria.CRIADO, "Evento", salvo.getId(),
                "Evento criado: " + salvo.getTitulo(), ator(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toAtualizacaoDto(salvo));
    }

    // atualiza os dados de um evento existente e registra a alteração no log de auditoria
    @PutMapping("/{id}")
    public ResponseEntity<EventoDTO> atualizar(@PathVariable Long id,
                                                @RequestBody @Valid EventoDTO dto,
                                                HttpServletRequest request) {
        EventoDTO dtoComId = new EventoDTO(id, dto.titulo(), dto.descricao(), dto.dataInicio(),
                dto.dataFim(), dto.localId(), dto.categoria(), dto.modalidade(),
                dto.vagas(), dto.banner(), dto.patrocinadorId());
        Evento salvo = service.salvarOuAtualizar(dtoComId);
        auditoriaService.registrar(AcaoAuditoria.ALTERADO, "Evento", salvo.getId(),
                "Evento alterado: " + salvo.getTitulo(), ator(request));
        return ResponseEntity.ok(mapper.toAtualizacaoDto(salvo));
    }

    // remove um evento pelo id após registrar a exclusão no log de auditoria
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, HttpServletRequest request) {
        auditoriaService.registrar(AcaoAuditoria.DELETADO, "Evento", id,
                "Evento " + id + " excluído", ator(request));
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // extrai o identificador do autor da ação a partir da chave de API da requisição
    private String ator(HttpServletRequest request) {
        String key = request.getHeader("X-API-KEY");
        return key != null ? "api:" + key : "sistema";
    }
}
