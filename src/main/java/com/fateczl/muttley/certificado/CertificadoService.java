package com.fateczl.muttley.certificado;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.palestrante.PalestranteRepository;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CertificadoService {

    private final CertificadoRepository repository;
    private final ParticipanteRepository participanteRepository;
    private final PalestraRepository palestraRepository;
    private final PalestranteRepository palestranteRepository;

    public CertificadoService(CertificadoRepository repository,
                               ParticipanteRepository participanteRepository,
                               PalestraRepository palestraRepository,
                               PalestranteRepository palestranteRepository) {
        this.repository = repository;
        this.participanteRepository = participanteRepository;
        this.palestraRepository = palestraRepository;
        this.palestranteRepository = palestranteRepository;
    }

    @SuppressWarnings("null")
    public Certificado emitir(CertificadoDTO dto) {
        Participante participante = participanteRepository.findById(dto.participanteId())
                .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));
        Palestra palestra = palestraRepository.findById(dto.palestraId())
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));

        if (repository.existsByParticipanteIdAndPalestraId(dto.participanteId(), dto.palestraId())) {
            throw new IllegalStateException("Certificado já emitido para este participante nesta palestra");
        }

        Certificado certificado = new Certificado();
        certificado.setParticipante(participante);
        certificado.setPalestra(palestra);
        certificado.setDataEmissao(LocalDateTime.now());
        certificado.setCargaHoraria(
                dto.cargaHoraria() != null ? dto.cargaHoraria()
                : (palestra.getCargaHoraria() != null ? palestra.getCargaHoraria() : 1f));
        return repository.save(certificado);
    }

    @Transactional
    public List<Certificado> listarTodos() {
        List<Certificado> lista = repository.findAll();
        lista.forEach(c -> {
            if (c.getParticipante() != null) c.getParticipante().getNome();
            if (c.getPalestra() != null) c.getPalestra().getTitulo();
        });
        return lista;
    }

    public Optional<Certificado> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public List<Certificado> listarPorParticipante(Long participanteId) {
        return repository.findByParticipanteId(participanteId);
    }

    public Certificado emitirOuBuscar(Long participanteId, Long palestraId) {
        return repository.findByParticipanteIdAndPalestraId(participanteId, palestraId)
                .orElseGet(() -> emitir(new CertificadoDTO(null, participanteId, palestraId, null, null, null)));
    }

    public Certificado emitirOuBuscarPalestrante(Long palestranteId, Long palestraId) {
        return repository.findByPalestranteIdAndPalestraId(palestranteId, palestraId)
                .orElseGet(() -> {
                    Palestrante palestrante = palestranteRepository.findById(palestranteId)
                            .orElseThrow(() -> new EntityNotFoundException("Palestrante não encontrado"));
                    Palestra palestra = palestraRepository.findById(palestraId)
                            .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));

                    Certificado cert = new Certificado();
                    cert.setPalestrante(palestrante);
                    cert.setPalestra(palestra);
                    cert.setTipo(TipoCertificado.APRESENTACAO);
                    cert.setCargaHoraria(palestra.getCargaHoraria() != null ? palestra.getCargaHoraria() : 1f);
                    return repository.save(cert);
                });
    }

    @Transactional
    public Optional<Certificado> buscarPorIdComDetalhes(Long id) {
        return repository.findById(id).map(c -> {
            if (c.getPalestra() != null) {
                c.getPalestra().getPalestrantes().size();
                c.getPalestra().getCompetencias().size();
            }
            return c;
        });
    }

    @Transactional
    public Optional<Certificado> buscarPorCodigoComDetalhes(String codigo) {
        return repository.findByCodigoValidacao(codigo).map(c -> {
            if (c.getPalestra() != null) {
                c.getPalestra().getPalestrantes().size();
                c.getPalestra().getCompetencias().size();
            }
            return c;
        });
    }

    public Optional<Certificado> buscarPorCodigo(String codigo) {
        return repository.findByCodigoValidacao(codigo);
    }

    @SuppressWarnings("null")
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
