package com.fateczl.muttley.xp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public interface XpRepository extends JpaRepository<Xp, Long> {
    Optional<Xp> findByParticipanteIdAndCompetenciaId(Long participanteId, Long competenciaId);
    List<Xp> findByParticipanteId(Long participanteId);
}
