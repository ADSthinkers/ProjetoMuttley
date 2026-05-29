package com.fateczl.muttley.participante;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ParticipanteService {

    private final ParticipanteRepository repository;
    private final ParticipanteMapper mapper;

    public ParticipanteService(ParticipanteRepository repository, ParticipanteMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

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

    public List<Participante> listarTodos() {
        return repository.findAll();
    }

    public Optional<Participante> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Optional<Participante> buscarPorCpfEEmail(String cpf, String email) {
        return repository.findByCpfAndEmail(cpf, email);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
