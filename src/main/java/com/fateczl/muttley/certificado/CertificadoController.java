package com.fateczl.muttley.certificado;

import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.participante.ParticipanteRepository;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/certificado")
public class CertificadoController {

    private final CertificadoService service;
    private final ParticipanteRepository participanteRepository;
    private final PalestraRepository palestraRepository;

    public CertificadoController(CertificadoService service,
                                  ParticipanteRepository participanteRepository,
                                  PalestraRepository palestraRepository) {
        this.service = service;
        this.participanteRepository = participanteRepository;
        this.palestraRepository = palestraRepository;
    }

    @GetMapping
    public String listar(Model model) {
        List<CertificadoListagem> lista = service.listarTodos().stream()
                .map(c -> new CertificadoListagem(
                        c.getId(),
                        c.getParticipante() != null ? c.getParticipante().getNome() : "-",
                        c.getPalestra() != null ? c.getPalestra().getTitulo() : "-",
                        c.getDataEmissao(), c.getCargaHoraria(), c.getCodigoValidacao()
                )).toList();
        model.addAttribute("listaCertificados", lista);
        return "certificado/listagem";
    }

    @GetMapping("/emitir")
    public String exibirFormulario(Model model) {
        model.addAttribute("certificadoDTO", new CertificadoDTO(null, null, null, null, null, null));
        model.addAttribute("participantes", participanteRepository.findAll());
        model.addAttribute("palestras", palestraRepository.findAll());
        return "certificado/formulario";
    }

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

    @GetMapping("/validar/{codigo}")
    public String validar(@PathVariable String codigo, Model model) {
        service.buscarPorCodigo(codigo).ifPresentOrElse(
                c -> model.addAttribute("certificado", c),
                () -> model.addAttribute("erro", "Certificado não encontrado ou inválido")
        );
        return "certificado/validacao";
    }

    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Certificado removido!");
        return "redirect:/certificado";
    }
}
