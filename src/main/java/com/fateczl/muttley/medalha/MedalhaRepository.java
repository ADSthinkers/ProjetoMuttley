package com.fateczl.muttley.medalha;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedalhaRepository extends JpaRepository<Medalha, Long> {
    List<Medalha> findByParticipanteId(Long participanteId);
    boolean existsByParticipanteIdAndCompetenciaIdAndNivelAlcancado(
            Long participanteId, Long competenciaId, Integer nivelAlcancado);
}
