package com.fateczl.muttley.palestrante;

import java.util.List;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

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

    @SuppressWarnings("null")
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
