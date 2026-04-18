package com.fateczl.muttley.evento;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.validation.Valid;

@Controller
@RequestMapping("/evento")
public class EventoController {

    private final EventoService service;
    private final EventoMapper mapper;

    public EventoController(EventoService service, EventoMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public String listar(Model model) {
        List<EventoListagem> lista = service.listarTodos()
                .stream()
                .map(mapper::toListagemDto)
                .toList();
        model.addAttribute("listaEventos", lista);
        return "evento/listagem";
    }

    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("evento", new Evento());
        return "evento/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model,
                         RedirectAttributes redirectAttributes) {
        try {
            Evento evento = service.buscarPorId(id)
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Evento não encontrado"));
            model.addAttribute("evento", mapper.toAtualizacaoDto(evento));
            return "evento/formulario";
        } catch (jakarta.persistence.EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/evento";
        }
    }

    @PostMapping("/salvar")
    public String salvar(@Valid @ModelAttribute("evento") Evento evento,
                         BindingResult result,
                         RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "evento/formulario";
        }
        EventoDTO dto = mapper.toAtualizacaoDto(evento);
        service.salvarOuAtualizar(dto);
        redirectAttributes.addFlashAttribute("message", "Evento salvo com sucesso!");
        return "redirect:/evento";
    }

    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            service.deletar(id);
            redirectAttributes.addFlashAttribute("message", "Evento excluído com sucesso!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/evento";
    }
}