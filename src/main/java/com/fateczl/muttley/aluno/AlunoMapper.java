package com.fateczl.muttley.aluno;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AlunoMapper {

    AlunoDTO toAtualizacaoDto(Aluno aluno);

    @Mapping(target = "id", ignore = true)
    Aluno toEntity(AlunoDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntity(AlunoDTO dto, @MappingTarget Aluno aluno);

    AlunoListagem toListagemDto(Aluno aluno);
}