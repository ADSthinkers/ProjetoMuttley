package com.fateczl.muttley.certificado;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificadoApresentacaoRepository extends JpaRepository<CertificadoApresentacao, Long> {

    List<CertificadoApresentacao> findByApresentacaoPalestranteId(Long palestranteId);

    List<CertificadoApresentacao> findByApresentacaoPalestraId(Long palestraId);

    Optional<CertificadoApresentacao> findByApresentacaoPalestranteIdAndApresentacaoPalestraId(
            Long palestranteId, Long palestraId);

    boolean existsByApresentacaoPalestranteIdAndApresentacaoPalestraId(Long palestranteId, Long palestraId);
}
