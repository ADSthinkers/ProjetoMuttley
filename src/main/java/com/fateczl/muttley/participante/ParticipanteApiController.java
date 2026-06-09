package com.fateczl.muttley.participante;

import com.fateczl.muttley.certificado.CertificadoListagem;
import com.fateczl.muttley.certificado.CertificadoService;
import com.fateczl.muttley.competencia.CompetenciaDTO;
import com.fateczl.muttley.medalha.MedalhaListagem;
import com.fateczl.muttley.medalha.MedalhaService;
import com.fateczl.muttley.palestra.ListagemPalestra;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.participacao.ParticipacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/participantes")
public class ParticipanteApiController {

    private final ParticipanteService service;
    private final ParticipanteMapper mapper;
    private final ParticipacaoService participacaoService;
    private final MedalhaService medalhaService;
    private final CertificadoService certificadoService;

    public ParticipanteApiController(ParticipanteService service, ParticipanteMapper mapper,
                                     ParticipacaoService participacaoService,
                                     MedalhaService medalhaService,
                                     CertificadoService certificadoService) {
        this.service = service;
        this.mapper = mapper;
        this.participacaoService = participacaoService;
        this.medalhaService = medalhaService;
        this.certificadoService = certificadoService;
    }

    @GetMapping
    public ResponseEntity<List<ParticipanteListagem>> listar() {
        return ResponseEntity.ok(service.listarTodos().stream().map(mapper::toListagemDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParticipanteDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id).map(mapper::toAtualizacaoDto).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ParticipanteDTO> criar(@RequestBody @Valid ParticipanteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapper.toAtualizacaoDto(service.salvarOuAtualizar(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParticipanteDTO> atualizar(@PathVariable Long id, @RequestBody @Valid ParticipanteDTO dto) {
        ParticipanteDTO dtoComId = new ParticipanteDTO(id, dto.nome(), dto.ra(), dto.cpf(),
                dto.email(), dto.email2(), dto.telefone(), dto.curso());
        return ResponseEntity.ok(mapper.toAtualizacaoDto(service.salvarOuAtualizar(dtoComId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/palestras")
    public ResponseEntity<List<ListagemPalestra>> palestrasDoParticipante(@PathVariable Long id) {
        if (service.buscarPorId(id).isEmpty()) return ResponseEntity.notFound().build();
        List<ListagemPalestra> palestras = participacaoService.palestrasDoParticipante(id).stream()
                .map(p -> new ListagemPalestra(
                        p.getId(), p.getTitulo(), p.getDescricao(), p.getCompetencias(),
                        p.getPalestrantes() != null
                                ? p.getPalestrantes().stream().map(Palestrante::getNome).toList()
                                : List.of(),
                        p.getLocal() != null ? p.getLocal().getNome() : null,
                        p.getVagas(),
                        p.getInicio(), p.getFim(),
                        p.getStatus(),
                        p.getPatrocinador() != null ? p.getPatrocinador().getNomeExibicao() : null))
                .toList();
        return ResponseEntity.ok(palestras);
    }

    @GetMapping("/{id}/competencias")
    public ResponseEntity<List<CompetenciaDTO>> competenciasDoParticipante(@PathVariable Long id) {
        if (service.buscarPorId(id).isEmpty()) return ResponseEntity.notFound().build();
        List<CompetenciaDTO> competencias = participacaoService.competenciasDoParticipante(id).stream()
                .map(c -> new CompetenciaDTO(c.getId(), c.getNome(), c.getTipo(), c.getHorasParaEvoluir()))
                .toList();
        return ResponseEntity.ok(competencias);
    }

    @GetMapping("/{id}/medalhas")
    public ResponseEntity<List<MedalhaListagem>> medalhasDoParticipante(@PathVariable Long id) {
        if (service.buscarPorId(id).isEmpty()) return ResponseEntity.notFound().build();
        List<MedalhaListagem> medalhas = medalhaService.listarPorParticipante(id).stream()
                .map(m -> new MedalhaListagem(
                        m.getId(), m.getTipo(), m.getNome(),
                        m.getParticipante() != null ? m.getParticipante().getNome() : null,
                        m.getPalestra() != null ? m.getPalestra().getTitulo() : null,
                        m.getDataConquista(),
                        m.getCompetencias() != null
                                ? m.getCompetencias().stream().map(c -> c.getNome()).toList()
                                : List.of()))
                .toList();
        return ResponseEntity.ok(medalhas);
    }

    @GetMapping("/{id}/certificados")
    public ResponseEntity<List<CertificadoListagem>> certificadosDoParticipante(@PathVariable Long id) {
        if (service.buscarPorId(id).isEmpty()) return ResponseEntity.notFound().build();
        List<CertificadoListagem> certificados = certificadoService.listarPorParticipante(id).stream()
                .map(c -> new CertificadoListagem(
                        c.getId(),
                        c.getParticipante() != null ? c.getParticipante().getNome() : null,
                        c.getPalestra() != null ? c.getPalestra().getTitulo() : null,
                        c.getDataEmissao(), c.getCargaHoraria(), c.getCodigoValidacao()))
                .toList();
        return ResponseEntity.ok(certificados);
    }

    @GetMapping("/{id}/horas")
    public ResponseEntity<Map<String, Float>> horasDoParticipante(@PathVariable Long id) {
        if (service.buscarPorId(id).isEmpty()) return ResponseEntity.notFound().build();
        Float total = participacaoService.totalHorasDoParticipante(id);
        return ResponseEntity.ok(Map.of("totalHoras", total));
    }
}
