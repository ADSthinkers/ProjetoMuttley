package com.fateczl.muttley.palestrante;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/palestrante")
public class PalestranteController {

    private final PalestranteService service;
    private final PalestranteMapper mapper;

    public PalestranteController(PalestranteService service, PalestranteMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public String listar(Model model) {
        List<PalestranteListagem> lista = service.listarTodos()
                .stream().map(mapper::toListagemDto).toList();
        model.addAttribute("listaPalestrantes", lista);
        return "palestrante/listagem";
    }

    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("palestrante", new Palestrante());
        return "palestrante/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model) {
        service.buscarPorId(id).ifPresent(p -> model.addAttribute("palestrante", p));
        if (!model.containsAttribute("palestrante")) return "redirect:/palestrante";
        return "palestrante/formulario";
    }

    @PostMapping("/salvar")
    public String salvar(@Valid @ModelAttribute("palestrante") Palestrante palestrante,
                         BindingResult result, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) return "palestrante/formulario";
        service.salvarOuAtualizar(mapper.toAtualizacaoDto(palestrante));
        redirectAttributes.addFlashAttribute("message", "Palestrante salvo com sucesso!");
        return "redirect:/palestrante";
    }

    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Palestrante excluído!");
        return "redirect:/palestrante";
    }
}
