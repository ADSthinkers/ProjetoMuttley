package com.fateczl.muttley.apresentacao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApresentacaoRepository extends JpaRepository<Apresentacao, Long> {

    List<Apresentacao> findByPalestraId(Long palestraId);

    List<Apresentacao> findByPalestranteId(Long palestranteId);

    Optional<Apresentacao> findByPalestranteIdAndPalestraId(Long palestranteId, Long palestraId);
}
