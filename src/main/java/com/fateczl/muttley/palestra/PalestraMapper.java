package com.fateczl.muttley.palestra;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import com.fateczl.muttley.competencia.Competencia;

@Mapper(componentModel = "spring")
public interface PalestraMapper {

    //Entity para DTO
    @Mapping(target = "competenciaIds", source = "competencias", qualifiedByName = "competenciasToIds")
    PalestraDTO toDto(Palestra palestra);

    // DTO para Entity - Criação
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencias", ignore = true)
    Palestra toEntity(PalestraDTO dto);

    //DTO para Entity - Atualização
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencias", ignore = true)
    void updateEntityFromDto(PalestraDTO dto, @MappingTarget Palestra palestra);

    @Named("competenciasToIds")
    default List<Long> competenciasToIds(List<Competencia> competencias) {
        if (competencias == null) return null;

        return competencias.stream()
            .map(Competencia::getId)
            .toList();
    }
}
