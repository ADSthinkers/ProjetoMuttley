package com.fateczl.muttley.xp;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")

public interface XpMapper {
    XpDTO toXpDTO (Xp xp);

    @Mapping(target = "id", ignore = true)
    Xp toEntityFromXp (XpDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromXp(XpDTO dto, @MappingTarget Xp xp);
}
