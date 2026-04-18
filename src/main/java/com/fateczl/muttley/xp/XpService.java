package com.fateczl.muttley.xp;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fateczl.muttley.aluno.Aluno;
import com.fateczl.muttley.aluno.AlunoService;
import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.competencia.CompetenciaService;

import jakarta.persistence.EntityNotFoundException;


// linha 50 excluir provavelmente
@Service
public class XpService {

    @Autowired
    private XpRepository xpRepository;

        @Autowired
    private AlunoService alunoService;

    @Autowired
    private CompetenciaService competenciaService;

    @SuppressWarnings("null")
    public Xp saveOrAtualizeXp(XpDTO dto) {

    Competencia competencia = competenciaService.procurarPorId(dto.competenciaId())
        .orElseThrow(() -> new EntityNotFoundException("Competência não encontrada"));

    Aluno aluno = alunoService.buscarPorId(dto.alunoId())
        .orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));

    if (dto.id() != null) {
        Xp existente = xpRepository.findById(dto.id())
            .orElseThrow(() -> new EntityNotFoundException("Xp não encontrado"));

        existente.setHoras(dto.horas());
        existente.setCompetencia(competencia);
        existente.setAluno(aluno);

        return xpRepository.save(existente);

    } else {
        Xp novo = new Xp();
        novo.setHoras(dto.horas());
        novo.setCompetencia(competencia);
        novo.setAluno(aluno);

        return xpRepository.save(novo);
    }
}

    public List<Xp> findAllXps(){
        return xpRepository.findAll(Sort.by("id").ascending());
    }

    public List<Xp> findAllbyIdXps(List<Long> ids) {

        @SuppressWarnings("null")
        List<Xp> xps = xpRepository.findAllById(ids);

        if (ids == null  || ids.isEmpty()) {
            return List.of();
        }

        if(xps.size() != ids.size()) {
            throw new EntityNotFoundException("Um ou mais Xps não foram encontrados");
        }

        return xps;
    }

    @SuppressWarnings("null")
    public void apagarPorId (Long id) {
        xpRepository.deleteById(id);
    }

    @SuppressWarnings("null")
    public Optional<Xp> procurarPorId(Long id){
        return xpRepository.findById(id);
    }
}
