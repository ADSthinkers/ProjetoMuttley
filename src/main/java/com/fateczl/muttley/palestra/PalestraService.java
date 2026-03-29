package com.fateczl.muttley.palestra;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
    

@Service
public class PalestraService {
    @Autowired
    private PalestraRepository palestraRepository;

    // @Autowired
    // private CompetenciaService competenciaService;

    //@Autowired
    //private PalestraMapper palestraMapper;

    public List<Palestra> findAll(){
        return palestraRepository.findAll(Sort.by("titulo").ascending());
    }

    public void deletById(long id){
        palestraRepository.deleteById(id);
    }

    public Optional<Palestra> findById(Long id){
        return palestraRepository.findById(id);
    }

    //TO-DO: Salvar e/ou Atualizar
}
