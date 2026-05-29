package com.fateczl.muttley.palestra;

import java.time.LocalDateTime;
import java.util.List;

import com.fateczl.muttley.competencia.Competencia;

public record ListagemPalestra(
    Long id,
    String titulo,
    String descricao,
    List<Competencia> competencias,
    List<String> palestrantes,
    LocalDateTime inicio,
    LocalDateTime fim,
    StatusPalestra status,
    String patrocinadorNome
) {}
