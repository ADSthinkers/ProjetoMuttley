package com.fateczl.muttley.medalha;

import com.fateczl.muttley.competencia.CompetenciaService;
import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.participante.ParticipanteRepository;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/medalha")
public class MedalhaController {

    private final MedalhaService service;
    private final ParticipanteRepository participanteRepository;
    private final PalestraRepository palestraRepository;
    private final CompetenciaService competenciaService;

    public MedalhaController(MedalhaService service,
                              ParticipanteRepository participanteRepository,
                              PalestraRepository palestraRepository,
                              CompetenciaService competenciaService) {
        this.service = service;
        this.participanteRepository = participanteRepository;
        this.palestraRepository = palestraRepository;
        this.competenciaService = competenciaService;
    }

    @GetMapping
    public String listar(Model model) {
        List<MedalhaListagem> lista = service.listarTodos().stream()
                .map(m -> new MedalhaListagem(
                        m.getId(), m.getTipo(), m.getNome(),
                        m.getParticipante() != null ? m.getParticipante().getNome() : "-",
                        m.getPalestra() != null ? m.getPalestra().getTitulo() : "-",
                        m.getDataConquista(),
                        m.getCompetencias() != null
                                ? m.getCompetencias().stream().map(c -> c.getNome()).toList()
                                : java.util.List.of()
                )).toList();
        model.addAttribute("listaMedalhas", lista);
        return "medalha/listagem";
    }

    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("medalhaDTO", new MedalhaDTO(null, null, "", "", null, null, null, null));
        model.addAttribute("tipos", TipoMedalha.values());
        model.addAttribute("participantes", participanteRepository.findAll());
        model.addAttribute("palestras", palestraRepository.findAll());
        model.addAttribute("competencias", competenciaService.findAllCompetencias());
        return "medalha/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model) {
        service.buscarPorId(id).ifPresent(m -> {
            MedalhaDTO dto = new MedalhaDTO(m.getId(), m.getTipo(), m.getNome(), m.getDescricao(),
                    m.getParticipante() != null ? m.getParticipante().getId() : null,
                    m.getPalestra() != null ? m.getPalestra().getId() : null,
                    m.getDataConquista(), null);
            model.addAttribute("medalhaDTO", dto);
        });
        if (!model.containsAttribute("medalhaDTO")) return "redirect:/medalha";
        model.addAttribute("tipos", TipoMedalha.values());
        model.addAttribute("participantes", participanteRepository.findAll());
        model.addAttribute("palestras", palestraRepository.findAll());
        model.addAttribute("competencias", competenciaService.findAllCompetencias());
        return "medalha/formulario";
    }

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

    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Medalha excluída!");
        return "redirect:/medalha";
    }
}
