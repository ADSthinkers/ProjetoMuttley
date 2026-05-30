package com.fateczl.muttley.medalha;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.competencia.CompetenciaRepository;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.palestrante.PalestranteRepository;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteRepository;


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

    public MedalhaService(MedalhaRepository repository,
                           ParticipanteRepository participanteRepository,
                           PalestranteRepository palestranteRepository,
                           PalestraRepository palestraRepository,
                           CompetenciaRepository competenciaRepository) {
        this.repository = repository;
        this.participanteRepository = participanteRepository;
        this.palestranteRepository = palestranteRepository;
        this.palestraRepository = palestraRepository;
        this.competenciaRepository = competenciaRepository;
    }

    // cria ou atualiza uma medalha associando participante, palestra e competências
     
    public Medalha salvarOuAtualizar(MedalhaDTO dto) {
        Participante participante = participanteRepository.findById(dto.participanteId())
                .orElseThrow(() -> new EntityNotFoundException("Participante não encontrado"));
        Palestra palestra = palestraRepository.findById(dto.palestraId())
                .orElseThrow(() -> new EntityNotFoundException("Palestra não encontrada"));
        List<Competencia> competencias = dto.competenciaIds() != null && !dto.competenciaIds().isEmpty()
                ? competenciaRepository.findAllById(dto.competenciaIds())
                : List.of();

        if (dto.id() != null) {
            Medalha existente = repository.findById(dto.id())
                    .orElseThrow(() -> new EntityNotFoundException("Medalha não encontrada"));
            existente.setTipo(dto.tipo());
            existente.setNome(dto.nome());
            existente.setDescricao(dto.descricao());
            existente.setParticipante(participante);
            existente.setPalestra(palestra);
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
            if (m.getCompetencias() != null) m.getCompetencias().size();
        });
        return medalhas;
    }

    // concede uma medalha de participação ao participante preenchendo nome, descrição e competências da palestra
    public void concederSeNaoExistir(Long participanteId, Palestra palestra) {
        if (repository.existsByParticipanteIdAndPalestraId(participanteId, palestra.getId())) return;
        List<Long> competenciaIds = palestra.getCompetencias() != null
                ? palestra.getCompetencias().stream().map(Competencia::getId).toList()
                : List.of();
        MedalhaDTO dto = new MedalhaDTO(null, TipoMedalha.PARTICIPACAO,
                palestra.getTitulo(), palestra.getDescricao(),
                participanteId, palestra.getId(), null, competenciaIds);
        salvarOuAtualizar(dto);
    }

    // concede uma medalha de apresentação ao palestrante preenchendo nome, descrição e competências da palestra
    public void concederPalestranteSeNaoExistir(Long palestranteId, Palestra palestra) {
        if (repository.existsByPalestranteIdAndPalestraId(palestranteId, palestra.getId())) return;
        Palestrante palestrante = palestranteRepository.findById(palestranteId)
                .orElseThrow(() -> new EntityNotFoundException("Palestrante não encontrado"));
        List<Competencia> competencias = palestra.getCompetencias() != null
                ? competenciaRepository.findAllById(
                        palestra.getCompetencias().stream().map(Competencia::getId).toList())
                : List.of();
        Medalha medalha = new Medalha();
        medalha.setTipo(TipoMedalha.APRESENTACAO);
        medalha.setNome(palestra.getTitulo());
        medalha.setDescricao(palestra.getDescricao());
        medalha.setPalestrante(palestrante);
        medalha.setPalestra(palestra);
        medalha.setCompetencias(competencias);
        medalha.setDataConquista(LocalDate.now());
        repository.save(medalha);
    }

    // remove uma medalha pelo seu identificador

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
