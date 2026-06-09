package com.fateczl.muttley.evento;

import com.fateczl.muttley.assinante.Assinante;
import org.mapstruct.*;

import java.util.List;

// mapper responsável por converter entre a entidade Evento e seus DTOs de listagem e atualização
@Mapper(componentModel = "spring")
public interface EventoMapper {

    @Mapping(target = "patrocinadorId", source = "patrocinador.id")
    @Mapping(target = "categoriaId", source = "categoria.id")
    @Mapping(target = "assinanteIds", source = "assinantes", qualifiedByName = "assinantesToIds")
    EventoDTO toAtualizacaoDto(Evento evento);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "palestras", ignore = true)
    @Mapping(target = "assinantes", ignore = true)
    @Mapping(target = "patrocinador", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    Evento toEntity(EventoDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "palestras", ignore = true)
    @Mapping(target = "assinantes", ignore = true)
    @Mapping(target = "patrocinador", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    void updateEntity(EventoDTO dto, @MappingTarget Evento evento);

    @Mapping(target = "patrocinadorNome", expression = "java(evento.getPatrocinador() != null ? evento.getPatrocinador().getNomeExibicao() : null)")
    @Mapping(target = "categoria", expression = "java(evento.getCategoria() != null ? evento.getCategoria().getNome() : null)")
    @Mapping(target = "assinantes", expression = "java(evento.getAssinantes() != null ? evento.getAssinantes().stream().map(com.fateczl.muttley.assinante.Assinante::getNome).toList() : java.util.List.of())")
    EventoListagem toListagemDto(Evento evento);

    @Named("assinantesToIds")
    default List<Long> assinantesToIds(List<Assinante> assinantes) {
        if (assinantes == null) return null;
        return assinantes.stream().map(Assinante::getId).toList();
    }
}
