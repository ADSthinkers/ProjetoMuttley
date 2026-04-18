package com.fateczl.muttley.xp;

import com.fateczl.muttley.aluno.Aluno;
import com.fateczl.muttley.competencia.Competencia;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "xp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of ="id")

//linha 41

public class Xp {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column (name = "xp_id")

    private long id;
    private float horas;

        @ManyToOne
    @JoinColumn(name = "competencia_id")
    private Competencia competencia;

    @ManyToOne
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;
    
    public Xp(XpDTO dados) {
        this.horas = dados.horas();
    }

    public void atualizarInformacoes(XpDTO dados) {
        if (dados.horas() != 0.0)
            this.horas = dados.horas();
    }
    
}