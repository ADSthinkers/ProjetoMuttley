package com.fateczl.muttley.evento;

import com.fateczl.muttley.patrocinador.Patrocinador;
import com.fateczl.muttley.patrocinador.PatrocinadorRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

// serviço responsável pelas operações de criação, atualização, listagem e remoção de eventos
@Service
public class EventoService {

    private final EventoRepository repository;
    private final EventoMapper mapper;
    private final PatrocinadorRepository patrocinadorRepository;

    public EventoService(EventoRepository repository, EventoMapper mapper,
                         PatrocinadorRepository patrocinadorRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.patrocinadorRepository = patrocinadorRepository;
    }

    // cria ou atualiza um evento resolvendo a associação de patrocinador pelo id
    public Evento salvarOuAtualizar(EventoDTO dto) {
        Patrocinador patrocinador = null;
        if (dto.patrocinadorId() != null) {
            patrocinador = patrocinadorRepository.findById(dto.patrocinadorId())
                    .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado"));
        }

        if (dto.id() != null) {
            Evento existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
            mapper.updateEntity(dto, existente);
            existente.setPatrocinador(patrocinador);
            return repository.save(existente);
        } else {
            Evento novo = mapper.toEntity(dto);
            novo.setPatrocinador(patrocinador);
            return repository.save(novo);
        }
    }

    // lista todos os eventos cadastrados
    public List<Evento> listarTodos() {
        return repository.findAll();
    }

    // busca um evento pelo seu identificador
    public Optional<Evento> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // remove um evento pelo seu identificador
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
