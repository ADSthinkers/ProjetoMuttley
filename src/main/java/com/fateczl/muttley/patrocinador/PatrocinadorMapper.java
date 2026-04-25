package com.fateczl.muttley.patrocinador;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PatrocinadorMapper {

    PatrocinadorDTO toDTO(Patrocinador entity);

    @Mapping(target = "id", ignore = true)
    Patrocinador toEntity(PatrocinadorDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(PatrocinadorDTO dto, @MappingTarget Patrocinador entity);
}
