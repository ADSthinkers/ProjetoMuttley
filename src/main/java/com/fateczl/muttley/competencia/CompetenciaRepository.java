package com.fateczl.muttley.competencia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public interface CompetenciaRepository extends JpaRepository<Competencia, Long> {}