package com.fateczl.muttley.admin;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AdminMapper {

    AdminDTO toAtualizacaoDto(Admin admin);

    @Mapping(target = "id", ignore = true)
    Admin toEntity(AdminDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntity(AdminDTO dto, @MappingTarget Admin admin);

    AdminListagem toListagemDto(Admin admin);
}
