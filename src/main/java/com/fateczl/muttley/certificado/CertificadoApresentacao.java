package com.fateczl.muttley.certificado;

import com.fateczl.muttley.apresentacao.Apresentacao;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestrante.Palestrante;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "certificado_apresentacao",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_certificado_apresentacao",
        columnNames = "apresentacao_id"
    )
)
@DiscriminatorValue("APRESENTACAO")
@Getter
@Setter
@NoArgsConstructor
public class CertificadoApresentacao extends Certificado {

    @OneToOne(optional = false)
    @JoinColumn(name = "apresentacao_id", nullable = false, unique = true)
    private Apresentacao apresentacao;

    public CertificadoApresentacao(Apresentacao apresentacao) {
        this.apresentacao = apresentacao;
        setTipo(TipoCertificado.APRESENTACAO);
    }

    @PrePersist
    @PreUpdate
    private void preencherTipo() {
        setTipo(TipoCertificado.APRESENTACAO);
    }

    @Override
    public Palestrante getPalestrante() {
        return apresentacao != null ? apresentacao.getPalestrante() : null;
    }

    @Override
    public Palestra getPalestra() {
        return apresentacao != null ? apresentacao.getPalestra() : null;
    }
}
