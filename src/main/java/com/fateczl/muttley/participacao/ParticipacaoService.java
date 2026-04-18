package com.fateczl.muttley.participacao;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ParticipacaoService {

    @Autowired
    private ParticipacaoRepository repository;

    @Autowired
    private ParticipacaoMapper mapper;

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

    public List<Participacao> listarTodos() {
        return repository.findAll();
    }

    @SuppressWarnings("null")
    public Optional<Participacao> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @SuppressWarnings("null")
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}