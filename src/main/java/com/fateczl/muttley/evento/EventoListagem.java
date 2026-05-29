package com.fateczl.muttley.evento;

import com.fateczl.muttley.tipo.Modalidade;

import java.time.LocalDate;

public record EventoListagem(
    Long id,
    String titulo,
    String descricao,
    LocalDate dataInicio,
    LocalDate dataFim,
    String localNome,
    String categoria,
    Modalidade modalidade,
    Integer vagas,
    String banner,
    String patrocinadorNome
) {}
