package com.fateczl.muttley.medalha;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador REST que expõe os endpoints de CRUD para medalhas
@RestController
@RequestMapping("/api/medalhas")
public class MedalhaApiController {

    private final MedalhaService service;

    public MedalhaApiController(MedalhaService service) {
        this.service = service;
    }

    // lista todas as medalhas cadastradas
    @GetMapping
    public ResponseEntity<List<MedalhaListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream()
                .map(this::toListagem)
                .toList());
    }

    // busca uma medalha pelo seu identificador
    @GetMapping("/{id}")
    public ResponseEntity<MedalhaDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/participante/{participanteId}")
    public ResponseEntity<List<MedalhaListagem>> listarPorParticipante(@PathVariable Long participanteId) {
        return ResponseEntity.ok(service.listarPorParticipante(participanteId).stream()
                .map(this::toListagem)
                .toList());
    }

    // cria uma nova medalha com os dados fornecidos
    @PostMapping
    public ResponseEntity<MedalhaDTO> criar(@RequestBody @Valid MedalhaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(service.salvarOuAtualizar(dto)));
    }

    // atualiza os dados de uma medalha existente pelo id
    @PutMapping("/{id}")
    public ResponseEntity<MedalhaDTO> atualizar(@PathVariable Long id, @RequestBody @Valid MedalhaDTO dto) {
        MedalhaDTO dtoComId = new MedalhaDTO(id, dto.tipo(), dto.nome(), dto.descricao(),
                dto.participanteId(), dto.palestraId(), dto.dataConquista(), dto.competenciaIds(),
                dto.competenciaId(), dto.xpId(), dto.nivelAlcancado());
        return ResponseEntity.ok(toDto(service.salvarOuAtualizar(dtoComId)));
    }

    // converte a entidade Medalha para o DTO de listagem com nomes das associações
    private MedalhaListagem toListagem(Medalha m) {
        return new MedalhaListagem(
                m.getId(), m.getTipo(), m.getNome(),
                m.getParticipante() != null ? m.getParticipante().getNome() : null,
                m.getPalestra() != null ? m.getPalestra().getTitulo() : null,
                m.getDataConquista(),
                m.getCompetencias() != null
                        ? m.getCompetencias().stream().map(c -> c.getNome()).toList()
                        : List.of(),
                m.getCompetencia() != null ? m.getCompetencia().getNome() : null,
                m.getNivelAlcancado());
    }

    // converte a entidade Medalha para o DTO com ids das associações
    private MedalhaDTO toDto(Medalha m) {
        return new MedalhaDTO(
                m.getId(), m.getTipo(), m.getNome(), m.getDescricao(),
                m.getParticipante() != null ? m.getParticipante().getId() : null,
                m.getPalestra() != null ? m.getPalestra().getId() : null,
                m.getDataConquista(),
                m.getCompetencias() != null
                        ? m.getCompetencias().stream().map(c -> c.getId()).toList()
                        : List.of(),
                m.getCompetencia() != null ? m.getCompetencia().getId() : null,
                m.getXp() != null ? m.getXp().getId() : null,
                m.getNivelAlcancado());
    }

    // remove uma medalha pelo seu identificador
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
