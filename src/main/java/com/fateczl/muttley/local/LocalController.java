package com.fateczl.muttley.local;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@Controller
@RequestMapping("/local")
public class LocalController {

    @Autowired
    private LocalService localService;

    @Autowired
    private LocalMapper localMapper;

    @GetMapping("/formulario")
    public String formularioLocal(@RequestParam(required = false) Long id, Model model) {
        LocalDTO dto;
        if (id != null) {
            Local local = localService.procurarPorId(id)
                .orElseThrow(() -> new EntityNotFoundException("Local não encontrado"));
            dto = localMapper.toLocalDTO(local);
        } else {
            dto = new LocalDTO(null, "", null);
        }
        model.addAttribute("local", dto);
        return "local/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String loadPageFormulario(@PathVariable("id") Long id, Model model,
                                   RedirectAttributes redirectAttributes) {
        try {
            if (id != null) {
                Local local = localService.procurarPorId(id)
                    .orElseThrow(() -> new EntityNotFoundException("Local não encontrado"));
                LocalDTO dto = localMapper.toLocalDTO(local);
                model.addAttribute("local", dto);
            }
            return "local/formulario";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/local";
        }
    }

    @PostMapping("/salvar")
    public String salvar(@ModelAttribute("local") @Valid LocalDTO dto,
                        BindingResult result,
                        RedirectAttributes redirectAttributes,
                        Model model) {
        if (result.hasErrors()) {
            return "local/formulario";
        }
        try {
            Local localSalvo = localService.saveOrAtualize(dto);
            String mensagem = dto.id() != null
                ? "Local '" + localSalvo.getNome() + "' atualizado com sucesso!"
                : "Local '" + localSalvo.getNome() + "' criado com sucesso!";
            redirectAttributes.addFlashAttribute("message", mensagem);
            return "redirect:/local";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/local/formulario" + (dto.id() != null ? "?id=" + dto.id() : "");
        }
    }

    @GetMapping("/delete/{id}")
    @Transactional
    public String deleteLocal(@PathVariable("id") Long id, RedirectAttributes redirectAttributes) {
        try {
            localService.apagarPorId(id);
            redirectAttributes.addFlashAttribute("message", "O local " + id + " foi apagado!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", e.getMessage());
        }
        return "redirect:/local";
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("locais", localService.findAllLocais());
        return "local/listagem";
    }
}
