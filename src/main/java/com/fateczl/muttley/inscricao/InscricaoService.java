package com.fateczl.muttley.inscricao;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    @SuppressWarnings("null")
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

    public Inscricao atualizarStatus(Long id, StatusInscricao novoStatus) {
        Inscricao inscricao = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inscrição não encontrada"));
        inscricao.setStatus(novoStatus);
        return repository.save(inscricao);
    }

    public Inscricao confirmarPresenca(Long participanteId, Long palestraId) {
        return repository.findByParticipanteIdAndPalestraId(participanteId, palestraId)
                .map(i -> {
                    i.setStatus(StatusInscricao.CONFIRMADA);
                    return repository.save(i);
                })
                .orElseGet(() -> {
                    Participante p = participanteRepository.findById(participanteId)
                            .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));
                    Palestra palestra = palestraRepository.findById(palestraId)
                            .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
                    Inscricao nova = new Inscricao();
                    nova.setParticipante(p);
                    nova.setPalestra(palestra);
                    nova.setStatus(StatusInscricao.CONFIRMADA);
                    return repository.save(nova);
                });
    }

    public List<Inscricao> listarPorPalestra(Long palestraId) {
        return repository.findByPalestraId(palestraId);
    }

    public Inscricao marcarPresente(Long id) {
        return atualizarStatus(id, StatusInscricao.CONFIRMADA);
    }

    public Inscricao marcarAusente(Long id) {
        return atualizarStatus(id, StatusInscricao.CANCELADA);
    }

    @Transactional
    public List<Inscricao> listarTodos() {
        List<Inscricao> lista = repository.findAll();
        lista.forEach(i -> {
            if (i.getParticipante() != null) i.getParticipante().getNome();
            if (i.getPalestra() != null) i.getPalestra().getTitulo();
        });
        return lista;
    }

    public Optional<Inscricao> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Optional<Inscricao> buscarPorToken(String token) {
        return repository.findByQrCodeToken(token);
    }

    @SuppressWarnings("null")
    public void cancelar(Long id) {
        Inscricao inscricao = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inscrição não encontrada"));
        inscricao.setStatus(StatusInscricao.CANCELADA);
        repository.save(inscricao);
    }
}
