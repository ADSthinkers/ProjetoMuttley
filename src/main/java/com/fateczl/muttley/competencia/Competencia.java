package com.fateczl.muttley.competencia;
//import org.hibernate.annotations.ManyToAny;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
//import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "competencia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of ="id")

public class Competencia {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column (name = "competencia_id")
    
    private Long id;
    private String nome;
//    @JoinColumn(name = "competencia_id", referencedColumnName = "competencia_id")

    public Competencia(CompetenciaDTO dados) {
        this.nome = dados.nome();
    }
    
    public void atualizarInformacoes(CompetenciaDTO dados) {
        if (dados.nome() != null )
            this.nome = dados.nome();
    }
}
