package com.fateczl.muttley.palestrante;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

// controlador MVC responsável pelas telas de listagem, cadastro, edição e exclusão de palestrantes
@Controller
@RequestMapping("/palestrante")
public class PalestranteController {

    private final PalestranteService service;
    private final PalestranteMapper mapper;

    public PalestranteController(PalestranteService service, PalestranteMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    // exibe a listagem de todos os palestrantes cadastrados
    @GetMapping
    public String listar(Model model) {
        List<PalestranteListagem> lista = service.listarTodos()
                .stream().map(mapper::toListagemDto).toList();
        model.addAttribute("listaPalestrantes", lista);
        return "palestrante/listagem";
    }

    // exibe o formulário de cadastro de um novo palestrante
    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("palestrante", new Palestrante());
        return "palestrante/formulario";
    }

    // carrega o formulário de edição com os dados do palestrante
    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model) {
        service.buscarPorId(id).ifPresent(p -> model.addAttribute("palestrante", p));
        if (!model.containsAttribute("palestrante")) return "redirect:/palestrante";
        return "palestrante/formulario";
    }

    // processa o formulário e salva ou atualiza o palestrante
    @PostMapping("/salvar")
    public String salvar(@Valid @ModelAttribute("palestrante") Palestrante palestrante,
                         BindingResult result, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) return "palestrante/formulario";
        service.salvarOuAtualizar(mapper.toAtualizacaoDto(palestrante));
        redirectAttributes.addFlashAttribute("message", "Palestrante salvo com sucesso!");
        return "redirect:/palestrante";
    }

    // remove o palestrante e redireciona para a listagem com mensagem de confirmação
    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Palestrante excluído!");
        return "redirect:/palestrante";
    }
}
