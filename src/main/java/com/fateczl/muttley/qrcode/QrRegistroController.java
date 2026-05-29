package com.fateczl.muttley.qrcode;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraService;
import com.fateczl.muttley.participacao.ParticipacaoDTO;
import com.fateczl.muttley.participacao.ParticipacaoRepository;
import com.fateczl.muttley.participacao.ParticipacaoService;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteDTO;
import com.fateczl.muttley.participante.ParticipanteService;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.temporal.ChronoUnit;

@Controller
@RequestMapping("/participar")
public class QrRegistroController {

    private final PalestraService palestraService;
    private final ParticipanteService participanteService;
    private final ParticipacaoService participacaoService;
    private final ParticipacaoRepository participacaoRepository;

    public QrRegistroController(PalestraService palestraService,
                                  ParticipanteService participanteService,
                                  ParticipacaoService participacaoService,
                                  ParticipacaoRepository participacaoRepository) {
        this.palestraService = palestraService;
        this.participanteService = participanteService;
        this.participacaoService = participacaoService;
        this.participacaoRepository = participacaoRepository;
    }

    @GetMapping("/{token}")
    public String mostrarIdentificacao(@PathVariable String token, Model model) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            model.addAttribute("erro", "QR Code inválido ou palestra não encontrada.");
            return "qrcode/erro";
        }
        model.addAttribute("palestra", palestra);
        model.addAttribute("token", token);
        return "qrcode/identificacao";
    }

    @PostMapping("/{token}")
    public String verificarIdentidade(@PathVariable String token,
                                       @RequestParam String cpf,
                                       @RequestParam String email,
                                       Model model,
                                       RedirectAttributes redirectAttributes) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            model.addAttribute("erro", "QR Code inválido.");
            return "qrcode/erro";
        }

        Participante participante = participanteService.buscarPorCpfEEmail(cpf.trim(), email.trim()).orElse(null);

        if (participante == null) {
            redirectAttributes.addFlashAttribute("cpf", cpf.trim());
            redirectAttributes.addFlashAttribute("email", email.trim());
            return "redirect:/participar/" + token + "/cadastro";
        }

        if (participacaoRepository.existsByParticipanteIdAndPalestraId(participante.getId(), palestra.getId())) {
            model.addAttribute("palestra", palestra);
            model.addAttribute("token", token);
            model.addAttribute("aviso", "Você já está registrado nesta palestra, " + participante.getNome() + "!");
            return "qrcode/identificacao";
        }

        float horas = calcularHoras(palestra);
        participacaoService.salvarOuAtualizar(
                new ParticipacaoDTO(null, horas, participante.getId(), palestra.getId()));

        redirectAttributes.addFlashAttribute("nomeParticipante", participante.getNome());
        redirectAttributes.addFlashAttribute("palestraTitulo", palestra.getTitulo());
        return "redirect:/participar/" + token + "/sucesso";
    }

    @GetMapping("/{token}/cadastro")
    public String mostrarCadastro(@PathVariable String token, Model model) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            model.addAttribute("erro", "QR Code inválido.");
            return "qrcode/erro";
        }
        model.addAttribute("palestra", palestra);
        model.addAttribute("token", token);
        return "qrcode/cadastro";
    }

    @PostMapping("/{token}/cadastro")
    public String cadastrar(@PathVariable String token,
                             @RequestParam String nome,
                             @RequestParam String cpf,
                             @RequestParam String email,
                             Model model,
                             RedirectAttributes redirectAttributes) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            model.addAttribute("erro", "QR Code inválido.");
            return "qrcode/erro";
        }

        Participante participante = participanteService
                .buscarPorCpfEEmail(cpf.trim(), email.trim()).orElse(null);

        if (participante == null) {
            ParticipanteDTO novoDto = new ParticipanteDTO(null, nome.trim(), null, cpf.trim(), email.trim(), null, null, null);
            participante = participanteService.salvarOuAtualizar(novoDto);
        }

        if (!participacaoRepository.existsByParticipanteIdAndPalestraId(participante.getId(), palestra.getId())) {
            float horas = calcularHoras(palestra);
            participacaoService.salvarOuAtualizar(
                    new ParticipacaoDTO(null, horas, participante.getId(), palestra.getId()));
        }

        redirectAttributes.addFlashAttribute("nomeParticipante", participante.getNome());
        redirectAttributes.addFlashAttribute("palestraTitulo", palestra.getTitulo());
        return "redirect:/participar/" + token + "/sucesso";
    }

    @GetMapping("/{token}/sucesso")
    public String sucesso(@PathVariable String token, Model model) {
        return "qrcode/sucesso";
    }

    private float calcularHoras(Palestra palestra) {
        if (palestra.getInicio() == null || palestra.getFim() == null) return 1f;
        long horas = ChronoUnit.HOURS.between(palestra.getInicio(), palestra.getFim());
        return Math.max(1f, (float) horas);
    }
}
