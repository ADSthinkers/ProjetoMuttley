package com.fateczl.muttley.evento;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EventoMapper {

    EventoDTO toAtualizacaoDto(Evento evento);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "palestras", ignore = true)
    Evento toEntity(EventoDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "palestras", ignore = true)
    void updateEntity(EventoDTO dto, @MappingTarget Evento evento);

    EventoListagem toListagemDto(Evento evento);
}