package com.fateczl.muttley.admin;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AdminMapper {

    // Se o erro diz linha 8, verifique se aqui não está escrito AdminDTO
    AdminAtualizacao toAtualizacaoDto(Admin admin);

    @Mapping(target = "id", ignore = true)
    Admin toEntity(AdminAtualizacao dto);

    @Mapping(target = "id", ignore = true)
    void updateEntity(AdminAtualizacao dto, @MappingTarget Admin admin);

    AdminListagem toListagemDto(Admin admin);
}
