package com.fateczl.muttley.medalha;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.competencia.CompetenciaRepository;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MedalhaService {

    private final MedalhaRepository repository;
    private final ParticipanteRepository participanteRepository;
    private final PalestraRepository palestraRepository;
    private final CompetenciaRepository competenciaRepository;

    public MedalhaService(MedalhaRepository repository,
                           ParticipanteRepository participanteRepository,
                           PalestraRepository palestraRepository,
                           CompetenciaRepository competenciaRepository) {
        this.repository = repository;
        this.participanteRepository = participanteRepository;
        this.palestraRepository = palestraRepository;
        this.competenciaRepository = competenciaRepository;
    }

    @SuppressWarnings("null")
    public Medalha salvarOuAtualizar(MedalhaDTO dto) {
        Participante participante = participanteRepository.findById(dto.participanteId())
                .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));
        Palestra palestra = palestraRepository.findById(dto.palestraId())
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
        List<Competencia> competencias = dto.competenciaIds() != null && !dto.competenciaIds().isEmpty()
                ? competenciaRepository.findAllById(dto.competenciaIds())
                : List.of();

        if (dto.id() != null) {
            Medalha existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Medalha não encontrada"));
            existente.setTipo(dto.tipo());
            existente.setNome(dto.nome());
            existente.setDescricao(dto.descricao());
            existente.setParticipante(participante);
            existente.setPalestra(palestra);
            existente.setCompetencias(competencias);
            if (dto.dataConquista() != null) existente.setDataConquista(dto.dataConquista());
            return repository.save(existente);
        } else {
            Medalha nova = new Medalha();
            nova.setTipo(dto.tipo());
            nova.setNome(dto.nome());
            nova.setDescricao(dto.descricao());
            nova.setParticipante(participante);
            nova.setPalestra(palestra);
            nova.setCompetencias(competencias);
            nova.setDataConquista(dto.dataConquista() != null ? dto.dataConquista() : LocalDate.now());
            return repository.save(nova);
        }
    }

    @Transactional
    public List<Medalha> listarTodos() {
        List<Medalha> medalhas = repository.findAll();
        medalhas.forEach(m -> {
            if (m.getParticipante() != null) m.getParticipante().getNome();
            if (m.getPalestra() != null) m.getPalestra().getTitulo();
            if (m.getCompetencias() != null) m.getCompetencias().size();
        });
        return medalhas;
    }

    public Optional<Medalha> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public List<Medalha> listarPorParticipante(Long participanteId) {
        List<Medalha> medalhas = repository.findByParticipanteId(participanteId);
        medalhas.forEach(m -> {
            if (m.getCompetencias() != null) m.getCompetencias().size();
        });
        return medalhas;
    }

    public void concederSeNaoExistir(Long participanteId, Long palestraId) {
        if (repository.existsByParticipanteIdAndPalestraId(participanteId, palestraId)) return;
        MedalhaDTO dto = new MedalhaDTO(null, TipoMedalha.PARTICIPACAO, null, null,
                participanteId, palestraId, null, null);
        salvarOuAtualizar(dto);
    }

    @SuppressWarnings("null")
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
