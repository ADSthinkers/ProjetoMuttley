package com.fateczl.muttley.xp;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface XpMapper {

    @Mapping(source = "competencia.id", target = "competenciaId")
    @Mapping(source = "participante.id", target = "participanteId")
    XpDTO toXpDTO(Xp xp);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencia", ignore = true)
    @Mapping(target = "participante", ignore = true)
    Xp toEntityFromXp(XpDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencia", ignore = true)
    @Mapping(target = "participante", ignore = true)
    void updateEntityFromXp(XpDTO dto, @MappingTarget Xp xp);
}
