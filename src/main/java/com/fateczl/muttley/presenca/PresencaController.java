package com.fateczl.muttley.presenca;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import com.fateczl.muttley.certificado.Certificado;
import com.fateczl.muttley.certificado.CertificadoPdfService;
import com.fateczl.muttley.certificado.CertificadoService;
import com.fateczl.muttley.email.EmailService;
import com.fateczl.muttley.inscricao.Inscricao;
import com.fateczl.muttley.inscricao.InscricaoService;
import com.fateczl.muttley.inscricao.StatusInscricao;
import com.fateczl.muttley.medalha.MedalhaService;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.participacao.ParticipacaoService;
import com.fateczl.muttley.xp.XpService;
import com.fateczl.muttley.palestra.PalestraService;
import com.fateczl.muttley.palestra.StatusPalestra;
import com.fateczl.muttley.palestrante.Palestrante;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/presencas")
public class PresencaController {

    private final InscricaoService inscricaoService;
    private final PalestraService palestraService;
    private final CertificadoService certificadoService;
    private final CertificadoPdfService certificadoPdfService;
    private final MedalhaService medalhaService;
    private final XpService xpService;
    private final ParticipacaoService participacaoService;
    private final AuditoriaService auditoriaService;
    private final EmailService emailService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public PresencaController(InscricaoService inscricaoService,
                               PalestraService palestraService,
                               CertificadoService certificadoService,
                               CertificadoPdfService certificadoPdfService,
                               MedalhaService medalhaService,
                               XpService xpService,
                               ParticipacaoService participacaoService,
                               AuditoriaService auditoriaService,
                               EmailService emailService) {
        this.inscricaoService = inscricaoService;
        this.palestraService = palestraService;
        this.certificadoService = certificadoService;
        this.certificadoPdfService = certificadoPdfService;
        this.medalhaService = medalhaService;
        this.xpService = xpService;
        this.participacaoService = participacaoService;
        this.auditoriaService = auditoriaService;
        this.emailService = emailService;
    }

    @GetMapping("/{palestraId}")
    public String gestao(@PathVariable Long palestraId, Model model) {
        Palestra palestra = palestraService.findById(palestraId)
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));

        List<Inscricao> inscricoes = inscricaoService.listarPorPalestra(palestraId);

        long totalPresentes = inscricoes.stream()
                .filter(i -> i.getStatus() == StatusInscricao.CONFIRMADA).count();

        model.addAttribute("palestra", palestra);
        model.addAttribute("inscricoes", inscricoes);
        model.addAttribute("totalPresentes", totalPresentes);
        model.addAttribute("totalAusentes", inscricoes.size() - totalPresentes);
        return "presenca/gestao";
    }

    @PostMapping("/{palestraId}/toggle/{inscricaoId}")
    public String toggle(@PathVariable Long palestraId,
                          @PathVariable Long inscricaoId,
                          RedirectAttributes redirectAttributes) {
        Inscricao inscricao = inscricaoService.buscarPorId(inscricaoId)
                .orElseThrow(() -> new EntityNotFoundException("Inscrição não encontrada"));

        if (inscricao.getStatus() == StatusInscricao.CONFIRMADA) {
            inscricaoService.marcarAusente(inscricaoId);
        } else {
            inscricaoService.marcarPresente(inscricaoId);
        }
        return "redirect:/presencas/" + palestraId;
    }

    @PostMapping("/{palestraId}/confirmar")
    public String confirmarTodos(@PathVariable Long palestraId,
                                  Authentication authentication,
                                  RedirectAttributes redirectAttributes) {
        Palestra palestra = palestraService.findByIdComPalestrantes(palestraId)
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));

        String realizadoPor = authentication.getName();
        int countParticipantes = 0;
        int countPalestrantes = 0;

        // Certificados para participantes confirmados
        List<Inscricao> confirmadas = inscricaoService.listarPorPalestra(palestraId)
                .stream()
                .filter(i -> i.getStatus() == StatusInscricao.CONFIRMADA)
                .toList();

        for (Inscricao inscricao : confirmadas) {
            Long participanteId = inscricao.getParticipante().getId();

            Certificado cert = certificadoService.emitirOuBuscar(participanteId, palestraId);
            auditoriaService.registrar(AcaoAuditoria.CERTIFICADO_EMITIDO, "Certificado", cert.getId(),
                    "Certificado emitido para " + inscricao.getParticipante().getNome(), realizadoPor);

            participacaoService.registrarOuAtualizar(inscricao.getParticipante(), palestra);
            medalhaService.concederSeNaoExistir(participanteId, palestra);
            auditoriaService.registrar(AcaoAuditoria.MEDALHA_CONCEDIDA, "Medalha", palestraId,
                    "Medalha concedida a " + inscricao.getParticipante().getNome(), realizadoPor);

            xpService.registrarParaPalestra(participanteId, palestra);

            // Gera PDF e envia e-mail
            certificadoService.buscarPorIdComDetalhes(cert.getId()).ifPresent(certCompleto -> {
                byte[] pdf = certificadoPdfService.gerar(certCompleto, baseUrl);
                emailService.enviarCertificado(certCompleto, pdf);
            });

            countParticipantes++;
        }

        // Certificados de apresentação para os palestrantes da palestra
        List<Palestrante> palestrantes = palestra.getPalestrantes();
        if (palestrantes != null) {
            for (Palestrante palestrante : palestrantes) {
                Certificado certPalestrante = certificadoService
                        .emitirOuBuscarPalestrante(palestrante.getId(), palestraId);
                auditoriaService.registrar(AcaoAuditoria.CERTIFICADO_EMITIDO, "Certificado",
                        certPalestrante.getId(),
                        "Certificado de apresentação emitido para " + palestrante.getNome(),
                        realizadoPor);

                medalhaService.concederPalestranteSeNaoExistir(palestrante.getId(), palestra);
                auditoriaService.registrar(AcaoAuditoria.MEDALHA_CONCEDIDA, "Medalha", palestraId,
                        "Medalha de apresentação concedida a " + palestrante.getNome(), realizadoPor);

                certificadoService.buscarPorIdComDetalhes(certPalestrante.getId()).ifPresent(certCompleto -> {
                    byte[] pdf = certificadoPdfService.gerar(certCompleto, baseUrl);
                    emailService.enviarCertificado(certCompleto, pdf);
                });

                countPalestrantes++;
            }
        }

        palestraService.atualizarStatus(palestraId, StatusPalestra.CERTIFICADOS_EMITIDOS);

        redirectAttributes.addFlashAttribute("message",
                countParticipantes + " certificado(s) de participação e " +
                countPalestrantes + " certificado(s) de apresentação emitidos. E-mails enviados!");
        return "redirect:/presencas/" + palestraId;
    }
}
