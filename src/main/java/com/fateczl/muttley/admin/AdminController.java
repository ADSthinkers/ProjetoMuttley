package com.fateczl.muttley.admin;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.validation.Valid;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final AdminService service;
    private final AdminMapper mapper;

    public AdminController(AdminService service, AdminMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public String listar(Model model) {
        List<AdminListagem> lista = service.listarTodos()
                .stream()
                .map(mapper::toListagemDto)
                .toList();
        model.addAttribute("listaAdmins", lista);
        return "admin/listagem";
    }

    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("admin", new Admin());
        return "admin/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model) {
        service.buscarPorId(id).ifPresent(admin -> {
            admin.setSenha(null); // não expõe o hash no formulário
            model.addAttribute("admin", admin);
        });
        if (!model.containsAttribute("admin")) {
            return "redirect:/admin";
        }
        return "admin/formulario";
    }

    @PostMapping("/salvar")
    public String salvar(@Valid @ModelAttribute("admin") Admin admin, BindingResult result, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "admin/formulario";
        }

        // Utilizando o mapper para converter a entidade em DTO
        AdminDTO dto = mapper.toAtualizacaoDto(admin);
        
        service.salvarOuAtualizar(dto);
        redirectAttributes.addFlashAttribute("message", "Administrador salvo com sucesso!");
        return "redirect:/admin";
    }

    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Administrador excluído!");
        return "redirect:/admin";
    }
}