package com.fateczl.muttley.inscricao;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inscricoes")
public class InscricaoApiController {

    private final InscricaoService service;

    public InscricaoApiController(InscricaoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<InscricaoListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream()
                .map(i -> new InscricaoListagem(i.getId(),
                        i.getParticipante() != null ? i.getParticipante().getNome() : null,
                        i.getPalestra() != null ? i.getPalestra().getTitulo() : null,
                        i.getDataInscricao(), i.getStatus()))
                .toList());
    }

    @PostMapping
    public ResponseEntity<InscricaoDTO> inscrever(@RequestBody @Valid InscricaoDTO dto) {
        Inscricao i = service.inscrever(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new InscricaoDTO(i.getId(), i.getParticipante().getId(),
                        i.getPalestra().getId(), i.getDataInscricao(),
                        i.getStatus(), i.getQrCodeToken()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> atualizarStatus(@PathVariable Long id,
                                                                @RequestBody Map<String, String> body) {
        StatusInscricao status = StatusInscricao.valueOf(body.get("status"));
        service.atualizarStatus(id, status);
        return ResponseEntity.ok(Map.of("status", status.name()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        service.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
