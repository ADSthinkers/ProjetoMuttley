package com.fateczl.muttley.competencia;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CompetenciaMapper {
    
    // Converte Entity para DTO (para preencher formulário de edição)
    CompetenciaDTO toCompetenciaDTO (Competencia competencia);
    
    // Converte DTO para Entity (para criação NOVA - ignora ID)
    @Mapping(target = "id", ignore = true)
    Competencia toEntityFromDTO (CompetenciaDTO dto);

    // Atualiza Entity existente com dados do DTO
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(CompetenciaDTO dto, @MappingTarget Competencia competencia);



}
