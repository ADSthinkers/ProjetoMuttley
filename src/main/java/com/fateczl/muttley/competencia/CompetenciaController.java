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

@Controller
@RequestMapping("/competencia")
public class CompetenciaController {

    @Autowired
    private CompetenciaService competenciaService;

    @Autowired
    private CompetenciaMapper competenciaMapper;  

    @GetMapping("/formulario")
    public String formularioCompetencia(@RequestParam(required = false) Long id, Model model) {
        CompetenciaDTO dto;
        if (id != null) {
            //edição: Carrega dados existentes
            Competencia competencia = competenciaService.procurarPorId(id)
            .orElseThrow(() -> new EntityNotFoundException("Competencia não encontrada"));
        dto = competenciaMapper.toCompetenciaDTO(competencia);
        } else {
            dto = new CompetenciaDTO(null, "");
        }
        model.addAttribute("competencia", dto);
        return "competencia/formulario";
    }

    @GetMapping ("/formulario/{id}")
    public String loadPageFormulario (@PathVariable("id") Long id, Model model,
        RedirectAttributes redirectAttributes) {
            CompetenciaDTO dto;
            try {
                if (id != null) {
                    Competencia competencia = competenciaService.procurarPorId(id)
                        .orElseThrow(() -> new EntityNotFoundException("Competencia não encontrada"));
                    dto = competenciaMapper.toCompetenciaDTO(competencia);
                    model.addAttribute("competencia", dto);
                }
                return "competencia/formulario";
            } catch (EntityNotFoundException e) {
                redirectAttributes.addFlashAttribute("error", e.getMessage());
                return "redirect:/competencia";
            }
        }
        
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

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("competencias", competenciaService.findAllCompetencias());
        return "competencia/listagem";
    }

    
} 