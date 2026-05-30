package com.fateczl.muttley.palestrante;

import org.mapstruct.*;

// mapper responsável por converter entre a entidade Palestrante e seus DTOs de atualização e listagem
@Mapper(componentModel = "spring")
public interface PalestranteMapper {

    PalestranteDTO toAtualizacaoDto(Palestrante palestrante);

    @Mapping(target = "id", ignore = true)
    Palestrante toEntity(PalestranteDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntity(PalestranteDTO dto, @MappingTarget Palestrante palestrante);

    PalestranteListagem toListagemDto(Palestrante palestrante);
}
