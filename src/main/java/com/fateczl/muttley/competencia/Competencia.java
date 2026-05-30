package com.fateczl.muttley.competencia;
//import org.hibernate.annotations.ManyToAny;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

// entidade que representa uma competência técnica ou comportamental associada a palestras
public class Competencia {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column (name = "competencia_id")
    
    private Long id;
    private String nome;

    @Enumerated(EnumType.STRING)
    private TipoCompetencia tipo;
//    @JoinColumn(name = "competencia_id", referencedColumnName = "competencia_id")

    // cria uma competência a partir dos dados do DTO recebido
    public Competencia(CompetenciaDTO dados) {
        this.nome = dados.nome();
    }
    
    // atualiza o nome da competência com os dados fornecidos no DTO
    public void atualizarInformacoes(CompetenciaDTO dados) {
        if (dados.nome() != null )
            this.nome = dados.nome();
    }
}
