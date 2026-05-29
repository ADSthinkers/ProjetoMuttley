package com.fateczl.muttley.competencia;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/competencias")
public class CompetenciaApiController {

    private final CompetenciaService service;
    private final CompetenciaMapper mapper;

    public CompetenciaApiController(CompetenciaService service, CompetenciaMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<List<CompetenciaDTO>> listar() {
        List<CompetenciaDTO> lista = service.findAllCompetencias()
                .stream().map(mapper::toCompetenciaDTO).toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompetenciaDTO> buscarPorId(@PathVariable Long id) {
        return service.procurarPorId(id)
                .map(mapper::toCompetenciaDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CompetenciaDTO> criar(@RequestBody @Valid CompetenciaDTO dto) {
        Competencia salva = service.saveOrAtualize(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toCompetenciaDTO(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompetenciaDTO> atualizar(@PathVariable Long id, @RequestBody @Valid CompetenciaDTO dto) {
        CompetenciaDTO dtoComId = new CompetenciaDTO(id, dto.nome(), dto.tipo());
        Competencia salva = service.saveOrAtualize(dtoComId);
        return ResponseEntity.ok(mapper.toCompetenciaDTO(salva));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.apagarPorId(id);
        return ResponseEntity.noContent().build();
    }
}
