package com.fateczl.muttley.palestrante;

import java.util.List;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

// serviço responsável pelas operações de cadastro, listagem e remoção de palestrantes com criptografia de senha
@Service
public class PalestranteService {

    private final PalestranteRepository repository;
    private final PalestranteMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public PalestranteService(PalestranteRepository repository, PalestranteMapper mapper,
                               PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
    }

    // cria ou atualiza um palestrante, preservando a senha atual se não for informada uma nova
     
    public Palestrante salvarOuAtualizar(PalestranteDTO dto) {
        if (dto.id() != null) {
            Palestrante existente = repository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Palestrante não encontrado"));

            String senhaAtual = existente.getSenha();
            mapper.updateEntity(dto, existente);

            if (dto.senha() == null || dto.senha().isBlank()) {
                existente.setSenha(senhaAtual);
            } else {
                existente.setSenha(passwordEncoder.encode(dto.senha()));
            }
            return repository.save(existente);
        } else {
            Palestrante novo = mapper.toEntity(dto);
            if (dto.senha() != null && !dto.senha().isBlank()) {
                novo.setSenha(passwordEncoder.encode(dto.senha()));
            }
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
