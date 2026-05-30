package com.fateczl.muttley.participacao;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.participante.Participante;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

// serviço responsável pelas operações de registro, listagem e consulta de participações em palestras
@Service
public class ParticipacaoService {

    private final ParticipacaoRepository repository;
    private final ParticipacaoMapper mapper;

    public ParticipacaoService(ParticipacaoRepository repository, ParticipacaoMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // cria ou atualiza a participação do participante na palestra usando a carga horária atual da palestra
    public void registrarOuAtualizar(Participante participante, Palestra palestra) {
        float horas = palestra.getCargaHoraria() != null ? palestra.getCargaHoraria() : 1f;
        repository.findByParticipanteIdAndPalestraId(participante.getId(), palestra.getId())
                .ifPresentOrElse(
                        p -> { p.setHoras(horas); repository.save(p); },
                        () -> { Participacao nova = new Participacao(); nova.setParticipante(participante);
                                nova.setPalestra(palestra); nova.setHoras(horas); repository.save(nova); }
                );
    }

    // cria ou atualiza uma participação com base no id do DTO
     
    public Participacao salvarOuAtualizar(ParticipacaoDTO dto) {
        if (dto.id() != null) {
            Participacao existente = repository.findById(dto.id())
                .orElseThrow(() -> new EntityNotFoundException("Participação não encontrada"));

            mapper.updateEntity(dto, existente);
            return repository.save(existente);
        } else {
            Participacao nova = mapper.toEntity(dto);
            return repository.save(nova);
        }
    }

    // lista todas as participações com carregamento forçado das associações de participante e palestra
    @Transactional
    public List<Participacao> listarTodos() {
        List<Participacao> lista = repository.findAll();
        lista.forEach(p -> {
            if (p.getParticipante() != null) p.getParticipante().getNome();
            if (p.getPalestra() != null) p.getPalestra().getTitulo();
        });
        return lista;
    }

    // busca uma participação pelo seu identificador
     
    public Optional<Participacao> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // remove uma participação pelo seu identificador
     
    public void deletar(Long id) {
        repository.deleteById(id);
    }

    // retorna as palestras em que o participante tem participação registrada com dados carregados
    @Transactional
    public List<Palestra> palestrasDoParticipante(Long participanteId) {
        return repository.findByParticipanteId(participanteId).stream()
                .map(Participacao::getPalestra)
                .filter(p -> p != null)
                .peek(p -> {
                    p.getCompetencias().size();
                    p.getPalestrantes().size();
                })
                .toList();
    }

    // calcula o total de horas acumuladas pelo participante em todas as suas participações
    public Float totalHorasDoParticipante(Long participanteId) {
        return repository.findByParticipanteId(participanteId).stream()
                .map(Participacao::getHoras)
                .filter(h -> h != null)
                .reduce(0f, Float::sum);
    }

    // retorna todas as competências únicas desenvolvidas pelo participante nas suas participações
    @Transactional
    public List<Competencia> competenciasDoParticipante(Long participanteId) {
        return repository.findByParticipanteId(participanteId).stream()
                .map(Participacao::getPalestra)
                .filter(p -> p != null)
                .flatMap(p -> {
                    p.getCompetencias().size();
                    return p.getCompetencias().stream();
                })
                .distinct()
                .toList();
    }
}