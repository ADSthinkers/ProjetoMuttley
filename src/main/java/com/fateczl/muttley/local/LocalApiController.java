package com.fateczl.muttley.local;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locais")
public class LocalApiController {

    private final LocalService service;
    private final LocalMapper mapper;

    public LocalApiController(LocalService service, LocalMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<List<LocalDTO>> listar() {
        List<LocalDTO> lista = service.findAllLocais()
                .stream().map(mapper::toLocalDTO).toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocalDTO> buscarPorId(@PathVariable Long id) {
        return service.procurarPorId(id)
                .map(mapper::toLocalDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LocalDTO> criar(@RequestBody @Valid LocalDTO dto) {
        Local salvo = service.saveOrAtualize(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toLocalDTO(salvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocalDTO> atualizar(@PathVariable Long id, @RequestBody @Valid LocalDTO dto) {
        LocalDTO dtoComId = new LocalDTO(id, dto.nome(), dto.capacidade());
        Local salvo = service.saveOrAtualize(dtoComId);
        return ResponseEntity.ok(mapper.toLocalDTO(salvo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.apagarPorId(id);
        return ResponseEntity.noContent().build();
    }
}
