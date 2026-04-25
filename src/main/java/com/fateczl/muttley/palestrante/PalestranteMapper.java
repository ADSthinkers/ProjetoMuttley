package com.fateczl.muttley.palestrante;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface PalestranteMapper {

    PalestranteDTO toAtualizacaoDto(Palestrante palestrante);

    @Mapping(target = "id", ignore = true)
    Palestrante toEntity(PalestranteDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntity(PalestranteDTO dto, @MappingTarget Palestrante palestrante);

    PalestranteListagem toListagemDto(Palestrante palestrante);
}
