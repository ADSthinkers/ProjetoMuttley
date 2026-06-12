package com.fateczl.muttley.medalha;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.competencia.CompetenciaRepository;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.palestrante.PalestranteRepository;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteRepository;
import com.fateczl.muttley.xp.Xp;
import com.fateczl.muttley.xp.XpRepository;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

// serviço responsável pelas operações de concessão, listagem e remoção de medalhas
@Service
public class MedalhaService {

    private final MedalhaRepository repository;
    private final ParticipanteRepository participanteRepository;
    private final PalestranteRepository palestranteRepository;
    private final PalestraRepository palestraRepository;
    private final CompetenciaRepository competenciaRepository;
    private final XpRepository xpRepository;

    public MedalhaService(MedalhaRepository repository,
                           ParticipanteRepository participanteRepository,
                           PalestranteRepository palestranteRepository,
                           PalestraRepository palestraRepository,
                           CompetenciaRepository competenciaRepository,
                           XpRepository xpRepository) {
        this.repository = repository;
        this.participanteRepository = participanteRepository;
        this.palestranteRepository = palestranteRepository;
        this.palestraRepository = palestraRepository;
        this.competenciaRepository = competenciaRepository;
        this.xpRepository = xpRepository;
    }

    // cria ou atualiza uma medalha de evolução de competência
     
    public Medalha salvarOuAtualizar(MedalhaDTO dto) {
        Participante participante = participanteRepository.findById(dto.participanteId())
                .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));
        Palestra palestra = dto.palestraId() != null
                ? palestraRepository.findById(dto.palestraId())
                    .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"))
                : null;
        Competencia competencia = resolverCompetencia(dto);
        Xp xp = dto.xpId() != null
                ? xpRepository.findById(dto.xpId())
                    .orElseThrow(() -> new EntityNotFoundException("XP não encontrado"))
                : null;
        List<Competencia> competencias = dto.competenciaIds() != null && !dto.competenciaIds().isEmpty()
                ? competenciaRepository.findAllById(dto.competenciaIds())
                : competencia != null ? List.of(competencia) : List.of();

        if (dto.id() != null) {
            Medalha existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Medalha não encontrada"));
            existente.setTipo(dto.tipo());
            existente.setNome(dto.nome());
            existente.setDescricao(dto.descricao());
            existente.setParticipante(participante);
            existente.setPalestra(palestra);
            existente.setCompetencia(competencia);
            existente.setXp(xp);
            existente.setNivelAlcancado(dto.nivelAlcancado());
            existente.setCompetencias(competencias);
            if (dto.dataConquista() != null) existente.setDataConquista(dto.dataConquista());
            return repository.save(existente);
        } else {
            Medalha nova = new Medalha();
            nova.setTipo(dto.tipo());
            nova.setNome(dto.nome());
            nova.setDescricao(dto.descricao());
            nova.setParticipante(participante);
            nova.setPalestra(palestra);
            nova.setCompetencia(competencia);
            nova.setXp(xp);
            nova.setNivelAlcancado(dto.nivelAlcancado());
            nova.setCompetencias(competencias);
            nova.setDataConquista(dto.dataConquista() != null ? dto.dataConquista() : LocalDate.now());
            return repository.save(nova);
        }
    }

    // lista todas as medalhas com carregamento forçado das associações
    @Transactional
    public List<Medalha> listarTodos() {
        List<Medalha> medalhas = repository.findAll();
        medalhas.forEach(m -> {
            if (m.getParticipante() != null) m.getParticipante().getNome();
            if (m.getPalestra() != null) m.getPalestra().getTitulo();
            if (m.getCompetencia() != null) m.getCompetencia().getNome();
            if (m.getCompetencias() != null) m.getCompetencias().size();
        });
        return medalhas;
    }

    // busca uma medalha pelo seu identificador
    public Optional<Medalha> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // lista as medalhas de um participante específico com suas competências carregadas
    @Transactional
    public List<Medalha> listarPorParticipante(Long participanteId) {
        List<Medalha> medalhas = repository.findByParticipanteId(participanteId);
        medalhas.forEach(m -> {
            if (m.getCompetencia() != null) m.getCompetencia().getNome();
            if (m.getCompetencias() != null) m.getCompetencias().size();
        });
        return medalhas;
    }

    // mantido por compatibilidade: medalhas agora são emitidas apenas por evolução de competência
    public void concederSeNaoExistir(Long participanteId, Palestra palestra) {
        return;
    }

    // mantido por compatibilidade: medalhas agora são emitidas apenas por evolução de competência
    public void concederPalestranteSeNaoExistir(Long palestranteId, Palestra palestra) {
        return;
    }

    public void concederEvolucaoCompetenciaSeNaoExistir(Participante participante, Competencia competencia,
                                                         Xp xp, int nivelAlcancado) {
        if (participante == null || competencia == null || nivelAlcancado <= 1) {
            return;
        }
        if (repository.existsByParticipanteIdAndCompetenciaIdAndNivelAlcancado(
                participante.getId(), competencia.getId(), nivelAlcancado)) {
            return;
        }

        Medalha medalha = new Medalha();
        medalha.setTipo(TipoMedalha.COMPETENCIA);
        medalha.setNome("Nível " + nivelAlcancado + " em " + competencia.getNome());
        medalha.setDescricao("Conquista por evolução na competência " + competencia.getNome() + ".");
        medalha.setParticipante(participante);
        medalha.setCompetencia(competencia);
        medalha.setCompetencias(List.of(competencia));
        medalha.setXp(xp);
        medalha.setNivelAlcancado(nivelAlcancado);
        medalha.setDataConquista(LocalDate.now());
        repository.save(medalha);
    }

    // remove uma medalha pelo seu identificador

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    private Competencia resolverCompetencia(MedalhaDTO dto) {
        if (dto.competenciaId() != null) {
            return competenciaRepository.findById(dto.competenciaId())
                    .orElseThrow(() -> new EntityNotFoundException("Competência não encontrada"));
        }
        if (dto.competenciaIds() != null && !dto.competenciaIds().isEmpty()) {
            return competenciaRepository.findById(dto.competenciaIds().get(0))
                    .orElseThrow(() -> new EntityNotFoundException("Competência não encontrada"));
        }
        return null;
    }
}
