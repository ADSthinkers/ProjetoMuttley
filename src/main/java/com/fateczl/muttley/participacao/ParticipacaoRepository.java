package com.fateczl.muttley.participacao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParticipacaoRepository extends JpaRepository<Participacao, Long> {

    boolean existsByParticipanteIdAndPalestraId(Long participanteId, Long palestraId);

    List<Participacao> findByParticipanteId(Long participanteId);
}
