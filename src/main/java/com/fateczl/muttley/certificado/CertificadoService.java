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

// serviço responsável pela emissão, consulta e remoção de certificados
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

    // emite um novo certificado para o participante na palestra informada, impedindo duplicatas
     
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

    // lista todos os certificados com carregamento forçado das associações
    @Transactional
    public List<Certificado> listarTodos() {
        List<Certificado> lista = repository.findAll();
        lista.forEach(c -> {
            if (c.getParticipante() != null) c.getParticipante().getNome();
            if (c.getPalestra() != null) c.getPalestra().getTitulo();
        });
        return lista;
    }

    // busca um certificado pelo seu identificador
    public Optional<Certificado> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // lista todos os certificados emitidos para um participante específico
    public List<Certificado> listarPorParticipante(Long participanteId) {
        return repository.findByParticipanteId(participanteId);
    }

    // retorna o certificado existente atualizando a carga horária, ou emite um novo
    public Certificado emitirOuBuscar(Long participanteId, Long palestraId) {
        Palestra palestra = palestraRepository.findById(palestraId)
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
        float cargaHoraria = palestra.getCargaHoraria() != null ? palestra.getCargaHoraria() : 1f;
        return repository.findByParticipanteIdAndPalestraId(participanteId, palestraId)
                .map(cert -> { cert.setCargaHoraria(cargaHoraria); return repository.save(cert); })
                .orElseGet(() -> emitir(new CertificadoDTO(null, participanteId, palestraId, null, cargaHoraria, null)));
    }

    // retorna o certificado de apresentação do palestrante atualizando a carga horária, ou cria um novo
    public Certificado emitirOuBuscarPalestrante(Long palestranteId, Long palestraId) {
        Palestra palestra = palestraRepository.findById(palestraId)
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
        float cargaHoraria = palestra.getCargaHoraria() != null ? palestra.getCargaHoraria() : 1f;
        return repository.findByPalestranteIdAndPalestraId(palestranteId, palestraId)
                .map(cert -> { cert.setCargaHoraria(cargaHoraria); return repository.save(cert); })
                .orElseGet(() -> {
                    Palestrante palestrante = palestranteRepository.findById(palestranteId)
                            .orElseThrow(() -> new EntityNotFoundException("Palestrante não encontrado"));
                    Certificado cert = new Certificado();
                    cert.setPalestrante(palestrante);
                    cert.setPalestra(palestra);
                    cert.setTipo(TipoCertificado.APRESENTACAO);
                    cert.setCargaHoraria(cargaHoraria);
                    return repository.save(cert);
                });
    }

    // busca o certificado pelo id carregando palestrantes e competências da palestra associada
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

    // busca o certificado pelo código de validação carregando os dados completos da palestra
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

    // busca um certificado pelo seu código único de validação
    public Optional<Certificado> buscarPorCodigo(String codigo) {
        return repository.findByCodigoValidacao(codigo);
    }

    // remove um certificado pelo seu identificador
     
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
