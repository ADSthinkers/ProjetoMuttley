package com.fateczl.muttley.xp;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.competencia.CompetenciaService;
import com.fateczl.muttley.email.EmailService;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

// serviço responsável pelas operações de criação, atualização, listagem e remoção de registros de XP
@Service
public class XpService {

    @Autowired
    private XpRepository xpRepository;

    @Autowired
    private ParticipanteService participanteService;

    @Autowired
    private CompetenciaService competenciaService;

    @Autowired
    private EmailService emailService;

    // cria ou atualiza um registro de XP resolvendo as associações de competência e participante
     
    public Xp saveOrAtualizeXp(XpDTO dto) {
        Competencia competencia = competenciaService.procurarPorId(dto.competenciaId())
                .orElseThrow(() -> new EntityNotFoundException("Competência não encontrada"));

        Participante participante = participanteService.buscarPorId(dto.participanteId())
                .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));

        if (dto.id() != null) {
            Xp existente = xpRepository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Xp não encontrado"));
            float horasAnteriores = existente.getHoras();
            existente.setHoras(dto.horas());
            existente.setCompetencia(competencia);
            existente.setParticipante(participante);
            Xp salvo = xpRepository.save(existente);
            notificarEvolucaoSeNecessario(participante, competencia, horasAnteriores, salvo.getHoras());
            return salvo;
        } else {
            Xp novo = new Xp();
            novo.setHoras(dto.horas());
            novo.setCompetencia(competencia);
            novo.setParticipante(participante);
            Xp salvo = xpRepository.save(novo);
            notificarEvolucaoSeNecessario(participante, competencia, 0f, salvo.getHoras());
            return salvo;
        }
    }

    // acumula XP por competência usando a carga horária da palestra — soma se já existir, cria se não
    @Transactional
    public void registrarParaPalestra(Long participanteId, Palestra palestra) {
        if (palestra.getCompetencias() == null || palestra.getCompetencias().isEmpty()) return;
        float horas = palestra.getCargaHoraria() != null ? palestra.getCargaHoraria() : 1f;
        Participante participante = participanteService.buscarPorId(participanteId)
                .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));
        for (Competencia competencia : palestra.getCompetencias()) {
            Optional<Xp> existente = xpRepository.findByParticipanteIdAndCompetenciaId(
                    participanteId, competencia.getId());
            if (existente.isPresent()) {
                Xp xp = existente.get();
                float horasAnteriores = xp.getHoras();
                xp.setHoras(xp.getHoras() + horas);
                Xp salvo = xpRepository.save(xp);
                notificarEvolucaoSeNecessario(participante, competencia, horasAnteriores, salvo.getHoras());
            } else {
                Xp novo = new Xp();
                novo.setHoras(horas);
                novo.setCompetencia(competencia);
                novo.setParticipante(participante);
                Xp salvo = xpRepository.save(novo);
                notificarEvolucaoSeNecessario(participante, competencia, 0f, salvo.getHoras());
            }
        }
    }

    private void notificarEvolucaoSeNecessario(Participante participante, Competencia competencia,
                                               float horasAnteriores, float horasAtualizadas) {
        int nivelAnterior = calcularNivelCompetencia(horasAnteriores, competencia);
        int nivelAtual = calcularNivelCompetencia(horasAtualizadas, competencia);

        if (nivelAtual > nivelAnterior) {
            emailService.enviarEvolucaoCompetencia(participante, competencia, horasAtualizadas, nivelAtual);
        }
    }

    private int calcularNivelCompetencia(float horas, Competencia competencia) {
        float horasParaEvoluir = competencia != null && competencia.getHorasParaEvoluir() != null
                && competencia.getHorasParaEvoluir() > 0
                ? competencia.getHorasParaEvoluir()
                : 5f;

        if (horas < horasParaEvoluir) return 1;
        return ((int) Math.floor((horas + 0.0001f) / horasParaEvoluir)) + 1;
    }

    // lista todos os registros de XP ordenados pelo id
    public List<Xp> findAllXps() {
        return xpRepository.findAll(Sort.by("id").ascending());
    }

    public List<Xp> findByParticipanteId(Long participanteId) {
        return xpRepository.findByParticipanteId(participanteId);
    }

    // remove um registro de XP pelo seu identificador
     
    public void apagarPorId(Long id) {
        xpRepository.deleteById(id);
    }

    // busca um registro de XP pelo seu identificador
     
    public Optional<Xp> procurarPorId(Long id) {
        return xpRepository.findById(id);
    }
}
