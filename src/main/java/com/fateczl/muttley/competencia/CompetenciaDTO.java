package com.fateczl.muttley.competencia;

//import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
//import jakarta.validation.constraints.Positive;

public record CompetenciaDTO(
	    Long id,
	    @NotBlank(message = "Nome é obrigatório") 
	    String nome
	) {}
