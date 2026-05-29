package com.fateczl.muttley.evento;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
public class EventoApiController {

    private final EventoService service;
    private final EventoMapper mapper;

    public EventoApiController(EventoService service, EventoMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<List<EventoListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream().map(mapper::toListagemDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventoDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id).map(mapper::toAtualizacaoDto).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EventoDTO> criar(@RequestBody @Valid EventoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toAtualizacaoDto(service.salvarOuAtualizar(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventoDTO> atualizar(@PathVariable Long id, @RequestBody @Valid EventoDTO dto) {
        EventoDTO dtoComId = new EventoDTO(id, dto.titulo(), dto.descricao(), dto.dataInicio(),
                dto.dataFim(), dto.localId(), dto.categoria(), dto.modalidade(),
                dto.cargaHoraria(), dto.vagas(), dto.banner(), dto.entidadeResponsavel());
        return ResponseEntity.ok(mapper.toAtualizacaoDto(service.salvarOuAtualizar(dtoComId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
