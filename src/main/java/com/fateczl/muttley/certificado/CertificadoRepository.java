package com.fateczl.muttley.certificado;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificadoRepository extends JpaRepository<Certificado, Long> {
    List<Certificado> findByParticipanteId(Long participanteId);
    Optional<Certificado> findByCodigoValidacao(String codigoValidacao);
    Optional<Certificado> findByParticipanteIdAndPalestraId(Long participanteId, Long palestraId);
    boolean existsByParticipanteIdAndPalestraId(Long participanteId, Long palestraId);
    Optional<Certificado> findByPalestranteIdAndPalestraId(Long palestranteId, Long palestraId);
    boolean existsByPalestranteIdAndPalestraId(Long palestranteId, Long palestraId);
}
