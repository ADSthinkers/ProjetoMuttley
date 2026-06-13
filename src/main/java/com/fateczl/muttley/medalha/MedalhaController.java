package com.fateczl.muttley.medalha;

import com.fateczl.muttley.competencia.CompetenciaService;
import com.fateczl.muttley.participante.ParticipanteRepository;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

// controlador MVC responsável pelas telas de listagem, cadastro, edição e exclusão de medalhas
@Controller
@RequestMapping("/medalha")
public class MedalhaController {

    private final MedalhaService service;
    private final ParticipanteRepository participanteRepository;
    private final CompetenciaService competenciaService;

    public MedalhaController(MedalhaService service,
                              ParticipanteRepository participanteRepository,
                              CompetenciaService competenciaService) {
        this.service = service;
        this.participanteRepository = participanteRepository;
        this.competenciaService = competenciaService;
    }

    // exibe a listagem de todas as medalhas concedidas
    @GetMapping
    public String listar(Model model) {
        List<MedalhaListagem> lista = service.listarTodos().stream()
                .map(m -> new MedalhaListagem(
                        m.getId(), m.getTipo(), m.getNome(),
                        m.getParticipante() != null ? m.getParticipante().getNome() : "-",
                        m.getDataConquista(),
                        m.getCompetencias() != null
                                ? m.getCompetencias().stream().map(c -> c.getNome()).toList()
                                : java.util.List.of(),
                        m.getCompetencia() != null ? m.getCompetencia().getNome() : null,
                        m.getNivelAlcancado()
                )).toList();
        model.addAttribute("listaMedalhas", lista);
        return "medalha/listagem";
    }

    // exibe o formulário de cadastro de nova medalha com as opções de participantes e competências
    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("medalhaDTO", new MedalhaDTO(null, null, "", "", null, null, null,
                null, null, null));
        model.addAttribute("tipos", TipoMedalha.values());
        model.addAttribute("participantes", participanteRepository.findAll());
        model.addAttribute("competencias", competenciaService.findAllCompetencias());
        return "medalha/formulario";
    }

    // carrega o formulário de edição preenchido com os dados da medalha informada pelo id
    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model) {
        service.buscarPorId(id).ifPresent(m -> {
            MedalhaDTO dto = new MedalhaDTO(m.getId(), m.getTipo(), m.getNome(), m.getDescricao(),
                    m.getParticipante() != null ? m.getParticipante().getId() : null,
                    m.getDataConquista(),
                    m.getCompetencias() != null ? m.getCompetencias().stream().map(c -> c.getId()).toList() : null,
                    m.getCompetencia() != null ? m.getCompetencia().getId() : null,
                    m.getXp() != null ? m.getXp().getId() : null,
                    m.getNivelAlcancado());
            model.addAttribute("medalhaDTO", dto);
        });
        if (!model.containsAttribute("medalhaDTO")) return "redirect:/medalha";
        model.addAttribute("tipos", TipoMedalha.values());
        model.addAttribute("participantes", participanteRepository.findAll());
        model.addAttribute("competencias", competenciaService.findAllCompetencias());
        return "medalha/formulario";
    }

    // processa o formulário e salva ou atualiza a medalha
    @PostMapping("/salvar")
    public String salvar(@ModelAttribute("medalhaDTO") MedalhaDTO dto, RedirectAttributes redirectAttributes) {
        try {
            service.salvarOuAtualizar(dto);
            redirectAttributes.addFlashAttribute("message", "Medalha salva com sucesso!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/medalha";
    }

    // remove a medalha e redireciona para a listagem com mensagem de confirmação
    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Medalha excluída!");
        return "redirect:/medalha";
    }
}
