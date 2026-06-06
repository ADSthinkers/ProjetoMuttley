package com.fateczl.muttley.evento;

import org.mapstruct.*;

// mapper responsável por converter entre a entidade Evento e seus DTOs de listagem e atualização
@Mapper(componentModel = "spring")
public interface EventoMapper {

    @Mapping(target = "patrocinadorId", source = "patrocinador.id")
    @Mapping(target = "categoriaId", source = "categoria.id")
    EventoDTO toAtualizacaoDto(Evento evento);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "palestras", ignore = true)
    @Mapping(target = "patrocinador", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    Evento toEntity(EventoDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "palestras", ignore = true)
    @Mapping(target = "patrocinador", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    void updateEntity(EventoDTO dto, @MappingTarget Evento evento);

    @Mapping(target = "patrocinadorNome", expression = "java(evento.getPatrocinador() != null ? evento.getPatrocinador().getNomeExibicao() : null)")
    @Mapping(target = "categoria", expression = "java(evento.getCategoria() != null ? evento.getCategoria().getNome() : null)")
    EventoListagem toListagemDto(Evento evento);
}
