package com.fateczl.muttley.competencia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public interface CompetenciaRepository extends JpaRepository<Competencia, Long> {

    @Query(value = "select count(*) from palestra_competencia where competencia_id = :competenciaId", nativeQuery = true)
    long contarPalestrasAssociadas(@Param("competenciaId") Long competenciaId);
}
