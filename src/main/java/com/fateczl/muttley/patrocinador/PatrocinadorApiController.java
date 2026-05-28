package com.fateczl.muttley.patrocinador;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patrocinadores")
public class PatrocinadorApiController {

    private final PatrocinadorService service;
    private final PatrocinadorMapper mapper;

    public PatrocinadorApiController(PatrocinadorService service, PatrocinadorMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<List<PatrocinadorDTO>> listar() {
        List<PatrocinadorDTO> lista = service.listarTodos()
                .stream().map(mapper::toDTO).toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatrocinadorDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(mapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PatrocinadorDTO> criar(@RequestBody @Valid PatrocinadorDTO dto) {
        Patrocinador salvo = service.salvarOuAtualizar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDTO(salvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatrocinadorDTO> atualizar(@PathVariable Long id, @RequestBody @Valid PatrocinadorDTO dto) {
        PatrocinadorDTO dtoComId = new PatrocinadorDTO(
                id, dto.tipo(),
                dto.razaoSocial(), dto.nomeFantasia(), dto.cnpj(), dto.inscricaoEstadual(),
                dto.nomeCompleto(), dto.cpf(),
                dto.telefone(), dto.email(), dto.nomeResponsavel(),
                dto.logradouro(), dto.numero(), dto.complemento(),
                dto.bairro(), dto.cep(), dto.cidade(), dto.uf(),
                dto.linkedin()
        );
        Patrocinador salvo = service.salvarOuAtualizar(dtoComId);
        return ResponseEntity.ok(mapper.toDTO(salvo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
