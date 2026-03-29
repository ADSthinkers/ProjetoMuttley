package com.fateczl.muttley.competencia;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class CompetenciaService {

    @Autowired
    private CompetenciaRepository competenciaRepository;

    public List<Competencia> procurarTodos(){
        return competenciaRepository.findAll(Sort.by("id").ascending());
    }

}
