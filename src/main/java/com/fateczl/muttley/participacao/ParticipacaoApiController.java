package com.fateczl.muttley.participacao;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador REST que expõe os endpoints de CRUD para participações em palestras
@RestController
@RequestMapping("/api/participacoes")
public class ParticipacaoApiController {

    private final ParticipacaoService service;
    private final ParticipacaoMapper mapper;

    public ParticipacaoApiController(ParticipacaoService service, ParticipacaoMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    // lista todas as participações cadastradas
    @GetMapping
    public ResponseEntity<List<ParticipacaoListagem>> listar() {
        List<ParticipacaoListagem> lista = service.listarTodos()
                .stream().map(mapper::toListagemDto).toList();
        return ResponseEntity.ok(lista);
    }

    // busca uma participação pelo seu identificador
    @GetMapping("/{id}")
    public ResponseEntity<ParticipacaoDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(mapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // cria um novo registro de participação com os dados fornecidos
    @PostMapping
    public ResponseEntity<ParticipacaoDTO> criar(@RequestBody @Valid ParticipacaoDTO dto) {
        Participacao salva = service.salvarOuAtualizar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDTO(salva));
    }

    // atualiza os dados de uma participação existente pelo id
    @PutMapping("/{id}")
    public ResponseEntity<ParticipacaoDTO> atualizar(@PathVariable Long id,
                                                      @RequestBody @Valid ParticipacaoDTO dto) {
        ParticipacaoDTO dtoComId = new ParticipacaoDTO(id, dto.horas(), dto.participanteId(), dto.palestraId());
        Participacao salva = service.salvarOuAtualizar(dtoComId);
        return ResponseEntity.ok(mapper.toDTO(salva));
    }

    // remove uma participação pelo seu identificador
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
