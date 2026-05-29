package com.fateczl.muttley.evento;

import com.fateczl.muttley.local.LocalService;
import com.fateczl.muttley.patrocinador.PatrocinadorRepository;
import com.fateczl.muttley.tipo.Modalidade;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/evento")
public class EventoController {

    private final EventoService service;
    private final EventoMapper mapper;
    private final LocalService localService;
    private final PatrocinadorRepository patrocinadorRepository;

    public EventoController(EventoService service, EventoMapper mapper,
                             LocalService localService,
                             PatrocinadorRepository patrocinadorRepository) {
        this.service = service;
        this.mapper = mapper;
        this.localService = localService;
        this.patrocinadorRepository = patrocinadorRepository;
    }

    @GetMapping
    public String listar(Model model) {
        List<EventoListagem> lista = service.listarTodos()
                .stream().map(mapper::toListagemDto).toList();
        model.addAttribute("listaEventos", lista);
        return "evento/listagem";
    }

    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("evento", new EventoDTO(null, "", null, null, null, null, null, null, null, null, null));
        popularModel(model);
        return "evento/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        try {
            Evento evento = service.buscarPorId(id)
                    .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
            model.addAttribute("evento", mapper.toAtualizacaoDto(evento));
            popularModel(model);
            return "evento/formulario";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/evento";
        }
    }

    @PostMapping("/salvar")
    public String salvar(@Valid @ModelAttribute("evento") EventoDTO dto,
                         BindingResult result, Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            popularModel(model);
            return "evento/formulario";
        }
        try {
            service.salvarOuAtualizar(dto);
            redirectAttributes.addFlashAttribute("message", "Evento salvo com sucesso!");
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
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

    private void popularModel(Model model) {
        model.addAttribute("locais", localService.findAllLocais());
        model.addAttribute("modalidades", Modalidade.values());
        model.addAttribute("patrocinadores", patrocinadorRepository.findAll());
    }
}
