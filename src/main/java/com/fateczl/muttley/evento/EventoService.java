package com.fateczl.muttley.evento;

import com.fateczl.muttley.local.Local;
import com.fateczl.muttley.local.LocalRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    private final EventoRepository repository;
    private final EventoMapper mapper;
    private final LocalRepository localRepository;

    public EventoService(EventoRepository repository, EventoMapper mapper,
                         LocalRepository localRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.localRepository = localRepository;
    }

    public Evento salvarOuAtualizar(EventoDTO dto) {
        Local local = null;
        if (dto.localId() != null) {
            local = localRepository.findById(dto.localId())
                    .orElseThrow(() -> new EntityNotFoundException("Local não encontrado"));
        }

        if (dto.id() != null) {
            Evento existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
            mapper.updateEntity(dto, existente);
            existente.setLocal(local);
            return repository.save(existente);
        } else {
            Evento novo = mapper.toEntity(dto);
            novo.setLocal(local);
            return repository.save(novo);
        }
    }

    public List<Evento> listarTodos() {
        return repository.findAll();
    }

    public Optional<Evento> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
