package com.fateczl.muttley.participante;

import org.mapstruct.*;

// mapper responsável por converter entre a entidade Participante e seus DTOs
@Mapper(componentModel = "spring")
public interface ParticipanteMapper {

    ParticipanteDTO toAtualizacaoDto(Participante participante);

    @Mapping(target = "id", ignore = true)
    Participante toEntity(ParticipanteDTO dto);

    @Mapping(target = "id", ignore = true)
    void updateEntity(ParticipanteDTO dto, @MappingTarget Participante participante);

    ParticipanteListagem toListagemDto(Participante participante);
}
