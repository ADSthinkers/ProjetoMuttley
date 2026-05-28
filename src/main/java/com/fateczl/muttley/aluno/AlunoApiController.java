package com.fateczl.muttley.aluno;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alunos")
public class AlunoApiController {

    private final AlunoService service;
    private final AlunoMapper mapper;

    public AlunoApiController(AlunoService service, AlunoMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<List<AlunoListagem>> listar() {
        List<AlunoListagem> lista = service.listarTodos()
                .stream().map(mapper::toListagemDto).toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlunoDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(mapper::toAtualizacaoDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AlunoDTO> criar(@RequestBody @Valid AlunoDTO dto) {
        Aluno salvo = service.salvarOuAtualizar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toAtualizacaoDto(salvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlunoDTO> atualizar(@PathVariable Long id, @RequestBody @Valid AlunoDTO dto) {
        AlunoDTO dtoComId = new AlunoDTO(id, dto.nome(), dto.ra(), dto.cpf(), dto.email());
        Aluno salvo = service.salvarOuAtualizar(dtoComId);
        return ResponseEntity.ok(mapper.toAtualizacaoDto(salvo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
