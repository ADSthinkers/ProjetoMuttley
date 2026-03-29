package com.fateczl.muttley.palestra;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
@Transactional
public interface PalestraRepository  extends JpaRepository<Palestra, Long>{}