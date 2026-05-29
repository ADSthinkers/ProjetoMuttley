package com.fateczl.muttley.palestra;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PalestraRepository extends JpaRepository<Palestra, Long> {

    Optional<Palestra> findByQrCodeToken(String qrCodeToken);
}
