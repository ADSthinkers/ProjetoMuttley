package com.fateczl.muttley.palestrante;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

// serviço responsável pelas operações de cadastro, listagem e remoção de palestrantes
@Service
public class PalestranteService {

    private final PalestranteRepository repository;
    private final PalestranteMapper mapper;

    public PalestranteService(PalestranteRepository repository, PalestranteMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // cria ou atualiza um palestrante
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

    // lista todos os palestrantes cadastrados
    public List<Palestrante> listarTodos() {
        return repository.findAll();
    }

    // busca um palestrante pelo seu identificador
     
    public Optional<Palestrante> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // busca um palestrante pelo e-mail
    public Optional<Palestrante> buscarPorEmail(String email) {
        return repository.findByEmail(email);
    }

    // remove um palestrante pelo seu identificador
     
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
