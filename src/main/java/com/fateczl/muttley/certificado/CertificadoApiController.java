package com.fateczl.muttley.certificado;

import com.fateczl.muttley.config.PublicRoute;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// controlador REST que expõe endpoints para emissão, validação e download de certificados
@RestController
@RequestMapping("/api/certificados")
public class CertificadoApiController {

    private final CertificadoService service;
    private final CertificadoPdfService pdfService;

    public CertificadoApiController(CertificadoService service, CertificadoPdfService pdfService) {
        this.service = service;
        this.pdfService = pdfService;
    }

    // lista todos os certificados emitidos no sistema
    @GetMapping
    public ResponseEntity<List<CertificadoListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream()
                .map(c -> new CertificadoListagem(c.getId(),
                        c.getParticipante() != null ? c.getParticipante().getNome() : null,
                        c.getPalestra() != null ? c.getPalestra().getTitulo() : null,
                        c.getDataEmissao(), c.getCargaHoraria(), c.getCodigoValidacao()))
                .toList());
    }

    // emite um novo certificado a partir dos dados enviados no corpo da requisição
    @PostMapping("/emitir")
    public ResponseEntity<CertificadoDTO> emitir(@RequestBody @Valid CertificadoDTO dto) {
        Certificado c = service.emitir(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new CertificadoDTO(c.getId(),
                        c.getParticipante().getId(), c.getPalestra().getId(),
                        c.getDataEmissao(), c.getCargaHoraria(), c.getCodigoValidacao()));
    }

    // valida a autenticidade de um certificado pelo código único sem exigir autenticação
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

    // gera e retorna o PDF do certificado para download pelo id
    @GetMapping("/{id}/pdf")
    @PublicRoute
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id, HttpServletRequest request) {
        return service.buscarPorIdComDetalhes(id).map(cert -> {
            byte[] pdf = pdfService.gerar(cert, baseUrl(request));
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"certificado-" + cert.getCodigoValidacao() + ".pdf\"")
                    .body(pdf);
        }).orElse(ResponseEntity.notFound().build());
    }

    // gera e retorna o PDF do certificado para download pelo código de validação
    @GetMapping("/validar/{codigo}/pdf")
    @PublicRoute
    public ResponseEntity<byte[]> downloadPdfPorCodigo(@PathVariable String codigo, HttpServletRequest request) {
        return service.buscarPorCodigoComDetalhes(codigo).map(cert -> {
            byte[] pdf = pdfService.gerar(cert, baseUrl(request));
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"certificado-" + cert.getCodigoValidacao() + ".pdf\"")
                    .body(pdf);
        }).orElse(ResponseEntity.notFound().build());
    }

    // remove um certificado pelo seu identificador
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // monta a URL base da aplicação a partir da requisição HTTP recebida
    private String baseUrl(HttpServletRequest request) {
        int port = request.getServerPort();
        return request.getScheme() + "://" + request.getServerName()
                + (port != 80 && port != 443 ? ":" + port : "");
    }
}
