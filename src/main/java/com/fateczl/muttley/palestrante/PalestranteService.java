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

    @SuppressWarnings("null")
    public Palestrante salvarOuAtualizar(PalestranteDTO dto) {
        if (dto.id() != null) {
            @SuppressWarnings("null")
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

    @SuppressWarnings("null")
    public Optional<Palestrante> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @SuppressWarnings("null")
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
