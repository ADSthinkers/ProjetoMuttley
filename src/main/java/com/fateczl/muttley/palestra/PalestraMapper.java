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
    @Mapping(target = "competencia_ids", source = "competencias", qualifiedByName = "competenciasToIds")
    PalestraDTO toDto(Palestra palestra);

    // DTO para Entity - Criação
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencias", source = "competencia_ids", qualifiedByName = "idsToCompetencias")
    Palestra toEntity(PalestraDTO dto);

    //DTO para Entity - Atualização
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencias", source = "competencia_ids", qualifiedByName = "idsToCompetencias")
    void updateEntityFromDto(PalestraDTO dto, @MappingTarget Palestra palestra);

    @Named("competenciasToIds")
    default List<Long> competenciasToIds(List<Competencia> competencias) {
        if (competencias == null) return null;

        return competencias.stream()
            .map(Competencia::getId)
            .toList();
        }

    @Named("idsToCompetencias")
    default List<Competencia> idsToCompetencias(List<Long> ids) {
        if (ids == null) return null;

        return ids.stream().map(id -> {
            Competencia c = new Competencia();
            c.setId(id);
            return c;
        }).toList();
    }
}
