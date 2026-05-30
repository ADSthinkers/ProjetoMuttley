package com.fateczl.muttley.patrocinador;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

// controlador MVC responsável pelas telas de listagem, cadastro, edição e exclusão de patrocinadores
@Controller
@RequestMapping("/patrocinador")
public class PatrocinadorController {

    @Autowired
    private PatrocinadorService service;

    @Autowired
    private PatrocinadorMapper mapper;

    // exibe a listagem de todos os patrocinadores cadastrados
    @GetMapping
    public String listar(Model model) {
        model.addAttribute("listaPatrocinadores", service.listarTodos());
        return "patrocinador/listagem";
    }

    // exibe o formulário de criação ou edição de patrocinador
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

    // carrega o formulário de edição com os dados do patrocinador informado pelo id
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

    // processa o formulário e salva ou atualiza o patrocinador
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

    // remove o patrocinador e redireciona para a listagem com mensagem de confirmação
    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Patrocinador excluído com sucesso!");
        return "redirect:/patrocinador";
    }
}
