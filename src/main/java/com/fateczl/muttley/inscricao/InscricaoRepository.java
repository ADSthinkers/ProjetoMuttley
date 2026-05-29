package com.fateczl.muttley.inscricao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InscricaoRepository extends JpaRepository<Inscricao, Long> {
    List<Inscricao> findByParticipanteId(Long participanteId);
    List<Inscricao> findByPalestraId(Long palestraId);
    boolean existsByParticipanteIdAndPalestraId(Long participanteId, Long palestraId);
    Optional<Inscricao> findByParticipanteIdAndPalestraId(Long participanteId, Long palestraId);
    Optional<Inscricao> findByQrCodeToken(String qrCodeToken);
}
