package com.fateczl.muttley.certificado;

import com.fateczl.muttley.config.PublicRoute;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificados")
public class CertificadoApiController {

    private final CertificadoService service;

    public CertificadoApiController(CertificadoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CertificadoListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream()
                .map(c -> new CertificadoListagem(c.getId(),
                        c.getParticipante() != null ? c.getParticipante().getNome() : null,
                        c.getPalestra() != null ? c.getPalestra().getTitulo() : null,
                        c.getDataEmissao(), c.getCargaHoraria(), c.getCodigoValidacao()))
                .toList());
    }

    @PostMapping("/emitir")
    public ResponseEntity<CertificadoDTO> emitir(@RequestBody @Valid CertificadoDTO dto) {
        Certificado c = service.emitir(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new CertificadoDTO(c.getId(),
                        c.getParticipante().getId(), c.getPalestra().getId(),
                        c.getDataEmissao(), c.getCargaHoraria(), c.getCodigoValidacao()));
    }

    @GetMapping("/validar/{codigo}")
    @PublicRoute
    public ResponseEntity<CertificadoListagem> validar(@PathVariable String codigo) {
        return service.buscarPorCodigo(codigo)
                .map(c -> new CertificadoListagem(c.getId(),
                        c.getParticipante() != null ? c.getParticipante().getNome() : null,
                        c.getPalestra() != null ? c.getPalestra().getTitulo() : null,
                        c.getDataEmissao(), c.getCargaHoraria(), c.getCodigoValidacao()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
