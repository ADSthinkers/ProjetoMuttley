package com.fateczl.muttley.assinante;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

// serviço responsável pelas operações de cadastro, listagem e remoção de assinantes
@Service
public class AssinanteService {

    private final AssinanteRepository repository;
    private final AssinanteMapper mapper;

    public AssinanteService(AssinanteRepository repository, AssinanteMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public Assinante salvarOuAtualizar(AssinanteDTO dto) {
        if (dto.id() != null) {
            Assinante existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Assinante não encontrado"));
            mapper.updateEntityFromDto(dto, existente);
            return repository.save(existente);
        }
        return repository.save(mapper.toEntity(dto));
    }

    public List<Assinante> listarTodos() {
        return repository.findAll(Sort.by("nome").ascending());
    }

    public Optional<Assinante> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
