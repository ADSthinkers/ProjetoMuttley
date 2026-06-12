package com.fateczl.muttley.medalha;

import java.time.LocalDate;
import java.util.List;

public record MedalhaListagem(
    Long id,
    TipoMedalha tipo,
    String nome,
    String participanteNome,
    String palestraTitulo,
    LocalDate dataConquista,
    List<String> competenciasNomes,
    String competenciaNome,
    Integer nivelAlcancado
) {}
