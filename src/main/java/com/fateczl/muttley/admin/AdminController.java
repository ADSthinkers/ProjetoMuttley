package com.fateczl.muttley.admin;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.validation.Valid;

// controlador MVC responsável pelas telas de listagem, cadastro, edição e exclusão de administradores
@Controller
@RequestMapping("/admin")
public class AdminController {

    private final AdminService service;
    private final AdminMapper mapper;

    public AdminController(AdminService service, AdminMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    // exibe a listagem de todos os administradores cadastrados
    @GetMapping
    public String listar(Model model) {
        List<AdminListagem> lista = service.listarTodos()
                .stream()
                .map(mapper::toListagemDto)
                .toList();
        model.addAttribute("listaAdmins", lista);
        return "admin/listagem";
    }

    // exibe o formulário de cadastro de um novo administrador
    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("admin", new Admin());
        return "admin/formulario";
    }

    // carrega o formulário de edição com os dados do administrador sem expor a senha
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

    // processa o formulário e salva ou atualiza o administrador
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

    // remove o administrador e redireciona para a listagem com mensagem de confirmação
    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Administrador excluído!");
        return "redirect:/admin";
    }
}