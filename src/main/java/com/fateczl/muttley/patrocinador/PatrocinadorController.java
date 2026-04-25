package com.fateczl.muttley.patrocinador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

@Controller
@RequestMapping("/patrocinador")
public class PatrocinadorController {

    @Autowired
    private PatrocinadorService service;

    @Autowired
    private PatrocinadorMapper mapper;

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("listaPatrocinadores", service.listarTodos());
        return "patrocinador/listagem";
    }

    @GetMapping("/formulario")
    public String exibirFormulario(@RequestParam(required = false) Long id, Model model) {
        PatrocinadorDTO dto;
        if (id != null) {
            Patrocinador p = service.buscarPorId(id)
                .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado"));
            dto = mapper.toDTO(p);
        } else {
            dto = new PatrocinadorDTO(null, TipoPatrocinador.PJ, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "");
        }
        model.addAttribute("patrocinador", dto);
        model.addAttribute("tipos", TipoPatrocinador.values());
        return "patrocinador/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        try {
            Patrocinador p = service.buscarPorId(id)
                .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado"));
            model.addAttribute("patrocinador", mapper.toDTO(p));
            model.addAttribute("tipos", TipoPatrocinador.values());
            return "patrocinador/formulario";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/patrocinador";
        }
    }

    @PostMapping("/salvar")
    public String salvar(@ModelAttribute("patrocinador") @Valid PatrocinadorDTO dto, 
                        BindingResult result, 
                        RedirectAttributes redirectAttributes, 
                        Model model) {
        if (result.hasErrors()) {
            model.addAttribute("tipos", TipoPatrocinador.values());
            return "patrocinador/formulario";
        }
        service.salvarOuAtualizar(dto);
        redirectAttributes.addFlashAttribute("message", "Patrocinador salvo com sucesso!");
        return "redirect:/patrocinador";
    }

    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Patrocinador excluído com sucesso!");
        return "redirect:/patrocinador";
    }
}
