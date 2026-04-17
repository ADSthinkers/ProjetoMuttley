package com.fateczl.muttley.participacao;
 
import java.util.List;
 
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
 
import com.fateczl.muttley.aluno.AlunoRepository;
import com.fateczl.muttley.palestra.PalestraRepository;
 
import jakarta.validation.Valid;
 
@Controller
@RequestMapping("/participacao")
public class ParticipacaoController {
 
    private final ParticipacaoService service;
    private final ParticipacaoMapper mapper;
    private final AlunoRepository alunoRepository;
    private final PalestraRepository palestraRepository;
 
    public ParticipacaoController(ParticipacaoService service, ParticipacaoMapper mapper,
                                   AlunoRepository alunoRepository, PalestraRepository palestraRepository) {
        this.service = service;
        this.mapper = mapper;
        this.alunoRepository = alunoRepository;
        this.palestraRepository = palestraRepository;
    }
 
    @GetMapping
    public String listar(Model model) {
        List<ParticipacaoListagem> lista = service.listarTodos()
                .stream()
                .map(mapper::toListagemDto)
                .toList();
        model.addAttribute("listaParticipacoes", lista);
        return "participacao/listagem";
    }
 
    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("participacaoDTO", new ParticipacaoDTO(null, null, null, null));
        model.addAttribute("alunos", alunoRepository.findAll());
        model.addAttribute("palestras", palestraRepository.findAll());
        return "participacao/formulario";
    }
 
    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model) {
        service.buscarPorId(id).ifPresent(p -> {
            model.addAttribute("participacaoDTO", mapper.toDTO(p));
        });
        if (!model.containsAttribute("participacaoDTO")) {
            return "redirect:/participacao";
        }
        model.addAttribute("alunos", alunoRepository.findAll());
        model.addAttribute("palestras", palestraRepository.findAll());
        return "participacao/formulario";
    }
 
    @PostMapping("/salvar")
    public String salvar(@Valid @ModelAttribute("participacaoDTO") ParticipacaoDTO dto,
                         BindingResult result, Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            model.addAttribute("alunos", alunoRepository.findAll());
            model.addAttribute("palestras", palestraRepository.findAll());
            return "participacao/formulario";
        }
 
        service.salvarOuAtualizar(dto);
        redirectAttributes.addFlashAttribute("message", "Participação salva com sucesso!");
        return "redirect:/participacao";
    }
 
    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        service.deletar(id);
        redirectAttributes.addFlashAttribute("message", "Participação excluída!");
        return "redirect:/participacao";
    }
}