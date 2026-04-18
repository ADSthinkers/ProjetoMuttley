package com.fateczl.muttley.palestra;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import com.fateczl.muttley.competencia.Competencia;

@Mapper(componentModel = "spring")
public interface PalestraMapper {

    // Entity → DTO
    @Mapping(target = "competenciaIds", source = "competencias", qualifiedByName = "competenciasToIds")
    @Mapping(target = "eventoId", source = "evento.id")
    PalestraDTO toDto(Palestra palestra);

    // DTO → Entity (criação)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencias", ignore = true)
    @Mapping(target = "evento", ignore = true)
    Palestra toEntity(PalestraDTO dto);

    // DTO → Entity (update)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencias", ignore = true)
    @Mapping(target = "evento", ignore = true)
    void updateEntityFromDto(PalestraDTO dto, @MappingTarget Palestra palestra);

    @Named("competenciasToIds")
    default List<Long> competenciasToIds(List<Competencia> competencias) {
        if (competencias == null) return null;

        return competencias.stream()
            .map(Competencia::getId)
            .toList();
    }
}