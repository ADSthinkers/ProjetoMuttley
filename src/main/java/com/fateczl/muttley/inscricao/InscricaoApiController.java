package com.fateczl.muttley.inscricao;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final AuditoriaService auditoriaService;

    public InscricaoApiController(InscricaoService service, AuditoriaService auditoriaService) {
        this.service = service;
        this.auditoriaService = auditoriaService;
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
    public ResponseEntity<InscricaoDTO> inscrever(@RequestBody @Valid InscricaoDTO dto,
                                                   HttpServletRequest request) {
        Inscricao i = service.inscrever(dto);
        auditoriaService.registrar(AcaoAuditoria.INSCRICAO_CRIADA, "Inscricao", i.getId(),
                "Inscrição criada: participante " + dto.participanteId() + " na palestra " + dto.palestraId(),
                ator(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new InscricaoDTO(i.getId(), i.getParticipante().getId(),
                        i.getPalestra().getId(), i.getDataInscricao(),
                        i.getStatus(), i.getQrCodeToken()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> atualizarStatus(@PathVariable Long id,
                                                                @RequestBody Map<String, String> body,
                                                                HttpServletRequest request) {
        StatusInscricao status = StatusInscricao.valueOf(body.get("status"));
        service.atualizarStatus(id, status);
        auditoriaService.registrar(AcaoAuditoria.STATUS_ATUALIZADO, "Inscricao", id,
                "Status da inscrição " + id + " alterado para " + status.name(),
                ator(request));
        return ResponseEntity.ok(Map.of("status", status.name()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id, HttpServletRequest request) {
        auditoriaService.registrar(AcaoAuditoria.INSCRICAO_CANCELADA, "Inscricao", id,
                "Inscrição " + id + " cancelada", ator(request));
        service.cancelar(id);
        return ResponseEntity.noContent().build();
    }

    private String ator(HttpServletRequest request) {
        String key = request.getHeader("X-API-KEY");
        return key != null ? "api:" + key : "sistema";
    }
}
