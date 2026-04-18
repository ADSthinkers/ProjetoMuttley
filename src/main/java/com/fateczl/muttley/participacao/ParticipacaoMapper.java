
package com.fateczl.muttley.participacao;
 
import com.fateczl.muttley.aluno.Aluno;
import com.fateczl.muttley.aluno.AlunoRepository;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestra.PalestraRepository;
 
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
 
@Mapper(componentModel = "spring")
public abstract class ParticipacaoMapper {
 
    @Autowired
    protected AlunoRepository alunoRepository;
 
    @Autowired
    protected PalestraRepository palestraRepository;
 
    @Mapping(target = "alunoId",    source = "aluno.id")
    @Mapping(target = "palestraId", source = "palestra.id")
    public abstract ParticipacaoDTO toDTO(Participacao participacao);
 
    @Mapping(target = "id",       ignore = true)
    @Mapping(target = "aluno",    expression = "java(buscarAluno(dto.alunoId()))")
    @Mapping(target = "palestra", expression = "java(buscarPalestra(dto.palestraId()))")
    public abstract Participacao toEntity(ParticipacaoDTO dto);
 
    @Mapping(target = "id",       ignore = true)
    @Mapping(target = "aluno",    expression = "java(buscarAluno(dto.alunoId()))")
    @Mapping(target = "palestra", expression = "java(buscarPalestra(dto.palestraId()))")
    public abstract void updateEntity(ParticipacaoDTO dto, @MappingTarget Participacao participacao);
 
    @Mapping(target = "alunoNome",       source = "aluno.nome")
    @Mapping(target = "palestinaTitulo", source = "palestra.titulo")
    public abstract ParticipacaoListagem toListagemDto(Participacao participacao);
 
    protected Aluno buscarAluno(Long id) {
        return id == null ? null : alunoRepository.findById(id).orElse(null);
    }
 
    protected Palestra buscarPalestra(Long id) {
        return id == null ? null : palestraRepository.findById(id).orElse(null);
    }
}