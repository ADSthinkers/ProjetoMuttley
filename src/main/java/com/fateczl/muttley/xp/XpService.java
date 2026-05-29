package com.fateczl.muttley.xp;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.competencia.CompetenciaService;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteService;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class XpService {

    @Autowired
    private XpRepository xpRepository;

    @Autowired
    private ParticipanteService participanteService;

    @Autowired
    private CompetenciaService competenciaService;

    @SuppressWarnings("null")
    public Xp saveOrAtualizeXp(XpDTO dto) {
        Competencia competencia = competenciaService.procurarPorId(dto.competenciaId())
                .orElseThrow(() -> new EntityNotFoundException("Competência não encontrada"));

        Participante participante = participanteService.buscarPorId(dto.participanteId())
                .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));

        if (dto.id() != null) {
            Xp existente = xpRepository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Xp não encontrado"));
            existente.setHoras(dto.horas());
            existente.setCompetencia(competencia);
            existente.setParticipante(participante);
            return xpRepository.save(existente);
        } else {
            Xp novo = new Xp();
            novo.setHoras(dto.horas());
            novo.setCompetencia(competencia);
            novo.setParticipante(participante);
            return xpRepository.save(novo);
        }
    }

    public List<Xp> findAllXps() {
        return xpRepository.findAll(Sort.by("id").ascending());
    }

    @SuppressWarnings("null")
    public void apagarPorId(Long id) {
        xpRepository.deleteById(id);
    }

    @SuppressWarnings("null")
    public Optional<Xp> procurarPorId(Long id) {
        return xpRepository.findById(id);
    }
}
