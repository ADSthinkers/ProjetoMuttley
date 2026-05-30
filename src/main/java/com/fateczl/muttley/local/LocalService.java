package com.fateczl.muttley.local;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

// serviço responsável pelas operações de criação, atualização, listagem e remoção de locais
@Service
public class LocalService {

    @Autowired
    private LocalRepository localRepository;

    @Autowired
    private LocalMapper localMapper;

    // cria ou atualiza um local com base no id do DTO
     
    public Local saveOrAtualize(LocalDTO dto) {
        if (dto.id() != null) {
             
            Local existente = localRepository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Local não encontrado com ID: " + dto.id()));
            localMapper.updateEntityFromDto(dto, existente);
            return localRepository.save(existente);
        } else {
            Local novoLocal = localMapper.toEntityFromDTO(dto);
            return localRepository.save(novoLocal);
        }
    }

    // lista todos os locais cadastrados ordenados pelo id
    public List<Local> findAllLocais() {
        return localRepository.findAll(Sort.by("id").ascending());
    }

    // remove um local pelo seu identificador
     
    public void apagarPorId(Long id) {
        localRepository.deleteById(id);
    }

    // busca um local pelo seu identificador
     
    public Optional<Local> procurarPorId(Long id) {
        return localRepository.findById(id);
    }
}
