package com.fateczl.muttley.admin;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AdminMapper {

    AtualizacaoAdmin toAtualizacaoDto(Admin admin);

    @Mapping(target = "id", ignore = true)
    Admin toEntity(AtualizacaoAdmin dto);

    @Mapping(target = "id", ignore = true)
    void updateEntity(AtualizacaoAdmin dto, @MappingTarget Admin admin);

    ListagemAdmin toListagemDto(Admin admin);
}