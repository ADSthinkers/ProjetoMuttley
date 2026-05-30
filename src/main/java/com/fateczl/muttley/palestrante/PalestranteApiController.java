package com.fateczl.muttley.palestrante;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador REST que expõe os endpoints de CRUD para palestrantes
@RestController
@RequestMapping("/api/palestrantes")
public class PalestranteApiController {

    private final PalestranteService service;
    private final PalestranteMapper mapper;

    public PalestranteApiController(PalestranteService service, PalestranteMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    // lista todos os palestrantes cadastrados
    @GetMapping
    public ResponseEntity<List<PalestranteListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream().map(mapper::toListagemDto).toList());
    }

    // busca um palestrante pelo seu identificador
    @GetMapping("/{id}")
    public ResponseEntity<PalestranteDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id).map(mapper::toAtualizacaoDto).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // busca um palestrante pelo e-mail
    @GetMapping("/buscar")
    public ResponseEntity<PalestranteDTO> buscarPorEmail(@RequestParam String email) {
        return service.buscarPorEmail(email).map(mapper::toAtualizacaoDto).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // cria um novo palestrante com os dados fornecidos
    @PostMapping
    public ResponseEntity<PalestranteDTO> criar(@RequestBody @Valid PalestranteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toAtualizacaoDto(service.salvarOuAtualizar(dto)));
    }

    // atualiza os dados de um palestrante existente pelo id
    @PutMapping("/{id}")
    public ResponseEntity<PalestranteDTO> atualizar(@PathVariable Long id, @RequestBody @Valid PalestranteDTO dto) {
        PalestranteDTO dtoComId = new PalestranteDTO(id, dto.nome(), dto.cpf(), dto.email(),
                dto.miniCurriculo(), dto.formacao(), dto.areaAtuacao(),
                dto.instituicao(), dto.linkedin(), dto.foto(), dto.senha());
        return ResponseEntity.ok(mapper.toAtualizacaoDto(service.salvarOuAtualizar(dtoComId)));
    }

    // remove um palestrante pelo seu identificador
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
