package com.fateczl.muttley.competencia;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

// mapper responsável por converter entre a entidade Competencia e seus DTOs
@Mapper(componentModel = "spring")
public interface CompetenciaMapper {

    // converte a entidade para DTO para preencher formulário de edição
    CompetenciaDTO toCompetenciaDTO (Competencia competencia);

    // converte o DTO para entidade para criação nova, ignorando o id
    @Mapping(target = "id", ignore = true)
    Competencia toEntityFromDTO (CompetenciaDTO dto);

    // atualiza a entidade existente com os dados do DTO, preservando o id
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(CompetenciaDTO dto, @MappingTarget Competencia competencia);



}
