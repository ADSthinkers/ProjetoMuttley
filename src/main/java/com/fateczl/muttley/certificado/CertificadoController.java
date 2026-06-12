package com.fateczl.muttley.certificado;

import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.participante.ParticipanteRepository;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

// controlador MVC responsável pelas telas de emissão, validação e download de certificados
@Controller
@RequestMapping("/certificado")
public class CertificadoController {

    private final CertificadoService service;
    private final CertificadoPdfService pdfService;
    private final ParticipanteRepository participanteRepository;
    private final PalestraRepository palestraRepository;

    public CertificadoController(CertificadoService service,
                                  CertificadoPdfService pdfService,
                                  ParticipanteRepository participanteRepository,
                                  PalestraRepository palestraRepository) {
        this.service = service;
        this.pdfService = pdfService;
        this.participanteRepository = participanteRepository;
        this.palestraRepository = palestraRepository;
    }

    // exibe a listagem de todos os certificados emitidos
    @GetMapping
    public String listar(Model model) {
        List<CertificadoListagem> lista = service.listarTodos().stream()
                .map(c -> new CertificadoListagem(
                        c.getId(),
                        c.getNomeTitular(),
                        c.getPalestra() != null ? c.getPalestra().getTitulo() : "-",
                        c.getDataEmissao(), c.getCargaHoraria(), c.getCodigoValidacao()
                )).toList();
        model.addAttribute("listaCertificados", lista);
        return "certificado/listagem";
    }

    // exibe o formulário de emissão de certificado com listas de participantes e palestras
    @GetMapping("/emitir")
    public String exibirFormulario(Model model) {
        model.addAttribute("certificadoDTO", new CertificadoDTO(null, null, null, null, null, null));
        model.addAttribute("participantes", participanteRepository.findAll());
        model.addAttribute("palestras", palestraRepository.findAll());
        return "certificado/formulario";
    }

    // processa a submissão do formulário e emite o certificado
    @PostMapping("/emitir")
    public String emitir(@ModelAttribute("certificadoDTO") CertificadoDTO dto,
                          RedirectAttributes redirectAttributes) {
        try {
            service.emitir(dto);
            redirectAttributes.addFlashAttribute("message", "Certificado emitido com sucesso!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/certificado";
    }

    // exibe a página de validação de um certificado pelo código informado na URL
    @GetMapping("/validar/{codigo}")
    public String validar(@PathVariable String codigo, Model model) {
        service.buscarPorCodigoComDetalhes(codigo).ifPresentOrElse(
                c -> model.addAttribute("certificado", c),
                () -> model.addAttribute("erro", "Certificado não encontrado ou inválido")
        );
        return "certificado/validacao";
    }

    // gera e faz o download do PDF do certificado identificado pelo id
    @GetMapping("/{id}/pdf")
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

    // gera e faz o download do PDF do certificado identificado pelo código de validação
    @GetMapping("/validar/{codigo}/pdf")
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

    // remove o certificado e redireciona para a listagem com mensagem de confirmação
    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Certificado removido!");
        return "redirect:/certificado";
    }

    // monta a URL base da aplicação a partir da requisição HTTP recebida
    private String baseUrl(HttpServletRequest request) {
        int port = request.getServerPort();
        return request.getScheme() + "://" + request.getServerName()
                + (port != 80 && port != 443 ? ":" + port : "");
    }
}
