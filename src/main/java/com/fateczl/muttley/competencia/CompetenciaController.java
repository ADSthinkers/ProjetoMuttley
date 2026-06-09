package com.fateczl.muttley.competencia;

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

// controlador MVC responsável pelas telas de cadastro, edição, listagem e exclusão de competências
@Controller
@RequestMapping("/competencia")
public class CompetenciaController {

    @Autowired
    private CompetenciaService competenciaService;

    @Autowired
    private CompetenciaMapper competenciaMapper;  

    // exibe o formulário de criação ou edição de uma competência
    @GetMapping("/formulario")
    public String formularioCompetencia(@RequestParam(required = false) Long id, Model model) {
        CompetenciaDTO dto;
        if (id != null) {
            Competencia competencia = competenciaService.procurarPorId(id)
                .orElseThrow(() -> new EntityNotFoundException("Competencia não encontrada"));
            dto = competenciaMapper.toCompetenciaDTO(competencia);
        } else {
            dto = new CompetenciaDTO(null, "", null, 5);
        }
        model.addAttribute("competencia", dto);
        model.addAttribute("tipos", TipoCompetencia.values());
        return "competencia/formulario";
    }

    // carrega o formulário de edição preenchido com os dados da competência informada pelo id
    @GetMapping("/formulario/{id}")
    public String loadPageFormulario(@PathVariable("id") Long id, Model model,
        RedirectAttributes redirectAttributes) {
        try {
            Competencia competencia = competenciaService.procurarPorId(id)
                .orElseThrow(() -> new EntityNotFoundException("Competencia não encontrada"));
            model.addAttribute("competencia", competenciaMapper.toCompetenciaDTO(competencia));
            model.addAttribute("tipos", TipoCompetencia.values());
            return "competencia/formulario";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/competencia";
        }
    }
        
    // processa o formulário e salva ou atualiza a competência
    @PostMapping("/salvar")
    public String salvar(@ModelAttribute("competencia") @Valid CompetenciaDTO dto,
                        BindingResult result,
                        RedirectAttributes redirectAttributes,
                        Model model) {
        try {
            Competencia competenciaSalva = competenciaService.saveOrAtualize(dto);
            String mensagem = dto.id() != null
                ? "Competencia '" + competenciaSalva.getNome() + "' atualizado com sucesso!"
                : "Competencia '" + competenciaSalva.getNome() + "' criado com sucesso!";
            redirectAttributes.addFlashAttribute("message", mensagem);
            return "redirect:/competencia";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/competencia/formulario" + (dto.id() != null ? "?id=" + dto.id() : "");
        }
    }

    // remove a competência pelo id e redireciona para a listagem
    @GetMapping("/delete/{id}")
    @Transactional
    public String deleteCompetencia(@PathVariable("id") Long id, Model model, RedirectAttributes redirectAttributes) {
        try {
            competenciaService.apagarPorId(id);
            redirectAttributes.addFlashAttribute("message", "A competencia " + id + " foi apagado!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", e.getMessage());
        }
        return "redirect:/competencia";
    }

    // lista todas as competências cadastradas e exibe na página de listagem
    // esse getmapping aqui embaixo foi excluido (rever)
    @GetMapping
    public String listar(Model model) {
        model.addAttribute("competencias", competenciaService.findAllCompetencias());
        return "competencia/listagem";
    }

    
}
