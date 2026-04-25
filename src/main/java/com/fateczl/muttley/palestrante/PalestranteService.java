package com.fateczl.muttley.palestrante;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

@Service
public class PalestranteService {

    private final PalestranteRepository repository;
    private final PalestranteMapper mapper;

    public PalestranteService(PalestranteRepository repository, PalestranteMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public Palestrante salvarOuAtualizar(PalestranteDTO dto) {
        if (dto.id() != null) {
            Palestrante existente = repository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Palestrante não encontrado"));

            mapper.updateEntity(dto, existente);
            return repository.save(existente);
        } else {
            Palestrante novo = mapper.toEntity(dto);
            return repository.save(novo);
        }
    }

    public List<Palestrante> listarTodos() {
        return repository.findAll();
    }

    public Optional<Palestrante> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
