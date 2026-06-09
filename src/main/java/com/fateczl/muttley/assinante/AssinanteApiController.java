package com.fateczl.muttley.assinante;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador REST que expõe os endpoints de CRUD para assinantes
@RestController
@RequestMapping("/api/assinantes")
public class AssinanteApiController {

    private final AssinanteService service;
    private final AssinanteMapper mapper;

    public AssinanteApiController(AssinanteService service, AssinanteMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<List<AssinanteListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream().map(mapper::toListagemDTO).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssinanteDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id).map(mapper::toDTO).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AssinanteDTO> criar(@RequestBody @Valid AssinanteDTO dto) {
        Assinante salvo = service.salvarOuAtualizar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDTO(salvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssinanteDTO> atualizar(@PathVariable Long id, @RequestBody @Valid AssinanteDTO dto) {
        AssinanteDTO dtoComId = new AssinanteDTO(id, dto.nome(), dto.cpf(), dto.email(), dto.cargo(), dto.assinatura());
        return ResponseEntity.ok(mapper.toDTO(service.salvarOuAtualizar(dtoComId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
