package com.fateczl.muttley.medalha;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medalhas")
public class MedalhaApiController {

    private final MedalhaService service;

    public MedalhaApiController(MedalhaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<MedalhaListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream()
                .map(this::toListagem)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedalhaDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MedalhaDTO> criar(@RequestBody @Valid MedalhaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(service.salvarOuAtualizar(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedalhaDTO> atualizar(@PathVariable Long id, @RequestBody @Valid MedalhaDTO dto) {
        MedalhaDTO dtoComId = new MedalhaDTO(id, dto.tipo(), dto.nome(), dto.descricao(),
                dto.participanteId(), dto.palestraId(), dto.dataConquista(), dto.competenciaIds());
        return ResponseEntity.ok(toDto(service.salvarOuAtualizar(dtoComId)));
    }

    private MedalhaListagem toListagem(Medalha m) {
        return new MedalhaListagem(
                m.getId(), m.getTipo(), m.getNome(),
                m.getParticipante() != null ? m.getParticipante().getNome() : null,
                m.getPalestra() != null ? m.getPalestra().getTitulo() : null,
                m.getDataConquista(),
                m.getCompetencias() != null
                        ? m.getCompetencias().stream().map(c -> c.getNome()).toList()
                        : List.of());
    }

    private MedalhaDTO toDto(Medalha m) {
        return new MedalhaDTO(
                m.getId(), m.getTipo(), m.getNome(), m.getDescricao(),
                m.getParticipante() != null ? m.getParticipante().getId() : null,
                m.getPalestra() != null ? m.getPalestra().getId() : null,
                m.getDataConquista(),
                m.getCompetencias() != null
                        ? m.getCompetencias().stream().map(c -> c.getId()).toList()
                        : List.of());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
