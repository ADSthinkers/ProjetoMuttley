package com.fateczl.muttley.palestra;

import java.time.LocalDateTime;
import java.util.List;

import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.evento.Evento;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "palestra_competencia",
        joinColumns = @JoinColumn(name = "palestra_id"),
        inverseJoinColumns = @JoinColumn(name = "competencia_id")
    )
    private List<Competencia> competencias;

    @ElementCollection
    private List<String> palestrantes;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

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