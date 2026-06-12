package com.fateczl.muttley.palestra;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.palestrante.Palestrante;
import org.mapstruct.*;

import java.util.List;

// mapper responsável por converter entre a entidade Palestra e seus DTOs
@Mapper(componentModel = "spring")
public interface PalestraMapper {

    @Mapping(target = "competenciaIds", source = "competencias", qualifiedByName = "competenciasToIds")
    @Mapping(target = "palestranteIds", source = "palestrantes", qualifiedByName = "palestrantesToIds")
    @Mapping(target = "eventoId", source = "evento.id")
    @Mapping(target = "localId", source = "local.id")
    @Mapping(target = "patrocinadorId", source = "patrocinador.id")
    PalestraDTO toDto(Palestra palestra);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencias", ignore = true)
    @Mapping(target = "apresentacoes", ignore = true)
    @Mapping(target = "palestrantes", ignore = true)
    @Mapping(target = "evento", ignore = true)
    @Mapping(target = "local", ignore = true)
    @Mapping(target = "qrCodeToken", ignore = true)
    @Mapping(target = "qrCodeCheckinToken", ignore = true)
    @Mapping(target = "patrocinador", ignore = true)
    Palestra toEntity(PalestraDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competencias", ignore = true)
    @Mapping(target = "apresentacoes", ignore = true)
    @Mapping(target = "palestrantes", ignore = true)
    @Mapping(target = "evento", ignore = true)
    @Mapping(target = "local", ignore = true)
    @Mapping(target = "qrCodeToken", ignore = true)
    @Mapping(target = "qrCodeCheckinToken", ignore = true)
    @Mapping(target = "patrocinador", ignore = true)
    void updateEntityFromDto(PalestraDTO dto, @MappingTarget Palestra palestra);

    @Named("competenciasToIds")
    default List<Long> competenciasToIds(List<Competencia> competencias) {
        if (competencias == null) return null;
        return competencias.stream().map(Competencia::getId).toList();
    }

    @Named("palestrantesToIds")
    default List<Long> palestrantesToIds(List<Palestrante> palestrantes) {
        if (palestrantes == null) return null;
        return palestrantes.stream().map(Palestrante::getId).toList();
    }
}
