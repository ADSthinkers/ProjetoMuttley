package com.fateczl.muttley.certificado;

import com.fateczl.muttley.apresentacao.Apresentacao;
import com.fateczl.muttley.apresentacao.ApresentacaoRepository;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.participacao.Participacao;
import com.fateczl.muttley.participacao.ParticipacaoRepository;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

// serviço responsável pela emissão, consulta e remoção de certificados
@Service
public class CertificadoService {

    private final CertificadoRepository repository;
    private final CertificadoParticipacaoRepository certificadoParticipacaoRepository;
    private final CertificadoApresentacaoRepository certificadoApresentacaoRepository;
    private final ParticipanteRepository participanteRepository;
    private final PalestraRepository palestraRepository;
    private final ParticipacaoRepository participacaoRepository;
    private final ApresentacaoRepository apresentacaoRepository;

    public CertificadoService(CertificadoRepository repository,
                               CertificadoParticipacaoRepository certificadoParticipacaoRepository,
                               CertificadoApresentacaoRepository certificadoApresentacaoRepository,
                               ParticipanteRepository participanteRepository,
                               PalestraRepository palestraRepository,
                               ParticipacaoRepository participacaoRepository,
                               ApresentacaoRepository apresentacaoRepository) {
        this.repository = repository;
        this.certificadoParticipacaoRepository = certificadoParticipacaoRepository;
        this.certificadoApresentacaoRepository = certificadoApresentacaoRepository;
        this.participanteRepository = participanteRepository;
        this.palestraRepository = palestraRepository;
        this.participacaoRepository = participacaoRepository;
        this.apresentacaoRepository = apresentacaoRepository;
    }

    // emite um novo certificado de participacao a partir da participacao do participante na palestra
    public Certificado emitir(CertificadoDTO dto) {
        if (certificadoParticipacaoRepository
                .existsByParticipacaoParticipanteIdAndParticipacaoPalestraId(dto.participanteId(), dto.palestraId())) {
            throw new IllegalStateException("Certificado já emitido para este participante nesta palestra");
        }

        Participacao participacao = garantirParticipacao(dto.participanteId(), dto.palestraId());
        Palestra palestra = participacao.getPalestra();

        CertificadoParticipacao certificado = new CertificadoParticipacao(participacao);
        certificado.setDataEmissao(LocalDateTime.now());
        certificado.setCargaHoraria(
                dto.cargaHoraria() != null ? dto.cargaHoraria()
                : (palestra.getCargaHoraria() != null ? palestra.getCargaHoraria() : 1f));
        return certificadoParticipacaoRepository.save(certificado);
    }

    // lista todos os certificados com carregamento forçado das associações
    @Transactional
    public List<Certificado> listarTodos() {
        List<Certificado> lista = repository.findAll();
        lista.forEach(this::carregarDetalhes);
        return lista;
    }

    // busca um certificado pelo seu identificador
    public Optional<Certificado> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // lista todos os certificados emitidos para um participante específico
    public List<Certificado> listarPorParticipante(Long participanteId) {
        return new ArrayList<>(certificadoParticipacaoRepository.findByParticipacaoParticipanteId(participanteId));
    }

    // retorna o certificado existente atualizando a carga horária, ou emite um novo
    public Certificado emitirOuBuscar(Long participanteId, Long palestraId) {
        Participacao participacao = garantirParticipacao(participanteId, palestraId);
        Palestra palestra = participacao.getPalestra();
        float cargaHoraria = cargaHoraria(palestra);
        return certificadoParticipacaoRepository.findByParticipacaoParticipanteIdAndParticipacaoPalestraId(participanteId, palestraId)
                .map(cert -> { cert.setCargaHoraria(cargaHoraria); return certificadoParticipacaoRepository.save(cert); })
                .orElseGet(() -> criarCertificadoParticipacao(participacao, cargaHoraria));
    }

    // retorna o certificado de apresentação do palestrante atualizando a carga horária, ou cria um novo
    public Certificado emitirOuBuscarPalestrante(Long palestranteId, Long palestraId) {
        Apresentacao apresentacao = apresentacaoRepository.findByPalestranteIdAndPalestraId(palestranteId, palestraId)
                .orElseThrow(() -> new EntityNotFoundException("Apresentação não encontrada para este palestrante e palestra"));
        Palestra palestra = apresentacao.getPalestra();
        float cargaHoraria = cargaHoraria(palestra);
        return certificadoApresentacaoRepository.findByApresentacaoPalestranteIdAndApresentacaoPalestraId(palestranteId, palestraId)
                .map(cert -> { cert.setCargaHoraria(cargaHoraria); return certificadoApresentacaoRepository.save(cert); })
                .orElseGet(() -> {
                    CertificadoApresentacao cert = new CertificadoApresentacao(apresentacao);
                    cert.setCargaHoraria(cargaHoraria);
                    return certificadoApresentacaoRepository.save(cert);
                });
    }

    // busca o certificado pelo id carregando palestrantes e competências da palestra associada
    @Transactional
    public Optional<Certificado> buscarPorIdComDetalhes(Long id) {
        return repository.findById(id).map(c -> {
            carregarDetalhes(c);
            return c;
        });
    }

    // busca o certificado pelo código de validação carregando os dados completos da palestra
    @Transactional
    public Optional<Certificado> buscarPorCodigoComDetalhes(String codigo) {
        return repository.findByCodigoValidacao(codigo).map(c -> {
            carregarDetalhes(c);
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

    public List<Certificado> listarPorPalestra(Long palestraId) {
        List<Certificado> certificados = new ArrayList<>();
        certificados.addAll(certificadoParticipacaoRepository.findByParticipacaoPalestraId(palestraId));
        certificados.addAll(certificadoApresentacaoRepository.findByApresentacaoPalestraId(palestraId));
        return certificados;
    }

    public Certificado salvar(Certificado certificado) {
        return repository.save(certificado);
    }

    private Participacao garantirParticipacao(Long participanteId, Long palestraId) {
        return participacaoRepository.findByParticipanteIdAndPalestraId(participanteId, palestraId)
                .orElseGet(() -> criarParticipacao(participanteId, palestraId));
    }

    private CertificadoParticipacao criarCertificadoParticipacao(Participacao participacao, float cargaHoraria) {
        CertificadoParticipacao certificado = new CertificadoParticipacao(participacao);
        certificado.setDataEmissao(LocalDateTime.now());
        certificado.setCargaHoraria(cargaHoraria);
        return certificadoParticipacaoRepository.save(certificado);
    }

    private Participacao criarParticipacao(Long participanteId, Long palestraId) {
        Participante participante = participanteRepository.findById(participanteId)
                .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));
        Palestra palestra = palestraRepository.findById(palestraId)
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));

        Participacao participacao = new Participacao();
        participacao.setParticipante(participante);
        participacao.setPalestra(palestra);
        participacao.setHoras(cargaHoraria(palestra));
        return participacaoRepository.save(participacao);
    }

    private float cargaHoraria(Palestra palestra) {
        return palestra != null && palestra.getCargaHoraria() != null ? palestra.getCargaHoraria() : 1f;
    }

    private void carregarDetalhes(Certificado c) {
        if (c.getParticipante() != null) c.getParticipante().getNome();
        if (c.getPalestrante() != null) c.getPalestrante().getNome();
        if (c.getPalestra() != null) {
            c.getPalestra().getTitulo();
            c.getPalestra().getPalestrantes().size();
            c.getPalestra().getCompetencias().size();
            if (c.getPalestra().getEvento() != null && c.getPalestra().getEvento().getAssinantes() != null) {
                c.getPalestra().getEvento().getAssinantes().size();
            }
        }
    }
}
