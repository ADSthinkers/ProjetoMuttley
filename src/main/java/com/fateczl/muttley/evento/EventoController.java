package com.fateczl.muttley.evento;

import com.fateczl.muttley.assinante.AssinanteRepository;
import com.fateczl.muttley.patrocinador.PatrocinadorRepository;
import com.fateczl.muttley.tipo.Modalidade;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

// controlador MVC responsável pelas telas de listagem, cadastro, edição e exclusão de eventos
@Controller
@RequestMapping("/evento")
public class EventoController {

    private final EventoService service;
    private final EventoMapper mapper;
    private final PatrocinadorRepository patrocinadorRepository;
    private final CategoriaEventoRepository categoriaEventoRepository;
    private final AssinanteRepository assinanteRepository;

    public EventoController(EventoService service, EventoMapper mapper,
                             PatrocinadorRepository patrocinadorRepository,
                             CategoriaEventoRepository categoriaEventoRepository,
                             AssinanteRepository assinanteRepository) {
        this.service = service;
        this.mapper = mapper;
        this.patrocinadorRepository = patrocinadorRepository;
        this.categoriaEventoRepository = categoriaEventoRepository;
        this.assinanteRepository = assinanteRepository;
    }

    // exibe a listagem de todos os eventos cadastrados
    @GetMapping
    public String listar(Model model) {
        List<EventoListagem> lista = service.listarTodos()
                .stream().map(mapper::toListagemDto).toList();
        model.addAttribute("listaEventos", lista);
        return "evento/listagem";
    }

    // exibe o formulário de criação de um novo evento
    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("evento", new EventoDTO(null, "", null, null, null, null, null, null, null, List.of()));
        popularModel(model);
        return "evento/formulario";
    }

    // carrega o formulário de edição preenchido com os dados do evento informado pelo id
    @GetMapping("/formulario/{id}")
    public String editar(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        try {
            Evento evento = service.buscarPorId(id)
                    .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
            model.addAttribute("evento", mapper.toAtualizacaoDto(evento));
            popularModel(model);
            return "evento/formulario";
        } catch (EntityNotFoundException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/evento";
        }
    }

    // processa a submissão do formulário e salva ou atualiza o evento
    @PostMapping("/salvar")
    public String salvar(@Valid @ModelAttribute("evento") EventoDTO dto,
                         BindingResult result, Model model, RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            popularModel(model);
            return "evento/formulario";
        }
        try {
            service.salvarOuAtualizar(dto);
            redirectAttributes.addFlashAttribute("message", "Evento salvo com sucesso!");
        } catch (EntityNotFoundException | IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/evento";
    }

    // remove o evento e redireciona para a listagem com mensagem de confirmação
    @GetMapping("/delete/{id}")
    public String deletar(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            service.deletar(id);
            redirectAttributes.addFlashAttribute("message", "Evento excluído com sucesso!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/evento";
    }

    // preenche o modelo com as listas de modalidades e patrocinadores para o formulário
    private void popularModel(Model model) {
        model.addAttribute("modalidades", Modalidade.values());
        model.addAttribute("patrocinadores", patrocinadorRepository.findAll());
        model.addAttribute("categorias", categoriaEventoRepository.findAll());
        model.addAttribute("assinantes", assinanteRepository.findAll());
    }
}
