package com.fateczl.muttley.palestra;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/palestras")
public class PalestraApiController {

    private final PalestraService service;
    private final PalestraMapper mapper;

    public PalestraApiController(PalestraService service, PalestraMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<List<PalestraDTO>> listar() {
        List<PalestraDTO> lista = service.findAll()
                .stream().map(mapper::toDto).toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PalestraDTO> buscarPorId(@PathVariable Long id) {
        return service.findById(id)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PalestraDTO> criar(@RequestBody @Valid PalestraDTO dto) {
        Palestra salva = service.saveOrUpdate(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PalestraDTO> atualizar(@PathVariable Long id, @RequestBody @Valid PalestraDTO dto) {
        PalestraDTO dtoComId = new PalestraDTO(
                id, dto.titulo(), dto.descricao(),
                dto.competenciaIds(), dto.palestrantes(),
                dto.eventoId(), dto.inicio(), dto.fim()
        );
        Palestra salva = service.saveOrUpdate(dtoComId);
        return ResponseEntity.ok(mapper.toDto(salva));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
