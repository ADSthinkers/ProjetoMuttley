package com.fateczl.muttley.competencia;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

//import com.fateczl.muttley.palestra.Palestra;

//import ch.qos.logback.core.net.SyslogOutputStream;
import jakarta.persistence.EntityNotFoundException;

// serviço responsável pelas operações de criação, atualização, busca e remoção de competências
@Service
public class CompetenciaService {

    @Autowired
    private CompetenciaRepository competenciaRepository;

    @Autowired
    private CompetenciaMapper competenciaMapper;

    // cria uma nova competência ou atualiza uma existente com base no id do DTO
     
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

    // lista todas as competências cadastradas ordenadas pelo id
    public List<Competencia> findAllCompetencias(){
        return competenciaRepository.findAll(Sort.by("id").ascending());
    }

    // busca e valida uma lista de competências pelos ids, lançando erro se algum não existir
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

    // remove uma competência pelo seu identificador
     
    public void apagarPorId (Long id) {
        if (!competenciaRepository.existsById(id)) {
            throw new EntityNotFoundException("Competência não encontrada com ID: " + id);
        }

        long palestrasAssociadas = competenciaRepository.contarPalestrasAssociadas(id);
        if (palestrasAssociadas > 0) {
            throw new IllegalStateException("Competência associada a palestra não pode ser excluída");
        }

        competenciaRepository.deleteById(id);
    }
    
    // busca uma competência pelo seu identificador
     
    public Optional<Competencia> procurarPorId(Long id){
        return competenciaRepository.findById(id);
    }
}
