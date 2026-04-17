package com.fateczl.muttley.xp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
public class Xp {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name = "xp_id")
    private long id;
    private String horas;
    
    public Xp(XpDTO dados) {
        this.horas = dados.horas();
    }

    public void atualizarInformacoes(XpDTO dados) {
    
    }
    
}