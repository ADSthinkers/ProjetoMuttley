package com.fateczl.muttley.evento;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaEventoService {

    private final CategoriaEventoRepository repository;

    public CategoriaEventoService(CategoriaEventoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public CategoriaEvento salvarOuAtualizar(CategoriaEventoDTO dto) {
        if (dto.id() != null) {
            CategoriaEvento existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada"));
            existente.setNome(dto.nome());
            return repository.save(existente);
        }

        CategoriaEvento nova = new CategoriaEvento();
        nova.setNome(dto.nome());
        return repository.save(nova);
    }

    public List<CategoriaEvento> listarTodos() {
        return repository.findAll(Sort.by("nome").ascending());
    }

    public Optional<CategoriaEvento> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
