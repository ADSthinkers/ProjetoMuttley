package com.fateczl.muttley.admin;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

@Service
public class AdminService {

    @Autowired
    private final AdminRepository repository;
  
    @Autowired
    private final AdminMapper mapper;

    public AdminService(AdminRepository repository, AdminMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public Admin salvarOuAtualizar(AdminAtualizacao dto) {

        if (dto.id() != null) {
            Admin existente = repository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Admin não encontrado"));

            mapper.updateEntity(dto, existente);
            return repository.save(existente);
        } else {
            Admin novo = mapper.toEntity(dto);
            return repository.save(novo);
        }
    }

    public List<Admin> listarTodos() {
        return repository.findAll();
    }

    public Optional<Admin> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}