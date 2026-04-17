package com.fateczl.muttley.xp;

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


// linha 62~79 ta dando erro(parece que é no getter e setter)

@Controller
@RequestMapping("/xp")
public class XpController {

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
            dto = new XpDTO(null, 0);
        }
        model.addAttribute("xp" ,dto);
        return "xp/formulario";
    }

    @GetMapping ("/formulario/{id}")
    public String loadPageFormulario (@PathVariable("id") Long id, Model model,
        RedirectAttributes redirectAttributes) {
            XpDTO dto;
            try {
                if (id != null) {
                    Xp xp = xpService.procurarPorId(id)
                        .orElseThrow(() -> new EntityNotFoundException("xp não encontrado"));
                    dto = xpMapper.toXpDTO(xp);
                    model.addAttribute("xp", dto);
                }
                return "xp/formulario";
            } catch (EntityNotFoundException e) {
                redirectAttributes.addFlashAttribute("error", e.getMessage());
                return "redirect:/xp";
            }
        }

     /*   @PostMapping("/salvar")
        public String salvar (@ModelAttribute("xp") @Valid XpDTO dto,
                            BindingResult result,
                            RedirectAttributes redirectAttributes,
                            Model model) {
                            
            try {
                Xp xpSalva = xpService.saveOrAtualizeXp(dto);
                String mensagem = dto.id() != null
                    ? "Xp '" + xpSalva.getHoras() + "' atualizado com sucesso!"
                    : "Xp '" + xpSalva.getHoras() + "' criado com sucesso!";
                redirectAttributes.addFlashAttribute("message", mensagem);
                return "redirect:/xp";
            }   catch (EntityNotFoundException e) {
                redirectAttributes.addFlashAttribute("error", e.getMessage());
                return "redirect:/xp/formulario" + (dto.id() != null ? "?id=" + dto.id() : "");
            }
        } */

    @GetMapping("/delete/{id}")
    @Transactional
    public String deleteXp(@PathVariable("id") Long id, Model model, RedirectAttributes redirectAttributes) {
        try {
            xpService.apagarPorId(id);
            redirectAttributes.addFlashAttribute("meessage", "O Xp" + id + " foi apagado!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("message", e.getMessage());
        }
        return "redirect:/xp";
    }
}