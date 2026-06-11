package com.fateczl.muttley.inscricao;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// serviço responsável pelas operações de inscrição, confirmação de presença e controle de status
@Service
public class InscricaoService {

    private final InscricaoRepository repository;
    private final ParticipanteRepository participanteRepository;
    private final PalestraRepository palestraRepository;

    public InscricaoService(InscricaoRepository repository,
                             ParticipanteRepository participanteRepository,
                             PalestraRepository palestraRepository) {
        this.repository = repository;
        this.participanteRepository = participanteRepository;
        this.palestraRepository = palestraRepository;
    }

    // inscreve um participante em uma palestra impedindo inscrições duplicadas
     
    public Inscricao inscrever(InscricaoDTO dto) {
        Participante participante = participanteRepository.findById(dto.participanteId())
                .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));
        Palestra palestra = palestraRepository.findById(dto.palestraId())
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));

        if (repository.existsByParticipanteIdAndPalestraId(dto.participanteId(), dto.palestraId())) {
            throw new IllegalStateException("Participante já inscrito nesta palestra");
        }

        Inscricao inscricao = new Inscricao();
        inscricao.setParticipante(participante);
        inscricao.setPalestra(palestra);
        return repository.save(inscricao);
    }

    // altera o status de uma inscrição pelo seu identificador
    public Inscricao atualizarStatus(Long id, StatusInscricao novoStatus) {
        Inscricao inscricao = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inscrição não encontrada"));
        aplicarStatus(inscricao, novoStatus);
        return repository.save(inscricao);
    }

    // confirma a presença do participante na palestra somente se a inscrição já existir
    public Inscricao confirmarPresenca(Long participanteId, Long palestraId) {
        return repository.findByParticipanteIdAndPalestraId(participanteId, palestraId)
                .map(i -> {
                    aplicarStatus(i, StatusInscricao.CONFIRMADA);
                    return repository.save(i);
                })
                .orElseThrow(() -> new EntityNotFoundException("Inscrição não encontrada"));
    }

    // lista todas as inscrições de uma palestra específica
    public List<Inscricao> listarPorPalestra(Long palestraId) {
        return repository.findByPalestraId(palestraId);
    }

    public Optional<Inscricao> buscarPorParticipanteEPalestra(Long participanteId, Long palestraId) {
        return repository.findByParticipanteIdAndPalestraId(participanteId, palestraId);
    }

    public long contarCheckInsAtivos(Long palestraId) {
        return repository.countByPalestraIdAndStatusNot(palestraId, StatusInscricao.CANCELADA);
    }

    public boolean temVagaDisponivel(Long palestraId, Integer vagas) {
        return vagas == null || vagas <= 0 || contarCheckInsAtivos(palestraId) < vagas;
    }

    // atualiza o status da inscrição para CONFIRMADA marcando presença do participante
    public Inscricao marcarPresente(Long id) {
        return atualizarStatus(id, StatusInscricao.CONFIRMADA);
    }

    // atualiza o status da inscrição para CANCELADA marcando ausência do participante
    public Inscricao marcarAusente(Long id) {
        return atualizarStatus(id, StatusInscricao.CANCELADA);
    }

    // lista todas as inscrições com carregamento forçado das associações de participante e palestra
    @Transactional
    public List<Inscricao> listarTodos() {
        List<Inscricao> lista = repository.findAll();
        lista.forEach(i -> {
            if (i.getParticipante() != null) i.getParticipante().getNome();
            if (i.getPalestra() != null) i.getPalestra().getTitulo();
        });
        return lista;
    }

    // busca uma inscrição pelo seu identificador
    public Optional<Inscricao> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // busca uma inscrição pelo token QR Code gerado no momento da inscrição
    public Optional<Inscricao> buscarPorToken(String token) {
        return repository.findByQrCodeToken(token);
    }

    // cancela a inscrição alterando seu status para CANCELADA
     
    public void cancelar(Long id) {
        Inscricao inscricao = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inscrição não encontrada"));
        aplicarStatus(inscricao, StatusInscricao.CANCELADA);
        repository.save(inscricao);
    }

    private void aplicarStatus(Inscricao inscricao, StatusInscricao status) {
        inscricao.setStatus(status);
        if (status == StatusInscricao.CONFIRMADA && inscricao.getDataCheckin() == null) {
            inscricao.setDataCheckin(LocalDateTime.now());
        }
        if (status == StatusInscricao.CANCELADA) {
            inscricao.setDataCheckin(null);
        }
    }
}
