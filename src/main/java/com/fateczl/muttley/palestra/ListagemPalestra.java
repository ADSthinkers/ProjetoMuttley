package com.fateczl.muttley.palestra;

import java.time.LocalDateTime;
import java.util.List;

import com.fateczl.muttley.competencia.Competencia;

public record ListagemPalestra(
    Long id,
    String titulo,
    String descricao,
    List<Competencia> competencias,
    LocalDateTime inicio,
    LocalDateTime fim
) {}