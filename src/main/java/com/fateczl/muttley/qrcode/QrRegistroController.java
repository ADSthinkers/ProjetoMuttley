package com.fateczl.muttley.qrcode;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import com.fateczl.muttley.inscricao.Inscricao;
import com.fateczl.muttley.inscricao.InscricaoDTO;
import com.fateczl.muttley.inscricao.InscricaoService;
import com.fateczl.muttley.inscricao.StatusInscricao;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraService;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteDTO;
import com.fateczl.muttley.participante.ParticipanteService;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

// controlador responsável pelo fluxo de inscrição via QR Code, identificação e cadastro de participantes
@Controller
@RequestMapping("/participar")
public class QrRegistroController {

    private final PalestraService palestraService;
    private final ParticipanteService participanteService;
    private final InscricaoService inscricaoService;
    private final AuditoriaService auditoriaService;

    public QrRegistroController(PalestraService palestraService,
                                  ParticipanteService participanteService,
                                  InscricaoService inscricaoService,
                                  AuditoriaService auditoriaService) {
        this.palestraService = palestraService;
        this.participanteService = participanteService;
        this.inscricaoService = inscricaoService;
        this.auditoriaService = auditoriaService;
    }

    // exibe a página de identificação do participante ao escanear o QR Code de inscrição da palestra
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

    // verifica a identidade pelo CPF e e-mail e registra a inscrição ou redireciona para o cadastro
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
            if (!inscricaoService.temVagaDisponivel(palestra.getId(), palestra.getVagas())) {
                model.addAttribute("palestra", palestra);
                model.addAttribute("token", token);
                model.addAttribute("erro", "A capacidade máxima desta palestra já foi atingida.");
                return "qrcode/identificacao";
            }
            redirectAttributes.addFlashAttribute("cpf", cpf.trim());
            redirectAttributes.addFlashAttribute("email", email.trim());
            return "redirect:/participar/" + token + "/cadastro";
        }

        Inscricao inscricao = inscricaoService.buscarPorParticipanteEPalestra(participante.getId(), palestra.getId())
                .orElse(null);
        if (inscricao != null && inscricao.getStatus() != StatusInscricao.CANCELADA) {
            model.addAttribute("palestra", palestra);
            model.addAttribute("token", token);
            model.addAttribute("aviso", "Inscrição já registrada nesta palestra, " + participante.getNome() + "!");
            return "qrcode/identificacao";
        }

        if (!inscricaoService.temVagaDisponivel(palestra.getId(), palestra.getVagas())) {
            model.addAttribute("palestra", palestra);
            model.addAttribute("token", token);
            model.addAttribute("erro", "A capacidade máxima desta palestra já foi atingida.");
            return "qrcode/identificacao";
        }

        registrarInscricao(participante, palestra);

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

    // cadastra um novo participante via QR Code e registra a inscrição na palestra
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

        if (participante == null && !inscricaoService.temVagaDisponivel(palestra.getId(), palestra.getVagas())) {
            model.addAttribute("palestra", palestra);
            model.addAttribute("token", token);
            model.addAttribute("erro", "A capacidade máxima desta palestra já foi atingida.");
            return "qrcode/cadastro";
        }

        if (participante == null) {
            ParticipanteDTO novoDto = new ParticipanteDTO(null, nome.trim(), null, cpf.trim(), email.trim(), null, null, null);
            participante = participanteService.salvarOuAtualizar(novoDto);
        }

        Inscricao inscricao = inscricaoService.buscarPorParticipanteEPalestra(participante.getId(), palestra.getId())
                .orElse(null);
        if (inscricao == null || inscricao.getStatus() == StatusInscricao.CANCELADA) {
            if (!inscricaoService.temVagaDisponivel(palestra.getId(), palestra.getVagas())) {
                model.addAttribute("palestra", palestra);
                model.addAttribute("token", token);
                model.addAttribute("erro", "A capacidade máxima desta palestra já foi atingida.");
                return "qrcode/cadastro";
            }
            registrarInscricao(participante, palestra);
        }

        redirectAttributes.addFlashAttribute("nomeParticipante", participante.getNome());
        redirectAttributes.addFlashAttribute("palestraTitulo", palestra.getTitulo());
        return "redirect:/participar/" + token + "/sucesso";
    }

    // exibe a página de sucesso após a inscrição ser realizada com êxito
    @GetMapping("/{token}/sucesso")
    public String sucesso(@PathVariable String token, Model model) {
        return "qrcode/sucesso";
    }

    // registra a inscrição pendente e gera entrada de auditoria
    private void registrarInscricao(Participante participante, Palestra palestra) {
        inscricaoService.inscrever(new InscricaoDTO(
                null,
                participante.getId(),
                palestra.getId(),
                null,
                null,
                StatusInscricao.PENDENTE,
                null
        ));

        auditoriaService.registrar(AcaoAuditoria.INSCRICAO_CRIADA, "Palestra", palestra.getId(),
                "Inscrição via QR Code de " + participante.getNome() + " na palestra: " + palestra.getTitulo(),
                participante.getNome());
    }
}
