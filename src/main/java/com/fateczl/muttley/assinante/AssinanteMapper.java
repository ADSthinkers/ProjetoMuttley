package com.fateczl.muttley.assinante;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

// mapper responsável por converter entre Assinante e seus DTOs
@Mapper(componentModel = "spring")
public interface AssinanteMapper {

    AssinanteDTO toDTO(Assinante assinante);

    AssinanteListagem toListagemDTO(Assinante assinante);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "eventos", ignore = true)
    Assinante toEntity(AssinanteDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "eventos", ignore = true)
    void updateEntityFromDto(AssinanteDTO dto, @MappingTarget Assinante assinante);
}
