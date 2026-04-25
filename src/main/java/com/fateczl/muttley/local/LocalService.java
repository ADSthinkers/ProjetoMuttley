package com.fateczl.muttley.local;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

@Service
public class LocalService {

    @Autowired
    private LocalRepository localRepository;

    @Autowired
    private LocalMapper localMapper;

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

    public List<Local> findAllLocais() {
        return localRepository.findAll(Sort.by("id").ascending());
    }

    public void apagarPorId(Long id) {
        localRepository.deleteById(id);
    }

    public Optional<Local> procurarPorId(Long id) {
        return localRepository.findById(id);
    }
}
