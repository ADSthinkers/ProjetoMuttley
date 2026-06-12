package com.fateczl.muttley.inscricao;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import com.fateczl.muttley.certificado.Certificado;
import com.fateczl.muttley.certificado.CertificadoPdfService;
import com.fateczl.muttley.certificado.CertificadoService;
import com.fateczl.muttley.email.EmailService;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraService;
import com.fateczl.muttley.palestra.StatusPalestra;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.participacao.ParticipacaoService;
import com.fateczl.muttley.xp.XpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

// controlador REST que expõe endpoints para inscrição, atualização de status e cancelamento com auditoria
@RestController
@RequestMapping("/api/inscricoes")
public class InscricaoApiController {

    private final InscricaoService service;
    private final AuditoriaService auditoriaService;
    private final PalestraService palestraService;
    private final CertificadoService certificadoService;
    private final CertificadoPdfService certificadoPdfService;
    private final XpService xpService;
    private final ParticipacaoService participacaoService;
    private final EmailService emailService;

    public InscricaoApiController(InscricaoService service,
                                  AuditoriaService auditoriaService,
                                  PalestraService palestraService,
                                  CertificadoService certificadoService,
                                  CertificadoPdfService certificadoPdfService,
                                  XpService xpService,
                                  ParticipacaoService participacaoService,
                                  EmailService emailService) {
        this.service = service;
        this.auditoriaService = auditoriaService;
        this.palestraService = palestraService;
        this.certificadoService = certificadoService;
        this.certificadoPdfService = certificadoPdfService;
        this.xpService = xpService;
        this.participacaoService = participacaoService;
        this.emailService = emailService;
    }

    // lista todas as inscrições cadastradas
    @GetMapping
    public ResponseEntity<List<InscricaoListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream()
                .map(i -> new InscricaoListagem(i.getId(),
                        i.getParticipante() != null ? i.getParticipante().getNome() : null,
                        i.getPalestra() != null ? i.getPalestra().getTitulo() : null,
                        i.getDataInscricao(), i.getDataCheckin(), i.getStatus()))
                .toList());
    }

    @GetMapping("/palestra/{palestraId}")
    public ResponseEntity<List<InscricaoPresencaResponse>> listarPorPalestra(@PathVariable Long palestraId) {
        return ResponseEntity.ok(service.listarPorPalestra(palestraId).stream()
                .map(this::toPresencaResponse)
                .toList());
    }

    // inscreve um participante em uma palestra e registra a ação no log de auditoria
    @PostMapping
    public ResponseEntity<InscricaoDTO> inscrever(@RequestBody @Valid InscricaoDTO dto,
                                                   HttpServletRequest request) {
        Inscricao i = service.inscrever(dto);
        auditoriaService.registrar(AcaoAuditoria.INSCRICAO_CRIADA, "Inscricao", i.getId(),
                "Inscrição criada: participante " + dto.participanteId() + " na palestra " + dto.palestraId(),
                ator(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new InscricaoDTO(i.getId(), i.getParticipante().getId(),
                        i.getPalestra().getId(), i.getDataInscricao(),
                        i.getDataCheckin(), i.getStatus(), i.getQrCodeToken()));
    }

    // atualiza parcialmente o status de uma inscrição e registra a mudança na auditoria
    @PatchMapping("/{id}/status")
    public ResponseEntity<InscricaoStatusResponse> atualizarStatus(@PathVariable Long id,
                                                                    @RequestBody InscricaoStatusRequest body,
                                                                    HttpServletRequest request) {
        StatusInscricao status = StatusInscricao.valueOf(body.status());
        Inscricao inscricao = service.atualizarStatus(id, status);
        auditoriaService.registrar(AcaoAuditoria.STATUS_ATUALIZADO, "Inscricao", id,
                "Status da inscrição " + id + " alterado para " + status.name(),
                ator(request));
        return ResponseEntity.ok(new InscricaoStatusResponse(inscricao.getStatus(), inscricao.getDataCheckin()));
    }

    @PostMapping("/palestra/{palestraId}/confirmar-presencas")
    public ResponseEntity<ConfirmacaoPresencaResponse> confirmarPresencas(@PathVariable Long palestraId,
                                                                           @RequestBody ConfirmacaoPresencaRequest body,
                                                                           HttpServletRequest request) {
        Palestra palestra = palestraService.findByIdComPalestrantes(palestraId)
                .orElseThrow(() -> new IllegalArgumentException("Palestra não encontrada"));
        String realizadoPor = ator(request);
        Set<Long> inscricaoIds = body.inscricaoIds() == null
                ? Set.of()
                : body.inscricaoIds().stream().collect(Collectors.toSet());

        int countParticipantes = 0;
        int countPalestrantes = 0;
        List<CheckinConfirmadoResponse> checkins = new ArrayList<>();

        List<Inscricao> selecionadas = service.listarPorPalestra(palestraId).stream()
                .filter(i -> inscricaoIds.contains(i.getId()))
                .toList();

        for (Inscricao inscricao : selecionadas) {
            inscricao = service.atualizarStatus(inscricao.getId(), StatusInscricao.CONFIRMADA);
            participacaoService.registrarOuAtualizar(inscricao.getParticipante(), palestra);

            Certificado cert = certificadoService.emitirOuBuscar(inscricao.getParticipante().getId(), palestraId);
            auditoriaService.registrar(AcaoAuditoria.CERTIFICADO_EMITIDO, "Certificado", cert.getId(),
                    "Certificado emitido para " + inscricao.getParticipante().getNome(), realizadoPor);

            xpService.registrarParaPalestra(inscricao.getParticipante().getId(), palestra);
            enviarCertificadoPorEmail(cert.getId(), request);
            checkins.add(new CheckinConfirmadoResponse(
                    inscricao.getId(),
                    inscricao.getParticipante().getId(),
                    inscricao.getParticipante().getNome(),
                    inscricao.getDataCheckin()
            ));
            countParticipantes++;
        }

        List<Palestrante> palestrantes = palestra.getPalestrantes();
        if (palestrantes != null) {
            for (Palestrante palestrante : palestrantes) {
                Certificado certPalestrante = certificadoService.emitirOuBuscarPalestrante(palestrante.getId(), palestraId);
                auditoriaService.registrar(AcaoAuditoria.CERTIFICADO_EMITIDO, "Certificado", certPalestrante.getId(),
                        "Certificado de apresentação emitido para " + palestrante.getNome(), realizadoPor);

                enviarCertificadoPorEmail(certPalestrante.getId(), request);
                countPalestrantes++;
            }
        }

        palestraService.atualizarStatus(palestraId, StatusPalestra.CERTIFICADOS_EMITIDOS);

        return ResponseEntity.ok(new ConfirmacaoPresencaResponse(
                countParticipantes,
                countPalestrantes,
                checkins,
                "Presenças confirmadas. Certificados emitidos e e-mails enviados."
        ));
    }

    // cancela a inscrição e registra a ação no log de auditoria antes de remover
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id, HttpServletRequest request) {
        auditoriaService.registrar(AcaoAuditoria.INSCRICAO_CANCELADA, "Inscricao", id,
                "Inscrição " + id + " cancelada", ator(request));
        service.cancelar(id);
        return ResponseEntity.noContent().build();
    }

    // extrai o identificador do autor da ação a partir da chave de API da requisição
    private String ator(HttpServletRequest request) {
        String key = request.getHeader("X-API-KEY");
        return key != null ? "api:" + key : "sistema";
    }

    private void enviarCertificadoPorEmail(Long certificadoId, HttpServletRequest request) {
        certificadoService.buscarPorIdComDetalhes(certificadoId).ifPresent(certCompleto -> {
            byte[] pdf = certificadoPdfService.gerar(certCompleto, baseUrl(request));
            emailService.enviarCertificado(certCompleto, pdf);
        });
    }

    private String baseUrl(HttpServletRequest request) {
        int port = request.getServerPort();
        return request.getScheme() + "://" + request.getServerName()
                + (port != 80 && port != 443 ? ":" + port : "");
    }

    private InscricaoPresencaResponse toPresencaResponse(Inscricao inscricao) {
        return new InscricaoPresencaResponse(
                inscricao.getId(),
                inscricao.getParticipante() != null ? inscricao.getParticipante().getId() : null,
                inscricao.getParticipante() != null ? inscricao.getParticipante().getNome() : null,
                inscricao.getParticipante() != null ? inscricao.getParticipante().getCpf() : null,
                inscricao.getParticipante() != null ? inscricao.getParticipante().getEmail() : null,
                inscricao.getParticipante() != null ? inscricao.getParticipante().getEmail2() : null,
                inscricao.getDataInscricao(),
                inscricao.getDataCheckin(),
                inscricao.getStatus()
        );
    }

    public record ConfirmacaoPresencaRequest(List<Long> inscricaoIds) {}
    public record ConfirmacaoPresencaResponse(int certificadosParticipantes, int certificadosPalestrantes,
                                              List<CheckinConfirmadoResponse> checkins, String mensagem) {}
    public record CheckinConfirmadoResponse(Long inscricaoId, Long participanteId, String participanteNome,
                                            java.time.LocalDateTime dataCheckin) {}
    public record InscricaoStatusRequest(String status) {}
    public record InscricaoStatusResponse(StatusInscricao status, java.time.LocalDateTime dataCheckin) {}
    public record InscricaoPresencaResponse(Long id, Long participanteId, String participanteNome, String cpf,
                                            String email, String email2, java.time.LocalDateTime dataInscricao,
                                            java.time.LocalDateTime dataCheckin, StatusInscricao status) {}
}
