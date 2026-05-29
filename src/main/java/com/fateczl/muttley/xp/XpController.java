package com.fateczl.muttley.xp;

import com.fateczl.muttley.competencia.CompetenciaService;
import com.fateczl.muttley.participante.ParticipanteService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/xp")
public class XpController {

    @Autowired
    private ParticipanteService participanteService;

    @Autowired
    private CompetenciaService competenciaService;

    @Autowired
    private XpService xpService;

    @Autowired
    private XpMapper xpMapper;

    @GetMapping("/formulario")
    public String formularioXp(@RequestParam(required = false) Long id, Model model) {
        XpDTO dto;
        if (id != null) {
            Xp xp = xpService.procurarPorId(id)
                    .orElseThrow(() -> new EntityNotFoundException("Xp não encontrado"));
            dto = xpMapper.toXpDTO(xp);
        } else {
            dto = new XpDTO(null, 0, null, null);
        }
        model.addAttribute("xp", dto);
        model.addAttribute("competencias", competenciaService.findAllCompetencias());
        model.addAttribute("participantes", participanteService.listarTodos());
        return "xp/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String loadPageFormulario(@PathVariable Long id, Model model,
                                     RedirectAttributes redirectAttributes) {
        try {
            Xp xp = xpService.procurarPorId(id)
                    .orElseThrow(() -> new EntityNotFoundException("Xp não encontrado"));
            model.addAttribute("xp", xpMapper.toXpDTO(xp));
            model.addAttribute("competencias", competenciaService.findAllCompetencias());
            model.addAttribute("participantes", participanteService.listarTodos());
            return "xp/formulario";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/xp";
        }
    }

    @PostMapping("/salvar")
    public String salvar(@ModelAttribute("xp") @Valid XpDTO dto,
                         BindingResult result,
                         RedirectAttributes redirectAttributes,
                         Model model) {
        try {
            Xp xpSalvo = xpService.saveOrAtualizeXp(dto);
            String mensagem = dto.id() != null
                    ? "Xp '" + xpSalvo.getHoras() + "' atualizado com sucesso!"
                    : "Xp '" + xpSalvo.getHoras() + "' criado com sucesso!";
            redirectAttributes.addFlashAttribute("message", mensagem);
            return "redirect:/xp";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/xp/formulario" + (dto.id() != null ? "?id=" + dto.id() : "");
        }
    }

    @GetMapping
    public String listar(Model model) {
        model.addAttribute("xps", xpService.findAllXps());
        return "xp/listagem";
    }

    @GetMapping("/delete/{id}")
    @Transactional
    public String deleteXp(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            xpService.apagarPorId(id);
            redirectAttributes.addFlashAttribute("message", "O Xp " + id + " foi apagado!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", e.getMessage());
        }
        return "redirect:/xp";
    }
}
