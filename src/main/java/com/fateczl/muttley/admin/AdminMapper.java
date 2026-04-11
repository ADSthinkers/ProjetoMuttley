package com.fateczl.muttley.admin;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AdminMapper {

    AdminAtualizacao toAtualizacaoDto(Admin admin);

    @Mapping(target = "id", ignore = true)
    Admin toEntity(AdminAtualizacao dto);

    @Mapping(target = "id", ignore = true)
    void updateEntity(AdminAtualizacao dto, @MappingTarget Admin admin);

    AdminListagem toListagemDto(Admin admin);
}