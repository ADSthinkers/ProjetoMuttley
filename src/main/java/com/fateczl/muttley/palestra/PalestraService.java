package com.fateczl.muttley.palestra;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.competencia.CompetenciaService;
import com.fateczl.muttley.evento.Evento;
import com.fateczl.muttley.evento.EventoService;
import com.fateczl.muttley.local.Local;
import com.fateczl.muttley.local.LocalRepository;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.palestrante.PalestranteRepository;
import com.fateczl.muttley.certificado.CertificadoRepository;
import com.fateczl.muttley.patrocinador.Patrocinador;
import com.fateczl.muttley.patrocinador.PatrocinadorRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// serviço responsável pelas operações de criação, atualização, busca e remoção de palestras
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

    @Autowired
    private PatrocinadorRepository patrocinadorRepository;

    @Autowired
    private LocalRepository localRepository;

    @Autowired
    private CertificadoRepository certificadoRepository;

    // lista todas as palestras ordenadas pelo título com carregamento forçado de palestrantes e competências
    @Transactional
    public List<Palestra> findAll() {
        List<Palestra> palestras = palestraRepository.findAll(Sort.by("titulo").ascending());
        palestras.forEach(p -> {
            p.getPalestrantes().size();
            p.getCompetencias().size();
        });
        return palestras;
    }

    // remove uma palestra pelo seu identificador
     
    public void deleteById(Long id) {
        palestraRepository.deleteById(id);
    }

    // busca uma palestra pelo seu identificador
     
    public Optional<Palestra> findById(Long id) {
        return palestraRepository.findById(id);
    }

    // busca uma palestra pelo seu token QR Code para identificação no check-in
    public Optional<Palestra> findByQrCodeToken(String token) {
        return palestraRepository.findByQrCodeToken(token);
    }

    // garante que a palestra possua um token QR Code, gerando um novo caso não tenha
     
    public Palestra garantirToken(Long id) {
        Palestra palestra = palestraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
        if (palestra.getQrCodeToken() == null) {
            palestra.setQrCodeToken(UUID.randomUUID().toString());
            palestra = palestraRepository.save(palestra);
        }
        return palestra;
    }

    // busca uma palestra pelo id carregando explicitamente palestrantes e competências
    @Transactional
    public Optional<Palestra> findByIdComPalestrantes(Long id) {
        return palestraRepository.findById(id).map(p -> {
            p.getPalestrantes().size();
            p.getCompetencias().size();
            return p;
        });
    }

    // propaga a nova carga horária para todos os certificados vinculados à palestra
    private void atualizarCargaHorariaCertificados(Long palestraId, float cargaHoraria) {
        certificadoRepository.findByPalestraId(palestraId).forEach(cert -> {
            cert.setCargaHoraria(cargaHoraria);
            certificadoRepository.save(cert);
        });
    }

    // atualiza o status de uma palestra pelo seu identificador
    public void atualizarStatus(Long palestraId, StatusPalestra status) {
        Palestra palestra = palestraRepository.findById(palestraId)
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
        palestra.setStatus(status);
        palestraRepository.save(palestra);
    }

    // cria ou atualiza uma palestra resolvendo todas as associações de competências, palestrantes, evento e local
    public Palestra saveOrUpdate(PalestraDTO dto) {
        List<Long> competenciaIds = dto.competenciaIds();
        List<Competencia> competencias = competenciaService.findAllbyIdCompetencias(competenciaIds);
        if (competencias.size() != competenciaIds.size()) {
            throw new EntityNotFoundException("Uma ou mais competências não existem");
        }

         
        List<Palestrante> palestrantes = palestranteRepository.findAllById(dto.palestranteIds());
        if (palestrantes.size() != dto.palestranteIds().size()) {
            throw new EntityNotFoundException("Um ou mais palestrantes não encontrados");
        }

        Evento evento = eventoService.buscarPorId(dto.eventoId())
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado"));

        Local local = null;
        if (dto.localId() != null) {
            local = localRepository.findById(dto.localId())
                    .orElseThrow(() -> new EntityNotFoundException("Local não encontrado"));
        }
        if (local != null && local.getCapacidade() != null && dto.vagas() != null
                && dto.vagas() > local.getCapacidade()) {
            throw new IllegalArgumentException("Vagas da palestra não podem exceder a capacidade do local");
        }

        Patrocinador patrocinador = null;
        if (dto.patrocinadorId() != null) {
            patrocinador = patrocinadorRepository.findById(dto.patrocinadorId())
                    .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado"));
        }

        float cargaHoraria = (dto.inicio() != null && dto.fim() != null)
                ? Duration.between(dto.inicio(), dto.fim()).toMinutes() / 60.0f
                : 0f;

        if (dto.id() != null) {
            Palestra existente = palestraRepository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
            palestraMapper.updateEntityFromDto(dto, existente);
            existente.setCompetencias(competencias);
            existente.setPalestrantes(palestrantes);
            existente.setEvento(evento);
            existente.setLocal(local);
            existente.setPatrocinador(patrocinador);
            existente.setCargaHoraria(cargaHoraria);
            if (dto.status() != null) existente.setStatus(dto.status());
            Palestra salva = palestraRepository.save(existente);
            atualizarCargaHorariaCertificados(salva.getId(), cargaHoraria);
            return salva;
        } else {
            Palestra nova = palestraMapper.toEntity(dto);
            nova.setCompetencias(competencias);
            nova.setPalestrantes(palestrantes);
            nova.setEvento(evento);
            nova.setLocal(local);
            nova.setPatrocinador(patrocinador);
            nova.setCargaHoraria(cargaHoraria);
            nova.setQrCodeToken(UUID.randomUUID().toString());
            nova.setStatus(StatusPalestra.PENDENTE);
            return palestraRepository.save(nova);
        }
    }
}
