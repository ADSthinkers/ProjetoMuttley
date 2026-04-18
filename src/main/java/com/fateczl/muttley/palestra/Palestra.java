package com.fateczl.muttley.palestra;

import java.time.LocalDateTime;
import java.util.List;

import com.fateczl.muttley.competencia.Competencia;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.web.bind.annotation.SessionAttributes;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="palestra")
@Getter
@Setter 
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of ="id")

public class Palestra {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private String titulo;
    private String descricao;
    private List<Competencia> competencias;
    private List<String> palestrantes;
    private LocalDateTime inicio;
    private LocalDateTime fim;

    public Palestra(PalestraDTO dados, List<Competencia> competencias){
        this.titulo = dados.titulo();
        this.descricao = dados.descricao();
        this.competencias = competencias;
        this.palestrantes = dados.palestrantes();
        this.inicio = dados.inicio();
        this.fim = dados.fim();
    }

    public void atualizarInformacoes(PalestraDTO dados, List<Competencia> competencias) {
		if (dados.titulo() != null)
			this.titulo = dados.titulo();
        if (dados.descricao() != null)
			this.descricao = dados.descricao();
        if (competencias != null)
            this.competencias = competencias;
		if (dados.palestrantes() != null)
			this.palestrantes = dados.palestrantes();
		if (dados.inicio() != null)
			this.inicio = dados.inicio();
        if (dados.fim() != null)
            this.fim = dados.fim();
	}
}