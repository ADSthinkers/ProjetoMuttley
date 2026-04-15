package com.fateczl.muttley.palestra;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import com.fateczl.muttley.competencia.CompetenciaService;

@Controller
@RequestMapping("/palestra")
public class PalestraController {

    @Autowired
    private PalestraService palestraService;

    @Autowired
    private PalestraMapper palestraMapper;

    @Autowired
    private CompetenciaService competenciaService;

    @GetMapping("/listagem")
    public String loadListingPage(Model model) {
        model.addAttribute("listPalestra", palestraService.findAll());
        return "palestra/listagem";
    }

    @GetMapping("/formulario")
    public String showForm(@RequestParam(required = false) Long id, Model model) {
        PalestraDTO dto;
        if(id != null){
            Palestra palestra = palestraService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
            dto = palestraMapper.toDto(palestra);
        } else {
            dto = new PalestraDTO(null, "", "", new ArrayList<>(), new ArrayList<>(), null, null);
        }
        model.addAttribute("palestra", dto);
        model.addAttribute("competencias", competenciaService.findAllCompetencias());
        return "palestra/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String loadPageForm(@PathVariable("id") Long id, Model model, RedirectAttributes redirectAttributes) {
        PalestraDTO dto;
        try{
            if (id != null) {
                Palestra palestra = palestraService.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
                    model.addAttribute("competencias", competenciaService.findAllCompetencias());
                    dto = palestraMapper.toDto(palestra);
                    model.addAttribute("palestra", dto);
            }
            return "palestra/formulario";
        } catch (EntityNotFoundException e){
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/palestra";
        }
    }
    
    @PostMapping("/salvar")
    public String save(@ModelAttribute("palestra") @Valid PalestraDTO dto,
                    BindingResult result,
                    @RequestParam(name = "palestrantesTexto", required = false) String palestrantesTexto,
                    RedirectAttributes redirectAttributes,
                    Model model) {

        if (result.hasErrors()) {
            model.addAttribute("competencias", competenciaService.findAllCompetencias());
            return "palestra/formulario";
        }

        try {
            List<String> listaPalestrantes = new ArrayList<>();

            if (palestrantesTexto != null && !palestrantesTexto.isBlank()) {
                listaPalestrantes = Arrays.stream(palestrantesTexto.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
            }

            dto = new PalestraDTO(
                dto.id(),
                dto.titulo(),
                dto.descricao(),
                dto.competenciaIds(),
                listaPalestrantes,
                dto.inicio(),
                dto.fim()
            );

            Palestra savedP = palestraService.saveOrUpdate(dto);

            String message = dto.id() != null
                ? "Palestra '" + savedP.getTitulo() + "' atualizada com sucesso!"
                : "Palestra '" + savedP.getTitulo() + "' criada com sucesso!";

            redirectAttributes.addFlashAttribute("message", message);

            return "redirect:/palestra";

        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/palestra/formulario" + (dto.id() != null ? "?id=" + dto.id() : "");
        }
    }

    @GetMapping("/delete/{id}")
	@Transactional
	public String deletePalestra(@PathVariable("id") Long id, Model model, RedirectAttributes redirectAttributes) {
		try {
			palestraService.deleteById(id);
			redirectAttributes.addFlashAttribute("message", "A palestra " + id + " foi apagada!");
		} catch (Exception e) {
			redirectAttributes.addFlashAttribute("error", e.getMessage());
		}
		return "redirect:/palestra";
	}
}
