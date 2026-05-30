package com.fateczl.muttley.inscricao;

import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.participante.ParticipanteRepository;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

// controlador MVC responsável pelas telas de listagem, inscrição, status e cancelamento
@Controller
@RequestMapping("/inscricao")
public class InscricaoController {

    private final InscricaoService service;
    private final ParticipanteRepository participanteRepository;
    private final PalestraRepository palestraRepository;

    public InscricaoController(InscricaoService service,
                                ParticipanteRepository participanteRepository,
                                PalestraRepository palestraRepository) {
        this.service = service;
        this.participanteRepository = participanteRepository;
        this.palestraRepository = palestraRepository;
    }

    // exibe a listagem de todas as inscrições realizadas
    @GetMapping
    public String listar(Model model) {
        List<InscricaoListagem> lista = service.listarTodos().stream()
                .map(i -> new InscricaoListagem(
                        i.getId(),
                        i.getParticipante() != null ? i.getParticipante().getNome() : "-",
                        i.getPalestra() != null ? i.getPalestra().getTitulo() : "-",
                        i.getDataInscricao(), i.getStatus()
                )).toList();
        model.addAttribute("listaInscricoes", lista);
        return "inscricao/listagem";
    }

    // exibe o formulário de nova inscrição com as listas de participantes e palestras
    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("inscricaoDTO", new InscricaoDTO(null, null, null, null, null, null));
        model.addAttribute("participantes", participanteRepository.findAll());
        model.addAttribute("palestras", palestraRepository.findAll());
        return "inscricao/formulario";
    }

    // processa o formulário e realiza a inscrição do participante na palestra
    @PostMapping("/inscrever")
    public String inscrever(@ModelAttribute("inscricaoDTO") InscricaoDTO dto,
                             RedirectAttributes redirectAttributes) {
        try {
            service.inscrever(dto);
            redirectAttributes.addFlashAttribute("message", "Inscrição realizada com sucesso!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/inscricao";
    }

    // atualiza o status de uma inscrição específica via formulário
    @PostMapping("/{id}/status")
    public String atualizarStatus(@PathVariable Long id,
                                   @RequestParam StatusInscricao status,
                                   RedirectAttributes redirectAttributes) {
        try {
            service.atualizarStatus(id, status);
            redirectAttributes.addFlashAttribute("message", "Status atualizado!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/inscricao";
    }

    // cancela a inscrição e redireciona para a listagem com mensagem de confirmação
    @GetMapping("/cancelar/{id}")
    public String cancelar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.cancelar(id);
        redirectAttributes.addFlashAttribute("message", "Inscrição cancelada!");
        return "redirect:/inscricao";
    }
}
