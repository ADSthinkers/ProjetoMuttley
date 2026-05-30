package com.fateczl.muttley.patrocinador;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

// serviço responsável pelas operações de criação, atualização, listagem e remoção de patrocinadores
@Service
public class PatrocinadorService {

    @Autowired
    private PatrocinadorRepository repository;

    @Autowired
    private PatrocinadorMapper mapper;

    // cria ou atualiza um patrocinador com base no id do DTO
     
    public Patrocinador salvarOuAtualizar(PatrocinadorDTO dto) {
        if (dto.id() != null) {
             
            Patrocinador existente = repository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado"));
            mapper.updateEntityFromDto(dto, existente);
            return repository.save(existente);
        } else {
            Patrocinador novo = mapper.toEntity(dto);
            return repository.save(novo);
        }
    }

    // lista todos os patrocinadores cadastrados ordenados pelo id
    public List<Patrocinador> listarTodos() {
        return repository.findAll(Sort.by("id").ascending());
    }

    // busca um patrocinador pelo seu identificador
     
    public Optional<Patrocinador> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // remove um patrocinador pelo seu identificador
     
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
