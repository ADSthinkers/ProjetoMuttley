package com.fateczl.muttley.aluno;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

@Service
public class AlunoService {

    private final AlunoRepository repository;
    private final AlunoMapper mapper;

    public AlunoService(AlunoRepository repository, AlunoMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public Aluno salvarOuAtualizar(AlunoDTO dto) {
        if (dto.id() != null) {
            Aluno existente = repository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));

            mapper.updateEntity(dto, existente);
            return repository.save(existente);
        } else {
            Aluno novo = mapper.toEntity(dto);
            return repository.save(novo);
        }
    }

    public List<Aluno> listarTodos() {
        return repository.findAll();
    }

    public Optional<Aluno> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}