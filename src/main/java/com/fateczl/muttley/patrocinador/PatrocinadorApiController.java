package com.fateczl.muttley.patrocinador;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador REST que expõe os endpoints de CRUD para patrocinadores
@RestController
@RequestMapping("/api/patrocinadores")
public class PatrocinadorApiController {

    private final PatrocinadorService service;
    private final PatrocinadorMapper mapper;

    public PatrocinadorApiController(PatrocinadorService service, PatrocinadorMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    // lista todos os patrocinadores cadastrados
    @GetMapping
    public ResponseEntity<List<PatrocinadorDTO>> listar() {
        List<PatrocinadorDTO> lista = service.listarTodos()
                .stream().map(mapper::toDTO).toList();
        return ResponseEntity.ok(lista);
    }

    // busca um patrocinador pelo seu identificador
    @GetMapping("/{id}")
    public ResponseEntity<PatrocinadorDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(mapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // cria um novo patrocinador com os dados fornecidos
    @PostMapping
    public ResponseEntity<PatrocinadorDTO> criar(@RequestBody @Valid PatrocinadorDTO dto) {
        Patrocinador salvo = service.salvarOuAtualizar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDTO(salvo));
    }

    // atualiza os dados de um patrocinador existente pelo id
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

    // remove um patrocinador pelo seu identificador
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
