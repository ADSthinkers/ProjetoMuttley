package com.fateczl.muttley.medalha;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedalhaRepository extends JpaRepository<Medalha, Long> {
    List<Medalha> findByParticipanteId(Long participanteId);
    boolean existsByParticipanteIdAndPalestraId(Long participanteId, Long palestraId);
}
