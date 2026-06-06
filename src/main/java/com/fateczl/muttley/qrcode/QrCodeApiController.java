package com.fateczl.muttley.qrcode;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import com.fateczl.muttley.config.PublicRoute;
import com.fateczl.muttley.inscricao.Inscricao;
import com.fateczl.muttley.inscricao.InscricaoDTO;
import com.fateczl.muttley.inscricao.InscricaoService;
import com.fateczl.muttley.inscricao.StatusInscricao;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraService;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteDTO;
import com.fateczl.muttley.participante.ParticipanteService;
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

    public QrCodeApiController(PalestraService palestraService,
                               ParticipanteService participanteService,
                               InscricaoService inscricaoService,
                               AuditoriaService auditoriaService) {
        this.palestraService = palestraService;
        this.participanteService = participanteService;
        this.inscricaoService = inscricaoService;
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
            if (!inscricaoService.temVagaDisponivel(palestra.getId(), palestra.getVagas())) {
                return ResponseEntity.status(409).body(new QrErroResponse("A capacidade máxima desta palestra já foi atingida."));
            }
            return ResponseEntity.ok(new QrIdentificacaoResponse("CADASTRO_NECESSARIO", cpf, email, null));
        }

        return registrarParticipacao(palestra, participante, false);
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
        if (participante == null && !inscricaoService.temVagaDisponivel(palestra.getId(), palestra.getVagas())) {
            return ResponseEntity.status(409).body(new QrErroResponse("A capacidade máxima desta palestra já foi atingida."));
        }

        if (participante == null) {
            participante = participanteService.salvarOuAtualizar(
                    new ParticipanteDTO(null, nome, null, cpf, email, null, null, null)
            );
        }

        return registrarParticipacao(palestra, participante, true);
    }

    private ResponseEntity<?> registrarParticipacao(Palestra palestra, Participante participante, boolean novoCadastro) {
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
                    StatusInscricao.PENDENTE,
                    null
            ));
        }

        auditoriaService.registrar(AcaoAuditoria.CHECK_IN, "Palestra", palestra.getId(),
                (novoCadastro ? "Check-in (novo cadastro) de " : "Check-in de ") + participante.getNome()
                        + " na palestra: " + palestra.getTitulo(),
                participante.getNome());

        return ResponseEntity.ok(new QrSucessoResponse(
                inscricao.getStatus() == StatusInscricao.CONFIRMADA ? "JA_CONFIRMADO" : "AGUARDANDO_CONFIRMACAO",
                participante.getNome(),
                palestra.getTitulo(),
                "Check-in registrado. Aguarde a confirmação do palestrante ou administrador para receber seu certificado por e-mail."
        ));
    }

    private String normalizar(String value) {
        return value == null ? "" : value.trim();
    }

    public record QrPalestraResponse(Long id, String titulo, String descricao, LocalDateTime inicio, LocalDateTime fim) {}
    public record QrIdentificacaoRequest(String cpf, String email) {}
    public record QrCadastroRequest(String nome, String cpf, String email) {}
    public record QrIdentificacaoResponse(String status, String cpf, String email, String mensagem) {}
    public record QrSucessoResponse(String status, String nomeParticipante, String palestraTitulo, String mensagem) {}
    public record QrErroResponse(String erro) {}
}
