package com.fateczl.muttley.participante;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/participante")
public class ParticipanteController {

    private final ParticipanteService service;
    private final ParticipanteMapper mapper;

    public ParticipanteController(ParticipanteService service, ParticipanteMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public String listar(Model model) {
        List<ParticipanteListagem> lista = service.listarTodos()
                .stream().map(mapper::toListagemDto).toList();
        model.addAttribute("listaParticipantes", lista);
        return "participante/listagem";
    }

    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("participante", new Participante());
        return "participante/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model) {
        service.buscarPorId(id).ifPresent(p -> model.addAttribute("participante", p));
        if (!model.containsAttribute("participante")) {
            return "redirect:/participante";
        }
        return "participante/formulario";
    }

    @PostMapping("/salvar")
    public String salvar(@Valid @ModelAttribute("participante") Participante participante,
                         BindingResult result, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "participante/formulario";
        }
        ParticipanteDTO dto = mapper.toAtualizacaoDto(participante);
        service.salvarOuAtualizar(dto);
        redirectAttributes.addFlashAttribute("message", "Participante salvo com sucesso!");
        return "redirect:/participante";
    }

    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Participante excluído!");
        return "redirect:/participante";
    }
}
