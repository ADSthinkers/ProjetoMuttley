package com.fateczl.muttley.competencia;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

//import com.fateczl.muttley.palestra.Palestra;

//import ch.qos.logback.core.net.SyslogOutputStream;
import jakarta.persistence.EntityNotFoundException;

@Service
public class CompetenciaService {

    @Autowired
    private CompetenciaRepository competenciaRepository;

    @Autowired
    private CompetenciaMapper competenciaMapper;

    public Competencia saveOrAtualize(CompetenciaDTO dto) {
        
    if (dto.id() != null) {    
        Competencia existente = competenciaRepository.findById(dto.id())
            .orElseThrow(() -> new EntityNotFoundException("Competencia não encontrada com ID: " + dto.id()));
        competenciaMapper.updateEntityFromDto(dto, existente);
        return competenciaRepository.save(existente);
    } else {
        Competencia novaCompetencia = competenciaMapper.toEntityFromDTO(dto);
        
        return competenciaRepository.save(novaCompetencia);
    }

    }   

    public List<Competencia> findAllCompetencias(){
        return competenciaRepository.findAll(Sort.by("id").ascending());
    }

    public List<Competencia> findAllbyIdCompetencias(List<Long> ids) {
        
        List<Competencia> competencias = competenciaRepository.findAllById(ids);
    
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        if (competencias.size() != ids.size()) {
            throw new EntityNotFoundException("Uma ou mais competências não foram encontradas");
        }
        
        return competencias;
    }

    public void apagarPorId (Long id) {
        competenciaRepository.deleteById(id);
    }
    
    public Optional<Competencia> procurarPorId(Long id){
        return competenciaRepository.findById(id);
    }
}
