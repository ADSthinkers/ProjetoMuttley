package com.fateczl.muttley.evento;

import com.fateczl.muttley.patrocinador.Patrocinador;
import com.fateczl.muttley.patrocinador.PatrocinadorRepository;
import com.fateczl.muttley.palestra.PalestraRepository;

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
    private final CategoriaEventoRepository categoriaEventoRepository;
    private final PalestraRepository palestraRepository;

    public EventoService(EventoRepository repository, EventoMapper mapper,
                         PatrocinadorRepository patrocinadorRepository,
                         CategoriaEventoRepository categoriaEventoRepository,
                         PalestraRepository palestraRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.patrocinadorRepository = patrocinadorRepository;
        this.categoriaEventoRepository = categoriaEventoRepository;
        this.palestraRepository = palestraRepository;
    }

    // cria ou atualiza um evento resolvendo a associação de patrocinador pelo id
    public Evento salvarOuAtualizar(EventoDTO dto) {
        Patrocinador patrocinador = null;
        if (dto.patrocinadorId() != null) {
            patrocinador = patrocinadorRepository.findById(dto.patrocinadorId())
                    .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado"));
        }
        CategoriaEvento categoria = null;
        if (dto.categoriaId() != null) {
            categoria = categoriaEventoRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada"));
        }

        if (dto.id() != null) {
            Evento existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
            mapper.updateEntity(dto, existente);
            existente.setPatrocinador(patrocinador);
            existente.setCategoria(categoria);
            return repository.save(existente);
        } else {
            Evento novo = mapper.toEntity(dto);
            novo.setPatrocinador(patrocinador);
            novo.setCategoria(categoria);
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
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Evento não encontrado");
        }
        if (palestraRepository.existsByEventoId(id)) {
            throw new IllegalStateException("Evento não pode ser excluído porque possui palestras atribuídas");
        }
        repository.deleteById(id);
    }
}
