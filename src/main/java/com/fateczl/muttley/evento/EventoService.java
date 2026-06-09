package com.fateczl.muttley.evento;

import com.fateczl.muttley.assinante.Assinante;
import com.fateczl.muttley.assinante.AssinanteRepository;
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
    private final AssinanteRepository assinanteRepository;

    public EventoService(EventoRepository repository, EventoMapper mapper,
                         PatrocinadorRepository patrocinadorRepository,
                         CategoriaEventoRepository categoriaEventoRepository,
                         PalestraRepository palestraRepository,
                         AssinanteRepository assinanteRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.patrocinadorRepository = patrocinadorRepository;
        this.categoriaEventoRepository = categoriaEventoRepository;
        this.palestraRepository = palestraRepository;
        this.assinanteRepository = assinanteRepository;
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
        if (dto.assinanteIds() == null || dto.assinanteIds().isEmpty()) {
            throw new IllegalArgumentException("Evento deve possuir pelo menos um assinante");
        }
        List<Assinante> assinantes = assinanteRepository.findAllById(dto.assinanteIds());
        if (assinantes.size() != dto.assinanteIds().size()) {
            throw new EntityNotFoundException("Um ou mais assinantes não encontrados");
        }

        if (dto.id() != null) {
            Evento existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));
            mapper.updateEntity(dto, existente);
            existente.setPatrocinador(patrocinador);
            existente.setCategoria(categoria);
            existente.setAssinantes(assinantes);
            return repository.save(existente);
        } else {
            Evento novo = mapper.toEntity(dto);
            novo.setPatrocinador(patrocinador);
            novo.setCategoria(categoria);
            novo.setAssinantes(assinantes);
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
