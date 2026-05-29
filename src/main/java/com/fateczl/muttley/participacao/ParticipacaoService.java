package com.fateczl.muttley.participacao;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.palestra.Palestra;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class ParticipacaoService {

    private final ParticipacaoRepository repository;
    private final ParticipacaoMapper mapper;

    public ParticipacaoService(ParticipacaoRepository repository, ParticipacaoMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @SuppressWarnings("null")
    public Participacao salvarOuAtualizar(ParticipacaoDTO dto) {
        if (dto.id() != null) {
            Participacao existente = repository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Participação não encontrada"));

            mapper.updateEntity(dto, existente);
            return repository.save(existente);
        } else {
            Participacao nova = mapper.toEntity(dto);
            return repository.save(nova);
        }
    }

    @Transactional
    public List<Participacao> listarTodos() {
        List<Participacao> lista = repository.findAll();
        lista.forEach(p -> {
            if (p.getParticipante() != null) p.getParticipante().getNome();
            if (p.getPalestra() != null) p.getPalestra().getTitulo();
        });
        return lista;
    }

    @SuppressWarnings("null")
    public Optional<Participacao> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @SuppressWarnings("null")
    public void deletar(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public List<Palestra> palestrasDoParticipante(Long participanteId) {
        return repository.findByParticipanteId(participanteId).stream()
                .map(Participacao::getPalestra)
                .filter(p -> p != null)
                .peek(p -> {
                    p.getCompetencias().size();
                    p.getPalestrantes().size();
                })
                .toList();
    }

    public Float totalHorasDoParticipante(Long participanteId) {
        return repository.findByParticipanteId(participanteId).stream()
                .map(Participacao::getHoras)
                .filter(h -> h != null)
                .reduce(0f, Float::sum);
    }

    @Transactional
    public List<Competencia> competenciasDoParticipante(Long participanteId) {
        return repository.findByParticipanteId(participanteId).stream()
                .map(Participacao::getPalestra)
                .filter(p -> p != null)
                .flatMap(p -> {
                    p.getCompetencias().size();
                    return p.getCompetencias().stream();
                })
                .distinct()
                .toList();
    }
}