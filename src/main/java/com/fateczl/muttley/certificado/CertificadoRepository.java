package com.fateczl.muttley.certificado;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CertificadoRepository extends JpaRepository<Certificado, Long> {
    Optional<Certificado> findByCodigoValidacao(String codigoValidacao);
}
