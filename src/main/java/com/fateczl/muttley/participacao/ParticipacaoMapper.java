package com.fateczl.muttley.participacao;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraRepository;
import com.fateczl.muttley.participante.Participante;
import com.fateczl.muttley.participante.ParticipanteRepository;

import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class ParticipacaoMapper {

    @Autowired
    protected ParticipanteRepository participanteRepository;

    @Autowired
    protected PalestraRepository palestraRepository;

    @Mapping(target = "participanteId", source = "participante.id")
    @Mapping(target = "palestraId", source = "palestra.id")
    public abstract ParticipacaoDTO toDTO(Participacao participacao);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "participante", expression = "java(buscarParticipante(dto.participanteId()))")
    @Mapping(target = "palestra", expression = "java(buscarPalestra(dto.palestraId()))")
    public abstract Participacao toEntity(ParticipacaoDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "participante", expression = "java(buscarParticipante(dto.participanteId()))")
    @Mapping(target = "palestra", expression = "java(buscarPalestra(dto.palestraId()))")
    public abstract void updateEntity(ParticipacaoDTO dto, @MappingTarget Participacao participacao);

    @Mapping(target = "participanteNome", source = "participante.nome")
    @Mapping(target = "palestraTitulo", source = "palestra.titulo")
    public abstract ParticipacaoListagem toListagemDto(Participacao participacao);

    protected Participante buscarParticipante(Long id) {
        return id == null ? null : participanteRepository.findById(id).orElse(null);
    }

    protected Palestra buscarPalestra(Long id) {
        return id == null ? null : palestraRepository.findById(id).orElse(null);
    }
}
