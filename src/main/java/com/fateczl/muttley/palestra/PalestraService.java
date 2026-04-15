package com.fateczl.muttley.palestra;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fateczl.muttley.competencia.Competencia;

import jakarta.persistence.EntityNotFoundException;
    
@Service
public class PalestraService {

    @Autowired
    private PalestraRepository palestraRepository;

    @Autowired
    private CompetenciaService competenciaService;

    @Autowired
    private PalestraMapper palestraMapper;

    public List<Palestra> findAll(){
        return palestraRepository.findAll(Sort.by("titulo").ascending());
    }

    public void deleteById(Long id){
        palestraRepository.deleteById(id);
    }

    public Optional<Palestra> findById(Long id){
        return palestraRepository.findById(id);
    }

    public Palestra saveOrUpdate(PalestraDTO dto){
        List<Long> ids = dto.competenciaIds();

        List<Competencia> competencias = competenciaService.findAllByIdCompetencias(ids);
        if (competencias.size() != ids.size()) {
            throw new EntityNotFoundException("Uma ou mais competências não existem");
        }

        if (dto.id() != null){
            Palestra existingPalestra = palestraRepository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
            palestraMapper.updateEntityFromDto(dto, existingPalestra);
            existingPalestra.setCompetencias(competencias);
            return palestraRepository.save(existingPalestra);
        } else {
            Palestra newPalestra = palestraMapper.toEntity(dto);
            newPalestra.setCompetencias(competencias);
            return palestraRepository.save(newPalestra);
        }
    }
}