package com.fateczl.muttley.qrcode;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import com.fateczl.muttley.certificado.Certificado;
import com.fateczl.muttley.certificado.CertificadoPdfService;
import com.fateczl.muttley.certificado.CertificadoService;
import com.fateczl.muttley.config.PublicRoute;
import com.fateczl.muttley.email.EmailService;
import com.fateczl.muttley.inscricao.Inscricao;
import com.fateczl.muttley.inscricao.InscricaoDTO;
import com.fateczl.muttley.inscricao.InscricaoService;
import com.fateczl.muttley.inscricao.StatusInscricao;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraService;
import com.fateczl.muttley.status.StatusOperacional;
import com.fateczl.muttley.participacao.ParticipacaoService;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteDTO;
import com.fateczl.muttley.participante.ParticipanteService;
import com.fateczl.muttley.xp.XpService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/qrcode")
public class QrCodeApiController {

    private final PalestraService palestraService;
    private final ParticipanteService participanteService;
    private final InscricaoService inscricaoService;
    private final AuditoriaService auditoriaService;
    private final ParticipacaoService participacaoService;
    private final CertificadoService certificadoService;
    private final CertificadoPdfService certificadoPdfService;
    private final EmailService emailService;
    private final XpService xpService;

    public QrCodeApiController(PalestraService palestraService,
                               ParticipanteService participanteService,
                               InscricaoService inscricaoService,
                               AuditoriaService auditoriaService,
                               ParticipacaoService participacaoService,
                               CertificadoService certificadoService,
                               CertificadoPdfService certificadoPdfService,
                               EmailService emailService,
                               XpService xpService) {
        this.palestraService = palestraService;
        this.participanteService = participanteService;
        this.inscricaoService = inscricaoService;
        this.auditoriaService = auditoriaService;
        this.participacaoService = participacaoService;
        this.certificadoService = certificadoService;
        this.certificadoPdfService = certificadoPdfService;
        this.emailService = emailService;
        this.xpService = xpService;
    }

    @GetMapping("/palestras/{palestraId}/inscricao/imagem")
    public ResponseEntity<byte[]> gerarQrCodeInscricao(@PathVariable Long palestraId,
                                                       HttpServletRequest request) {
        Palestra palestra = palestraService.garantirToken(palestraId);
        return gerarImagemQrCode(urlBase(request) + "/api/qrcode/" + palestra.getQrCodeToken());
    }

    @GetMapping("/palestras/{palestraId}/checkin/imagem")
    public ResponseEntity<byte[]> gerarQrCodeCheckin(@PathVariable Long palestraId,
                                                     HttpServletRequest request) {
        Palestra palestra = palestraService.garantirCheckinToken(palestraId);
        return gerarImagemQrCode(urlBase(request) + "/api/qrcode/checkin/" + palestra.getQrCodeCheckinToken());
    }

    @PublicRoute
    @GetMapping("/{token}")
    public ResponseEntity<?> buscarPalestra(@PathVariable String token) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("QR Code inválido ou palestra não encontrada."));
        }

        StatusOperacional statusBloqueio = statusBloqueio(palestra);
        if (statusBloqueio != null) {
            return ResponseEntity.status(409).body(new QrErroResponse("Esta palestra está " + rotuloStatus(statusBloqueio) + ". Inscrição bloqueada."));
        }

        return ResponseEntity.ok(new QrPalestraResponse(
                palestra.getId(),
                palestra.getTitulo(),
                palestra.getDescricao(),
                palestra.getInicio(),
                palestra.getFim(),
                palestra.getStatusOperacional()
        ));
    }

    @PublicRoute
    @PostMapping("/{token}/identificar")
    public ResponseEntity<?> identificar(@PathVariable String token, @RequestBody QrIdentificacaoRequest request) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("QR Code inválido."));
        }

        StatusOperacional statusBloqueio = statusBloqueio(palestra);
        if (statusBloqueio != null) {
            return ResponseEntity.status(409).body(new QrErroResponse("Esta palestra está " + rotuloStatus(statusBloqueio) + ". Inscrição bloqueada."));
        }

        String cpf = normalizar(request.cpf());
        Participante participante = participanteService.buscarPorCpf(cpf).orElse(null);

        if (participante == null) {
            if (!inscricaoService.temVagaDisponivel(palestra.getId(), palestra.getVagas())) {
                return ResponseEntity.status(409).body(new QrErroResponse("A capacidade máxima desta palestra já foi atingida."));
            }
            return ResponseEntity.ok(new QrIdentificacaoResponse("CADASTRO_NECESSARIO", cpf, null, null));
        }

        return ResponseEntity.ok(new QrIdentificacaoResponse(
                "PARTICIPANTE_ENCONTRADO",
                cpf,
                participante.getNome(),
                "Confirme se este cadastro é seu para registrar a inscrição."
        ));
    }

    @PublicRoute
    @PostMapping("/{token}/confirmar")
    public ResponseEntity<?> confirmarInscricao(@PathVariable String token, @RequestBody QrIdentificacaoRequest request) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("QR Code inválido."));
        }

        StatusOperacional statusBloqueio = statusBloqueio(palestra);
        if (statusBloqueio != null) {
            return ResponseEntity.status(409).body(new QrErroResponse("Esta palestra está " + rotuloStatus(statusBloqueio) + ". Inscrição bloqueada."));
        }

        String cpf = normalizar(request.cpf());
        Participante participante = participanteService.buscarPorCpf(cpf).orElse(null);
        if (participante == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("Participante não encontrado."));
        }

        return registrarInscricao(palestra, participante, false);
    }

    @PublicRoute
    @PostMapping("/{token}/cadastro")
    public ResponseEntity<?> cadastrar(@PathVariable String token, @RequestBody QrCadastroRequest request) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("QR Code inválido."));
        }

        StatusOperacional statusBloqueio = statusBloqueio(palestra);
        if (statusBloqueio != null) {
            return ResponseEntity.status(409).body(new QrErroResponse("Esta palestra está " + rotuloStatus(statusBloqueio) + ". Inscrição bloqueada."));
        }

        String nome = normalizar(request.nome());
        String cpf = normalizar(request.cpf());
        String email = normalizar(request.email());

        Participante participante = participanteService.buscarPorCpf(cpf).orElse(null);
        if (participante == null && !inscricaoService.temVagaDisponivel(palestra.getId(), palestra.getVagas())) {
            return ResponseEntity.status(409).body(new QrErroResponse("A capacidade máxima desta palestra já foi atingida."));
        }

        if (participante == null) {
            participante = participanteService.salvarOuAtualizar(
                    new ParticipanteDTO(null, nome, null, cpf, email, null, null, null)
            );
        }

        return registrarInscricao(palestra, participante, true);
    }

    @PublicRoute
    @GetMapping("/checkin/{token}")
    public ResponseEntity<?> buscarPalestraCheckin(@PathVariable String token) {
        Palestra palestra = palestraService.findByQrCodeCheckinToken(token).orElse(null);
        if (palestra == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("QR Code de check-in inválido ou palestra não encontrada."));
        }

        StatusOperacional statusBloqueio = statusBloqueio(palestra);
        if (statusBloqueio != null) {
            return ResponseEntity.status(409).body(new QrErroResponse("Esta palestra está " + rotuloStatus(statusBloqueio) + ". Check-in bloqueado."));
        }

        return ResponseEntity.ok(new QrPalestraResponse(
                palestra.getId(),
                palestra.getTitulo(),
                palestra.getDescricao(),
                palestra.getInicio(),
                palestra.getFim(),
                palestra.getStatusOperacional()
        ));
    }

    @PublicRoute
    @PostMapping("/checkin/{token}/identificar")
    public ResponseEntity<?> checkin(@PathVariable String token,
                                     @RequestBody QrIdentificacaoRequest request,
                                     HttpServletRequest httpRequest) {
        Palestra palestra = palestraService.findByQrCodeCheckinToken(token).orElse(null);
        if (palestra == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("QR Code de check-in inválido."));
        }

        StatusOperacional statusBloqueio = statusBloqueio(palestra);
        if (statusBloqueio != null) {
            return ResponseEntity.status(409).body(new QrErroResponse("Esta palestra está " + rotuloStatus(statusBloqueio) + ". Check-in bloqueado."));
        }

        String cpf = normalizar(request.cpf());
        Participante participante = participanteService.buscarPorCpf(cpf).orElse(null);
        if (participante == null) {
            return ResponseEntity.status(404).body(new QrErroResponse(
                    "Participante não encontrado. Faça a inscrição pelo QR Code de inscrição antes do check-in."
            ));
        }

        Inscricao inscricao = inscricaoService.buscarPorParticipanteEPalestra(participante.getId(), palestra.getId())
                .orElse(null);
        if (inscricao == null) {
            return ResponseEntity.status(409).body(new QrErroResponse(
                    "Inscrição não encontrada para esta palestra. Faça a inscrição antes do check-in."
            ));
        }
        if (inscricao.getStatus() == StatusInscricao.CANCELADA) {
            return ResponseEntity.status(409).body(new QrErroResponse("Inscrição cancelada. Check-in não permitido."));
        }
        if (inscricao.getStatus() == StatusInscricao.CONFIRMADA) {
            return ResponseEntity.ok(new QrSucessoResponse(
                    "JA_CONFIRMADO",
                    participante.getNome(),
                    palestra.getTitulo(),
                    inscricao.getDataCheckin(),
                    "Check-in já confirmado para esta palestra."
            ));
        }

        return ResponseEntity.ok(new QrIdentificacaoResponse(
                "PARTICIPANTE_ENCONTRADO",
                cpf,
                participante.getNome(),
                "Confirme se este cadastro é seu para fazer check-in."
        ));
    }

    @PublicRoute
    @PostMapping("/checkin/{token}/confirmar")
    public ResponseEntity<?> confirmarCheckin(@PathVariable String token,
                                              @RequestBody QrIdentificacaoRequest request,
                                              HttpServletRequest httpRequest) {
        Palestra palestra = palestraService.findByQrCodeCheckinToken(token).orElse(null);
        if (palestra == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("QR Code de check-in inválido."));
        }

        StatusOperacional statusBloqueio = statusBloqueio(palestra);
        if (statusBloqueio != null) {
            return ResponseEntity.status(409).body(new QrErroResponse("Esta palestra está " + rotuloStatus(statusBloqueio) + ". Check-in bloqueado."));
        }

        String cpf = normalizar(request.cpf());
        Participante participante = participanteService.buscarPorCpf(cpf).orElse(null);
        if (participante == null) {
            return ResponseEntity.status(404).body(new QrErroResponse(
                    "Participante não encontrado. Faça a inscrição pelo QR Code de inscrição antes do check-in."
            ));
        }

        Inscricao inscricao = inscricaoService.buscarPorParticipanteEPalestra(participante.getId(), palestra.getId())
                .orElse(null);
        if (inscricao == null) {
            return ResponseEntity.status(409).body(new QrErroResponse(
                    "Inscrição não encontrada para esta palestra. Faça a inscrição antes do check-in."
            ));
        }
        if (inscricao.getStatus() == StatusInscricao.CANCELADA) {
            return ResponseEntity.status(409).body(new QrErroResponse("Inscrição cancelada. Check-in não permitido."));
        }
        if (inscricao.getStatus() == StatusInscricao.CONFIRMADA) {
            return ResponseEntity.ok(new QrSucessoResponse(
                    "JA_CONFIRMADO",
                    participante.getNome(),
                    palestra.getTitulo(),
                    inscricao.getDataCheckin(),
                    "Check-in já confirmado para esta palestra."
            ));
        }

        Inscricao checkin = inscricaoService.marcarPresente(inscricao.getId());
        participacaoService.registrarOuAtualizar(participante, palestra);
        xpService.registrarParaPalestra(participante.getId(), palestra);

        Certificado certificado = certificadoService.emitirOuBuscar(participante.getId(), palestra.getId());
        enviarCertificadoPorEmail(certificado.getId(), httpRequest);

        auditoriaService.registrar(AcaoAuditoria.CHECK_IN, "Palestra", palestra.getId(),
                "Check-in confirmado de " + participante.getNome() + " na palestra: " + palestra.getTitulo(),
                participante.getNome());
        auditoriaService.registrar(AcaoAuditoria.CERTIFICADO_EMITIDO, "Certificado", certificado.getId(),
                "Certificado emitido para " + participante.getNome(), participante.getNome());

        return ResponseEntity.ok(new QrSucessoResponse(
                "CHECKIN_CONFIRMADO",
                participante.getNome(),
                palestra.getTitulo(),
                checkin.getDataCheckin(),
                "Check-in confirmado. Seu certificado foi enviado por e-mail."
        ));
    }

    private ResponseEntity<?> registrarInscricao(Palestra palestra, Participante participante, boolean novoCadastro) {
        Inscricao inscricao = inscricaoService.buscarPorParticipanteEPalestra(participante.getId(), palestra.getId())
                .orElse(null);

        if (inscricao == null) {
            if (!inscricaoService.temVagaDisponivel(palestra.getId(), palestra.getVagas())) {
                return ResponseEntity.status(409).body(new QrErroResponse("A capacidade máxima desta palestra já foi atingida."));
            }

            inscricao = inscricaoService.inscrever(new InscricaoDTO(
                    null,
                    participante.getId(),
                    palestra.getId(),
                    null,
                    null,
                    StatusInscricao.PENDENTE,
                    null
            ));
        }

        auditoriaService.registrar(AcaoAuditoria.INSCRICAO_CRIADA, "Palestra", palestra.getId(),
                (novoCadastro ? "Inscrição (novo cadastro) de " : "Inscrição de ") + participante.getNome()
                        + " na palestra: " + palestra.getTitulo(),
                participante.getNome());

        return ResponseEntity.ok(new QrSucessoResponse(
                inscricao.getStatus() == StatusInscricao.CONFIRMADA ? "JA_CONFIRMADO" : "AGUARDANDO_CONFIRMACAO",
                participante.getNome(),
                palestra.getTitulo(),
                inscricao.getDataCheckin(),
                "Inscrição registrada. Use o QR Code de check-in da palestra para confirmar presença e receber o certificado por e-mail."
        ));
    }

    private ResponseEntity<byte[]> gerarImagemQrCode(String url) {
        try {
            byte[] imagem = QrCodeUtil.gerar(url, 300, 300);
            return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(imagem);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private void enviarCertificadoPorEmail(Long certificadoId, HttpServletRequest request) {
        certificadoService.buscarPorIdComDetalhes(certificadoId).ifPresent(certCompleto -> {
            byte[] pdf = certificadoPdfService.gerar(certCompleto, urlBase(request));
            emailService.enviarCertificado(certCompleto, pdf);
        });
    }

    private String urlBase(HttpServletRequest request) {
        int port = request.getServerPort();
        return request.getScheme() + "://" + request.getServerName()
                + (port != 80 && port != 443 ? ":" + port : "");
    }

    private String normalizar(String value) {
        return value == null ? "" : value.trim();
    }

    private StatusOperacional statusBloqueio(Palestra palestra) {
        if (isStatusBloqueante(palestra.getStatusOperacional())) {
            return palestra.getStatusOperacional();
        }
        if (palestra.getEvento() != null && isStatusBloqueante(palestra.getEvento().getStatusOperacional())) {
            return palestra.getEvento().getStatusOperacional();
        }
        return null;
    }

    private boolean isStatusBloqueante(StatusOperacional status) {
        return status == StatusOperacional.CANCELADO
                || status == StatusOperacional.FINALIZADO
                || status == StatusOperacional.ARQUIVADO;
    }

    private String rotuloStatus(StatusOperacional status) {
        if (status == StatusOperacional.CANCELADO) return "cancelada";
        if (status == StatusOperacional.FINALIZADO) return "finalizada";
        if (status == StatusOperacional.ARQUIVADO) return "arquivada";
        return "inativa";
    }

    public record QrPalestraResponse(Long id, String titulo, String descricao, LocalDateTime inicio, LocalDateTime fim, StatusOperacional statusOperacional) {}
    public record QrIdentificacaoRequest(String cpf) {}
    public record QrCadastroRequest(String nome, String cpf, String email) {}
    public record QrIdentificacaoResponse(String status, String cpf, String nomeParticipante, String mensagem) {}
    public record QrSucessoResponse(String status, String nomeParticipante, String palestraTitulo, LocalDateTime dataCheckin, String mensagem) {}
    public record QrErroResponse(String erro) {}
}
