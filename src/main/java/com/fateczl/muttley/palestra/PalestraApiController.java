package com.fateczl.muttley.palestra;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final AuditoriaService auditoriaService;

    public PalestraApiController(PalestraService service, PalestraMapper mapper,
                                  AuditoriaService auditoriaService) {
        this.service = service;
        this.mapper = mapper;
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public ResponseEntity<List<PalestraDTO>> listar() {
        return ResponseEntity.ok(service.findAll().stream().map(mapper::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PalestraDTO> buscarPorId(@PathVariable Long id) {
        return service.findById(id).map(mapper::toDto).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PalestraDTO> criar(@RequestBody @Valid PalestraDTO dto,
                                              HttpServletRequest request) {
        Palestra salva = service.saveOrUpdate(dto);
        auditoriaService.registrar(AcaoAuditoria.CRIADO, "Palestra", salva.getId(),
                "Palestra criada: " + salva.getTitulo(), ator(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PalestraDTO> atualizar(@PathVariable Long id,
                                                  @RequestBody @Valid PalestraDTO dto,
                                                  HttpServletRequest request) {
        PalestraDTO dtoComId = new PalestraDTO(
                id, dto.titulo(), dto.descricao(), dto.competenciaIds(), dto.palestranteIds(),
                dto.eventoId(), dto.inicio(), dto.fim(), null,
                dto.tipo(), dto.modalidade(), dto.cargaHoraria(), dto.vagas(), dto.banner(),
                dto.patrocinadorId(), dto.status());
        Palestra salva = service.saveOrUpdate(dtoComId);
        auditoriaService.registrar(AcaoAuditoria.ALTERADO, "Palestra", salva.getId(),
                "Palestra alterada: " + salva.getTitulo(), ator(request));
        return ResponseEntity.ok(mapper.toDto(salva));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, HttpServletRequest request) {
        auditoriaService.registrar(AcaoAuditoria.DELETADO, "Palestra", id,
                "Palestra " + id + " excluída", ator(request));
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String ator(HttpServletRequest request) {
        String key = request.getHeader("X-API-KEY");
        return key != null ? "api:" + key : "sistema";
    }
}
