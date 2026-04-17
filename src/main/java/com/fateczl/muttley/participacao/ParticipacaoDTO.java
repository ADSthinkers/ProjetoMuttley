package com.fateczl.muttley.participacao;
 
public record ParticipacaoDTO(
    Long id,
    Float horas,
    Long alunoId,
    Long palestraId
) {}
 