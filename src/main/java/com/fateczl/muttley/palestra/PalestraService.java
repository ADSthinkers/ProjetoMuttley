package com.fateczl.muttley.palestra;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.competencia.CompetenciaService;
import com.fateczl.muttley.evento.Evento;
import com.fateczl.muttley.evento.EventoService;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.palestrante.PalestranteRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PalestraService {

    @Autowired
    private PalestraRepository palestraRepository;

    @Autowired
    private CompetenciaService competenciaService;

    @Autowired
    private EventoService eventoService;

    @Autowired
    private PalestraMapper palestraMapper;

    @Autowired
    private PalestranteRepository palestranteRepository;

    @Transactional
    public List<Palestra> findAll() {
        List<Palestra> palestras = palestraRepository.findAll(Sort.by("titulo").ascending());
        palestras.forEach(p -> {
            p.getPalestrantes().size();
            p.getCompetencias().size();
        });
        return palestras;
    }

    @SuppressWarnings("null")
    public void deleteById(Long id) {
        palestraRepository.deleteById(id);
    }

    @SuppressWarnings("null")
    public Optional<Palestra> findById(Long id) {
        return palestraRepository.findById(id);
    }

    public Optional<Palestra> findByQrCodeToken(String token) {
        return palestraRepository.findByQrCodeToken(token);
    }

    @SuppressWarnings("null")
    public Palestra garantirToken(Long id) {
        Palestra palestra = palestraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
        if (palestra.getQrCodeToken() == null) {
            palestra.setQrCodeToken(UUID.randomUUID().toString());
            palestra = palestraRepository.save(palestra);
        }
        return palestra;
    }

    public Palestra saveOrUpdate(PalestraDTO dto) {
        List<Long> competenciaIds = dto.competenciaIds();
        List<Competencia> competencias = competenciaService.findAllbyIdCompetencias(competenciaIds);
        if (competencias.size() != competenciaIds.size()) {
            throw new EntityNotFoundException("Uma ou mais competências não existem");
        }

        @SuppressWarnings("null")
        List<Palestrante> palestrantes = palestranteRepository.findAllById(dto.palestranteIds());
        if (palestrantes.size() != dto.palestranteIds().size()) {
            throw new EntityNotFoundException("Um ou mais palestrantes não encontrados");
        }

        Evento evento = eventoService.buscarPorId(dto.eventoId())
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));

        if (dto.id() != null) {
            @SuppressWarnings("null")
            Palestra existente = palestraRepository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
            palestraMapper.updateEntityFromDto(dto, existente);
            existente.setCompetencias(competencias);
            existente.setPalestrantes(palestrantes);
            existente.setEvento(evento);
            return palestraRepository.save(existente);
        } else {
            Palestra nova = palestraMapper.toEntity(dto);
            nova.setCompetencias(competencias);
            nova.setPalestrantes(palestrantes);
            nova.setEvento(evento);
            nova.setQrCodeToken(UUID.randomUUID().toString());
            return palestraRepository.save(nova);
        }
    }
}
