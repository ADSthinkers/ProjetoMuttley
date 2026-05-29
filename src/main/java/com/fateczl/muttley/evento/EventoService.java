package com.fateczl.muttley.evento;

import com.fateczl.muttley.local.Local;
import com.fateczl.muttley.local.LocalRepository;
import com.fateczl.muttley.patrocinador.Patrocinador;
import com.fateczl.muttley.patrocinador.PatrocinadorRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    private final EventoRepository repository;
    private final EventoMapper mapper;
    private final LocalRepository localRepository;
    private final PatrocinadorRepository patrocinadorRepository;

    public EventoService(EventoRepository repository, EventoMapper mapper,
                         LocalRepository localRepository,
                         PatrocinadorRepository patrocinadorRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.localRepository = localRepository;
        this.patrocinadorRepository = patrocinadorRepository;
    }

    public Evento salvarOuAtualizar(EventoDTO dto) {
        Local local = null;
        if (dto.localId() != null) {
            local = localRepository.findById(dto.localId())
                    .orElseThrow(() -> new EntityNotFoundException("Local não encontrado"));
        }

        Patrocinador patrocinador = null;
        if (dto.patrocinadorId() != null) {
            patrocinador = patrocinadorRepository.findById(dto.patrocinadorId())
                    .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado"));
        }

        if (dto.id() != null) {
            Evento existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
            mapper.updateEntity(dto, existente);
            existente.setLocal(local);
            existente.setPatrocinador(patrocinador);
            return repository.save(existente);
        } else {
            Evento novo = mapper.toEntity(dto);
            novo.setLocal(local);
            novo.setPatrocinador(patrocinador);
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
