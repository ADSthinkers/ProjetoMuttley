package com.fateczl.muttley.xp;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador REST que expõe os endpoints de CRUD para registros de XP
@RestController
@RequestMapping("/api/xps")
public class XpApiController {

    private final XpService service;
    private final XpMapper mapper;

    public XpApiController(XpService service, XpMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    // lista todos os registros de XP cadastrados
    @GetMapping
    public ResponseEntity<List<XpDTO>> listar() {
        List<XpDTO> lista = service.findAllXps()
                .stream().map(mapper::toXpDTO).toList();
        return ResponseEntity.ok(lista);
    }

    // busca um registro de XP pelo seu identificador
    @GetMapping("/{id}")
    public ResponseEntity<XpDTO> buscarPorId(@PathVariable Long id) {
        return service.procurarPorId(id)
                .map(mapper::toXpDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/participante/{participanteId}")
    public ResponseEntity<List<XpDTO>> listarPorParticipante(@PathVariable Long participanteId) {
        return ResponseEntity.ok(service.findByParticipanteId(participanteId)
                .stream().map(mapper::toXpDTO).toList());
    }

    // cria um novo registro de XP com os dados fornecidos
    @PostMapping
    public ResponseEntity<XpDTO> criar(@RequestBody @Valid XpDTO dto) {
        Xp salvo = service.saveOrAtualizeXp(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toXpDTO(salvo));
    }

    // atualiza os dados de um registro de XP existente pelo id
    @PutMapping("/{id}")
    public ResponseEntity<XpDTO> atualizar(@PathVariable Long id, @RequestBody @Valid XpDTO dto) {
        XpDTO dtoComId = new XpDTO(id, dto.horas(), dto.competenciaId(), dto.participanteId());
        Xp salvo = service.saveOrAtualizeXp(dtoComId);
        return ResponseEntity.ok(mapper.toXpDTO(salvo));
    }

    // remove um registro de XP pelo seu identificador
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.apagarPorId(id);
        return ResponseEntity.noContent().build();
    }
}
