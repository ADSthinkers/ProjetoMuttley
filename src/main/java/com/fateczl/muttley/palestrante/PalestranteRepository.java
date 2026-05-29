package com.fateczl.muttley.palestrante;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PalestranteRepository extends JpaRepository<Palestrante, Long> {
    Optional<Palestrante> findByEmail(String email);
}
