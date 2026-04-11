package com.fateczl.muttley.palestra;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.persistence.EntityNotFoundException;


@Controller
@RequestMapping("/palestra")
public class PalestraController {

    @Autowired
    private PalestraService palestraService;

    @Autowired
    private PalestraMapper palestraMapper;

    @Autowired
    private CompetenciaService competenciaService;

    @GetMapping
    public String loadListingPage(Model model) {
        model.addAttribute("listPalestras", palestraService.findAll())
        return "palestra/listagem";
    }

    @GetMapping("/formulario")
    public String showForm(@RequestParam(required = false) long id, Model model) {
        PalestraDTO dto;
        if(id != null){
            Palestra palestra = palestraService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
            dto = palestraMapper.toDto(palestra);
        } else {
            dto = new PalestraDTO(null, null, null, null, null, null, null);
        }
        model.addAttribute("palestra", dto);
        model.addAttribute("competencias", competenciaService.findAll());
        return "palestra/formulario";
    }
    //TO-DO
    @GetMapping("/formulario/{id}")
    public String getMethodName(@RequestParam String param) {
        return new String();
    }
    
    
}
