package com.fateczl.muttley.aluno;

import java.util.List;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import jakarta.validation.Valid;

@Controller
@RequestMapping("/aluno")
public class AlunoController {

    private final AlunoService service;
    private final AlunoMapper mapper;

    public AlunoController(AlunoService service, AlunoMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public String listar(Model model) {
        List<AlunoListagem> lista = service.listarTodos()
                .stream()
                .map(mapper::toListagemDto)
                .toList();
        model.addAttribute("listaAlunos", lista);
        return "aluno/listagem";
    }

    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("aluno", new Aluno());
        return "aluno/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model) {
        service.buscarPorId(id).ifPresent(aluno -> model.addAttribute("aluno", aluno));
        if (!model.containsAttribute("aluno")) {
            return "redirect:/aluno";
        }
        return "aluno/formulario";
    }

    @PostMapping("/salvar")
    public String salvar(@Valid @ModelAttribute("aluno") Aluno aluno, BindingResult result, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "aluno/formulario";
        }

        AlunoDTO dto = mapper.toAtualizacaoDto(aluno);
        service.salvarOuAtualizar(dto);
        redirectAttributes.addFlashAttribute("message", "Aluno salvo com sucesso!");
        return "redirect:/aluno";
    }

    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Aluno excluído!");
        return "redirect:/aluno";
    }
}