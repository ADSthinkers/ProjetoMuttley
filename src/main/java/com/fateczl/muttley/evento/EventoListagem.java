package com.fateczl.muttley.evento;

import com.fateczl.muttley.tipo.Modalidade;

import java.time.LocalDate;
import java.util.List;

public record EventoListagem(
    Long id,
    String titulo,
    String descricao,
    LocalDate dataInicio,
    LocalDate dataFim,
    String categoria,
    Modalidade modalidade,
    String banner,
    String patrocinadorNome,
    List<String> assinantes
) {}
