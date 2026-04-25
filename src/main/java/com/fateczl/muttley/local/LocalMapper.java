package com.fateczl.muttley.local;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface LocalMapper {

    LocalDTO toLocalDTO(Local local);

    @Mapping(target = "id", ignore = true)
    Local toEntityFromDTO(LocalDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(LocalDTO dto, @MappingTarget Local local);
}
