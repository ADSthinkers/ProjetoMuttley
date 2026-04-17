package com.fateczl.muttley.xp;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;


// linha 50 excluir provavelmente
@Service
public class XpService {

    @Autowired
    private XpRepository xpRepository;

    @Autowired
    private XpMapper xpMapper;

    public Xp saveOrAtualizeXp(XpDTO dto) {

        if (dto.id() != null) {
            Xp existente = xpRepository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Xp não encontrado com ID: " + dto.id()));            
            xpMapper.updateEntityFromXp(dto, existente);
            return xpRepository.save(existente);
         }  else {
            Xp novoXp = xpMapper.toEntityFromXp(dto);

            return xpRepository.save(novoXp);
         }
    
    }

    public List<Xp> findAllXps(){
        return xpRepository.findAll(Sort.by("id").ascending());
    }

    public List<Xp> findAllbyIdXps(List<Long> ids) {

        List<Xp> xps = xpRepository.findAllById(ids);

        if (ids == null  || ids.isEmpty()) {
            return List.of();
        }

        if(xps.size() != ids.size()) {
            throw new EntityNotFoundException("Um ou mais Xps não foram encontrados");
        }

        return xps;
    }

    public void apagarPorId (Long id) {
        xpRepository.deleteById(id);
    }

    public Optional<Xp> procurarPorId(Long id){
        return xpRepository.findById(id);
    }
}
