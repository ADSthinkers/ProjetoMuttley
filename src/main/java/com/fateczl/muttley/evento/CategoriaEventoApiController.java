package com.fateczl.muttley.evento;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias-evento")
public class CategoriaEventoApiController {

    private final CategoriaEventoService service;

    public CategoriaEventoApiController(CategoriaEventoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaEventoDTO>> listar() {
        List<CategoriaEventoDTO> categorias = service.listarTodos()
                .stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaEventoDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CategoriaEventoDTO> criar(@RequestBody @Valid CategoriaEventoDTO dto) {
        CategoriaEvento salva = service.salvarOuAtualizar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaEventoDTO> atualizar(@PathVariable Long id,
                                                        @RequestBody @Valid CategoriaEventoDTO dto) {
        CategoriaEventoDTO dtoComId = new CategoriaEventoDTO(id, dto.nome());
        CategoriaEvento salva = service.salvarOuAtualizar(dtoComId);
        return ResponseEntity.ok(toDTO(salva));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    private CategoriaEventoDTO toDTO(CategoriaEvento categoria) {
        return new CategoriaEventoDTO(categoria.getId(), categoria.getNome());
    }
}
