package com.fateczl.muttley.qrcode;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import com.fateczl.muttley.inscricao.InscricaoService;
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

// controlador responsável pelo fluxo de check-in via QR Code, identificação e cadastro de participantes
@Controller
@RequestMapping("/participar")
public class QrRegistroController {

    private final PalestraService palestraService;
    private final ParticipanteService participanteService;
    private final ParticipacaoService participacaoService;
    private final ParticipacaoRepository participacaoRepository;
    private final InscricaoService inscricaoService;
    private final AuditoriaService auditoriaService;

    public QrRegistroController(PalestraService palestraService,
                                  ParticipanteService participanteService,
                                  ParticipacaoService participacaoService,
                                  ParticipacaoRepository participacaoRepository,
                                  InscricaoService inscricaoService,
                                  AuditoriaService auditoriaService) {
        this.palestraService = palestraService;
        this.participanteService = participanteService;
        this.participacaoService = participacaoService;
        this.participacaoRepository = participacaoRepository;
        this.inscricaoService = inscricaoService;
        this.auditoriaService = auditoriaService;
    }

    // exibe a página de identificação do participante ao escanear o QR Code da palestra
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

    // verifica a identidade pelo CPF e e-mail e registra a presença ou redireciona para o cadastro
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
            model.addAttribute("aviso", "Presença já registrada nesta palestra, " + participante.getNome() + "!");
            return "qrcode/identificacao";
        }

        registrarPresenca(participante, palestra);

        redirectAttributes.addFlashAttribute("nomeParticipante", participante.getNome());
        redirectAttributes.addFlashAttribute("palestraTitulo", palestra.getTitulo());
        return "redirect:/participar/" + token + "/sucesso";
    }

    // exibe o formulário de cadastro para participantes que ainda não estão registrados no sistema
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

    // cadastra um novo participante via QR Code e registra a presença na palestra
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
            registrarPresenca(participante, palestra);
        }

        redirectAttributes.addFlashAttribute("nomeParticipante", participante.getNome());
        redirectAttributes.addFlashAttribute("palestraTitulo", palestra.getTitulo());
        return "redirect:/participar/" + token + "/sucesso";
    }

    // exibe a página de sucesso após o check-in ser realizado com êxito
    @GetMapping("/{token}/sucesso")
    public String sucesso(@PathVariable String token, Model model) {
        return "qrcode/sucesso";
    }

    // registra a participação, confirma a inscrição e gera entrada de auditoria de check-in
    private void registrarPresenca(Participante participante, Palestra palestra) {
        float horas = calcularHoras(palestra);
        participacaoService.salvarOuAtualizar(
                new ParticipacaoDTO(null, horas, participante.getId(), palestra.getId()));

        inscricaoService.confirmarPresenca(participante.getId(), palestra.getId());

        auditoriaService.registrar(AcaoAuditoria.CHECK_IN, "Palestra", palestra.getId(),
                "Check-in de " + participante.getNome() + " na palestra: " + palestra.getTitulo(),
                participante.getNome());
    }

    // calcula a duração da palestra em horas com mínimo de 1 hora
    private float calcularHoras(Palestra palestra) {
        if (palestra.getInicio() == null || palestra.getFim() == null) return 1f;
        long horas = ChronoUnit.HOURS.between(palestra.getInicio(), palestra.getFim());
        return Math.max(1f, (float) horas);
    }
}
