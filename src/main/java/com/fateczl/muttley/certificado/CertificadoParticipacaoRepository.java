package com.fateczl.muttley.certificado;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificadoParticipacaoRepository extends JpaRepository<CertificadoParticipacao, Long> {

    List<CertificadoParticipacao> findByParticipacaoParticipanteId(Long participanteId);

    List<CertificadoParticipacao> findByParticipacaoPalestraId(Long palestraId);

    Optional<CertificadoParticipacao> findByParticipacaoParticipanteIdAndParticipacaoPalestraId(
            Long participanteId, Long palestraId);

    boolean existsByParticipacaoParticipanteIdAndParticipacaoPalestraId(Long participanteId, Long palestraId);
}
