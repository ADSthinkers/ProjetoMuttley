package com.fateczl.muttley.qrcode;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import com.fateczl.muttley.certificado.Certificado;
import com.fateczl.muttley.certificado.CertificadoService;
import com.fateczl.muttley.config.PublicRoute;
import com.fateczl.muttley.medalha.MedalhaService;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraService;
import com.fateczl.muttley.participacao.ParticipacaoDTO;
import com.fateczl.muttley.participacao.ParticipacaoRepository;
import com.fateczl.muttley.participacao.ParticipacaoService;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteDTO;
import com.fateczl.muttley.participante.ParticipanteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/qrcode")
public class QrCodeApiController {

    private final PalestraService palestraService;
    private final ParticipanteService participanteService;
    private final ParticipacaoService participacaoService;
    private final ParticipacaoRepository participacaoRepository;
    private final CertificadoService certificadoService;
    private final MedalhaService medalhaService;
    private final AuditoriaService auditoriaService;

    public QrCodeApiController(PalestraService palestraService,
                               ParticipanteService participanteService,
                               ParticipacaoService participacaoService,
                               ParticipacaoRepository participacaoRepository,
                               CertificadoService certificadoService,
                               MedalhaService medalhaService,
                               AuditoriaService auditoriaService) {
        this.palestraService = palestraService;
        this.participanteService = participanteService;
        this.participacaoService = participacaoService;
        this.participacaoRepository = participacaoRepository;
        this.certificadoService = certificadoService;
        this.medalhaService = medalhaService;
        this.auditoriaService = auditoriaService;
    }

    @PublicRoute
    @GetMapping("/{token}")
    public ResponseEntity<?> buscarPalestra(@PathVariable String token) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("QR Code inválido ou palestra não encontrada."));
        }

        return ResponseEntity.ok(new QrPalestraResponse(
                palestra.getId(),
                palestra.getTitulo(),
                palestra.getDescricao(),
                palestra.getInicio(),
                palestra.getFim()
        ));
    }

    @PublicRoute
    @PostMapping("/{token}/identificar")
    public ResponseEntity<?> identificar(@PathVariable String token, @RequestBody QrIdentificacaoRequest request) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("QR Code inválido."));
        }

        String cpf = normalizar(request.cpf());
        String email = normalizar(request.email());
        Participante participante = participanteService.buscarPorCpfEEmail(cpf, email).orElse(null);

        if (participante == null) {
            return ResponseEntity.ok(new QrIdentificacaoResponse("CADASTRO_NECESSARIO", cpf, email, null));
        }

        if (participacaoRepository.existsByParticipanteIdAndPalestraId(participante.getId(), palestra.getId())) {
            return ResponseEntity.ok(new QrIdentificacaoResponse(
                    "JA_REGISTRADO",
                    cpf,
                    email,
                    "Você já está registrado nesta palestra, " + participante.getNome() + "!"
            ));
        }

        return ResponseEntity.ok(registrarParticipacao(palestra, participante, false));
    }

    @PublicRoute
    @PostMapping("/{token}/cadastro")
    public ResponseEntity<?> cadastrar(@PathVariable String token, @RequestBody QrCadastroRequest request) {
        Palestra palestra = palestraService.findByQrCodeToken(token).orElse(null);
        if (palestra == null) {
            return ResponseEntity.status(404).body(new QrErroResponse("QR Code inválido."));
        }

        String nome = normalizar(request.nome());
        String cpf = normalizar(request.cpf());
        String email = normalizar(request.email());

        Participante participante = participanteService.buscarPorCpfEEmail(cpf, email).orElse(null);
        if (participante == null) {
            participante = participanteService.salvarOuAtualizar(
                    new ParticipanteDTO(null, nome, null, cpf, email, null, null, null)
            );
        }

        return ResponseEntity.ok(registrarParticipacao(palestra, participante, true));
    }

    private QrSucessoResponse registrarParticipacao(Palestra palestra, Participante participante, boolean novoCadastro) {
        if (!participacaoRepository.existsByParticipanteIdAndPalestraId(participante.getId(), palestra.getId())) {
            participacaoService.salvarOuAtualizar(
                    new ParticipacaoDTO(null, calcularHoras(palestra), participante.getId(), palestra.getId())
            );
        }

        auditoriaService.registrar(AcaoAuditoria.CHECK_IN, "Palestra", palestra.getId(),
                (novoCadastro ? "Check-in (novo cadastro) de " : "Check-in de ") + participante.getNome()
                        + " na palestra: " + palestra.getTitulo(),
                participante.getNome());

        Certificado certificado = certificadoService.emitirOuBuscar(participante.getId(), palestra.getId());
        auditoriaService.registrar(AcaoAuditoria.CERTIFICADO_EMITIDO, "Certificado", certificado.getId(),
                "Certificado emitido para " + participante.getNome() + " — " + palestra.getTitulo(),
                "sistema");

        medalhaService.concederSeNaoExistir(participante.getId(), palestra);
        auditoriaService.registrar(AcaoAuditoria.MEDALHA_CONCEDIDA, "Medalha", palestra.getId(),
                "Medalha de participação concedida a " + participante.getNome(),
                "sistema");

        return new QrSucessoResponse(
                "SUCESSO",
                participante.getNome(),
                palestra.getTitulo(),
                certificado.getCodigoValidacao(),
                certificado.getId()
        );
    }

    private float calcularHoras(Palestra palestra) {
        if (palestra.getInicio() == null || palestra.getFim() == null) return 1f;
        long horas = ChronoUnit.HOURS.between(palestra.getInicio(), palestra.getFim());
        return Math.max(1f, (float) horas);
    }

    private String normalizar(String value) {
        return value == null ? "" : value.trim();
    }

    public record QrPalestraResponse(Long id, String titulo, String descricao, LocalDateTime inicio, LocalDateTime fim) {}
    public record QrIdentificacaoRequest(String cpf, String email) {}
    public record QrCadastroRequest(String nome, String cpf, String email) {}
    public record QrIdentificacaoResponse(String status, String cpf, String email, String mensagem) {}
    public record QrSucessoResponse(String status, String nomeParticipante, String palestraTitulo, String codigoCertificado, Long certificadoId) {}
    public record QrErroResponse(String erro) {}
}
