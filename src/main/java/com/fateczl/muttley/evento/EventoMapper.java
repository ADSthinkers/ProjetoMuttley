package com.fateczl.muttley.evento;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EventoMapper {

    @Mapping(target = "localId", source = "local.id")
    @Mapping(target = "patrocinadorId", source = "patrocinador.id")
    EventoDTO toAtualizacaoDto(Evento evento);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "palestras", ignore = true)
    @Mapping(target = "local", ignore = true)
    @Mapping(target = "patrocinador", ignore = true)
    Evento toEntity(EventoDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "palestras", ignore = true)
    @Mapping(target = "local", ignore = true)
    @Mapping(target = "patrocinador", ignore = true)
    void updateEntity(EventoDTO dto, @MappingTarget Evento evento);

    @Mapping(target = "localNome", source = "local.nome")
    @Mapping(target = "patrocinadorNome", expression = "java(evento.getPatrocinador() != null ? evento.getPatrocinador().getNomeExibicao() : null)")
    EventoListagem toListagemDto(Evento evento);
}
