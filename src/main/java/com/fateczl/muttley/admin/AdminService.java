package com.fateczl.muttley.admin;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

// serviço responsável pelas operações de cadastro, listagem e remoção de administradores com criptografia de senha
@Service
public class AdminService {

    private final AdminRepository repository;
    private final AdminMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository repository, AdminMapper mapper, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
    }

    // cria ou atualiza um admin, preservando a senha atual se não for informada nova
     
    public Admin salvarOuAtualizar(AdminDTO dto) {

        if (dto.id() != null) {
            Admin existente = repository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Admin não encontrado"));

            String senhaAtual = existente.getSenha();
            mapper.updateEntity(dto, existente);

            if (dto.senha() == null || dto.senha().isBlank()) {
                existente.setSenha(senhaAtual);
            } else {
                existente.setSenha(passwordEncoder.encode(dto.senha()));
            }
            return repository.save(existente);
        } else {
            Admin novo = mapper.toEntity(dto);
            novo.setSenha(passwordEncoder.encode(dto.senha()));
            return repository.save(novo);
        }
    }

    // lista todos os administradores cadastrados
    public List<Admin> listarTodos() {
        return repository.findAll();
    }

    // busca um administrador pelo seu identificador
     
    public Optional<Admin> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // remove um administrador pelo seu identificador
     
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}