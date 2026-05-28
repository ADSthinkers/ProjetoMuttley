package com.fateczl.muttley.xp;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface XpMapper {

    @Mapping(source = "competencia.id", target = "competenciaId")
    @Mapping(source = "aluno.id", target = "alunoId")
    XpDTO toXpDTO(Xp xp);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencia", ignore = true)
    @Mapping(target = "aluno", ignore = true)
    Xp toEntityFromXp(XpDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencia", ignore = true)
    @Mapping(target = "aluno", ignore = true)
    void updateEntityFromXp(XpDTO dto, @MappingTarget Xp xp);
}