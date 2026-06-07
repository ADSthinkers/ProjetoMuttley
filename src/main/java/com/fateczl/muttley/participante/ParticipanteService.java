package com.fateczl.muttley.participante;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

// serviço responsável pelas operações de cadastro, listagem e busca de participantes
@Service
public class ParticipanteService {

    private final ParticipanteRepository repository;
    private final ParticipanteMapper mapper;

    public ParticipanteService(ParticipanteRepository repository, ParticipanteMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // cria ou atualiza um participante com base no id do DTO
    public Participante salvarOuAtualizar(ParticipanteDTO dto) {
        if (dto.id() != null) {
            Participante existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));
            mapper.updateEntity(dto, existente);
            return repository.save(existente);
        } else {
            return repository.save(mapper.toEntity(dto));
        }
    }

    // lista todos os participantes cadastrados
    public List<Participante> listarTodos() {
        return repository.findAll();
    }

    // busca um participante pelo seu identificador
    public Optional<Participante> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // busca um participante pelo CPF e e-mail para validação de identidade no check-in
    public Optional<Participante> buscarPorCpfEEmail(String cpf, String email) {
        return repository.findByCpfAndEmail(cpf, email);
    }

    public Optional<Participante> buscarPorCpf(String cpf) {
        return repository.findByCpf(cpf);
    }

    // remove um participante pelo seu identificador
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
