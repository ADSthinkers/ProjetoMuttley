package com.fateczl.muttley.palestra;

import com.fateczl.muttley.competencia.CompetenciaService;
import com.fateczl.muttley.evento.EventoService;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.palestrante.PalestranteService;
import com.fateczl.muttley.qrcode.QrCodeUtil;
import com.fateczl.muttley.tipo.Modalidade;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/palestra")
public class PalestraController {

    @Autowired
    private PalestraService palestraService;

    @Autowired
    private PalestraMapper palestraMapper;

    @Autowired
    private CompetenciaService competenciaService;

    @Autowired
    private EventoService eventoService;

    @Autowired
    private PalestranteService palestranteService;

    @GetMapping("/listagem")
    public String loadListingPage(Model model) {
        List<ListagemPalestra> palestras = palestraService.findAll()
                .stream()
                .map(p -> new ListagemPalestra(
                        p.getId(),
                        p.getTitulo(),
                        p.getDescricao(),
                        p.getCompetencias(),
                        p.getPalestrantes() != null
                                ? p.getPalestrantes().stream().map(Palestrante::getNome).toList()
                                : java.util.List.of(),
                        p.getInicio(),
                        p.getFim()
                ))
                .toList();
        model.addAttribute("palestras", palestras);
        return "palestra/listagem";
    }

    @GetMapping("/formulario")
    public String showForm(@RequestParam(required = false) Long id, Model model) {
        PalestraDTO dto;
        if (id != null) {
            Palestra palestra = palestraService.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
            dto = palestraMapper.toDto(palestra);
        } else {
            dto = new PalestraDTO(null, "", "", new ArrayList<>(), new ArrayList<>(),
                    null, null, null, null, null, null, null, null, null);
        }
        popularModel(model, dto);
        return "palestra/formulario";
    }

    @GetMapping("/formulario/{id}")
    public String loadPageForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        try {
            Palestra palestra = palestraService.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
            popularModel(model, palestraMapper.toDto(palestra));
            return "palestra/formulario";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/palestra/listagem";
        }
    }

    @PostMapping("/salvar")
    public String save(@ModelAttribute("palestra") PalestraDTO dto,
                       RedirectAttributes redirectAttributes,
                       Model model) {
        if (dto.titulo() == null || dto.titulo().isBlank()) {
            model.addAttribute("error", "Título é obrigatório");
            popularModel(model, dto);
            return "palestra/formulario";
        }
        if (dto.palestranteIds() == null || dto.palestranteIds().isEmpty()) {
            model.addAttribute("error", "Selecione pelo menos um palestrante");
            popularModel(model, dto);
            return "palestra/formulario";
        }
        try {
            Palestra saved = palestraService.saveOrUpdate(dto);
            String msg = dto.id() != null
                    ? "Palestra '" + saved.getTitulo() + "' atualizada com sucesso!"
                    : "Palestra '" + saved.getTitulo() + "' criada com sucesso!";
            redirectAttributes.addFlashAttribute("message", msg);
            return "redirect:/palestra/listagem";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/palestra/formulario" + (dto.id() != null ? "?id=" + dto.id() : "");
        }
    }

    @GetMapping("/delete/{id}")
    @Transactional
    public String deletePalestra(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            palestraService.deleteById(id);
            redirectAttributes.addFlashAttribute("message", "A palestra " + id + " foi apagada!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/palestra/listagem";
    }

    @GetMapping("/{id}/qrcode")
    @ResponseBody
    public ResponseEntity<byte[]> qrCode(@PathVariable Long id, HttpServletRequest request) {
        Palestra palestra = palestraService.garantirToken(id);
        int port = request.getServerPort();
        String baseUrl = request.getScheme() + "://" + request.getServerName()
                + (port != 80 && port != 443 ? ":" + port : "");
        String url = baseUrl + "/participar/" + palestra.getQrCodeToken();
        try {
            byte[] imagem = QrCodeUtil.gerar(url, 300, 300);
            return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(imagem);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private void popularModel(Model model, PalestraDTO dto) {
        model.addAttribute("palestra", dto);
        model.addAttribute("competencias", competenciaService.findAllCompetencias());
        model.addAttribute("palestrantes", palestranteService.listarTodos());
        model.addAttribute("eventos", eventoService.listarTodos());
        model.addAttribute("tipos", TipoPalestra.values());
        model.addAttribute("modalidades", Modalidade.values());
    }
}
