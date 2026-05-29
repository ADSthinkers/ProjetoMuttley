package com.fateczl.muttley.participacao;

import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.participante.ParticipanteRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/participacao")
public class ParticipacaoController {

    private final ParticipacaoService service;
    private final ParticipacaoMapper mapper;
    private final ParticipanteRepository participanteRepository;
    private final PalestraRepository palestraRepository;

    public ParticipacaoController(ParticipacaoService service, ParticipacaoMapper mapper,
                                   ParticipanteRepository participanteRepository,
                                   PalestraRepository palestraRepository) {
        this.service = service;
        this.mapper = mapper;
        this.participanteRepository = participanteRepository;
        this.palestraRepository = palestraRepository;
    }

    @GetMapping
    public String listar(Model model) {
        List<ParticipacaoListagem> lista = service.listarTodos()
                .stream()
                .map(p -> new ParticipacaoListagem(
                        p.getId(),
                        p.getParticipante() != null ? p.getParticipante().getNome() : "-",
                        p.getPalestra() != null ? p.getPalestra().getTitulo() : "-",
                        p.getHoras()
                ))
                .toList();
        model.addAttribute("listaParticipacoes", lista);
        return "participacao/listagem";
    }

    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("participacaoDTO", new ParticipacaoDTO(null, null, null, null));
        model.addAttribute("participantes", participanteRepository.findAll());
        model.addAttribute("palestras", palestraRepository.findAll());
        return "participacao/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model) {
        service.buscarPorId(id).ifPresent(p -> model.addAttribute("participacaoDTO", mapper.toDTO(p)));
        if (!model.containsAttribute("participacaoDTO")) {
            return "redirect:/participacao";
        }
        model.addAttribute("participantes", participanteRepository.findAll());
        model.addAttribute("palestras", palestraRepository.findAll());
        return "participacao/formulario";
    }

    @PostMapping("/salvar")
    public String salvar(@Valid @ModelAttribute("participacaoDTO") ParticipacaoDTO dto,
                         BindingResult result, Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            model.addAttribute("participantes", participanteRepository.findAll());
            model.addAttribute("palestras", palestraRepository.findAll());
            return "participacao/formulario";
        }
        service.salvarOuAtualizar(dto);
        redirectAttributes.addFlashAttribute("message", "Participação salva com sucesso!");
        return "redirect:/participacao";
    }

    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Participação excluída!");
        return "redirect:/participacao";
    }
}
