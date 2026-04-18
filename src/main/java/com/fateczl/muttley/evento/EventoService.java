package com.fateczl.muttley.evento;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

@Service
public class EventoService {

    private final EventoRepository repository;
    private final EventoMapper mapper;

    public EventoService(EventoRepository repository, EventoMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @SuppressWarnings("null")
    public Evento salvarOuAtualizar(EventoDTO dto) {
        if (dto.id() != null) {
            Evento existente = repository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
            mapper.updateEntity(dto, existente);
            return repository.save(existente);
        } else {
            Evento novo = mapper.toEntity(dto);
            return repository.save(novo);
        }
    }

    public List<Evento> listarTodos() {
        return repository.findAll();
    }

    @SuppressWarnings("null")
    public Optional<Evento> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @SuppressWarnings("null")
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}