package com.fateczl.muttley.certificado;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.participacao.Participacao;
import com.fateczl.muttley.participante.Participante;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "certificado_participacao",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_certificado_participacao",
        columnNames = "participacao_id"
    )
)
@DiscriminatorValue("PARTICIPACAO")
@Getter
@Setter
@NoArgsConstructor
public class CertificadoParticipacao extends Certificado {

    @OneToOne(optional = false)
    @JoinColumn(name = "participacao_id", nullable = false, unique = true)
    private Participacao participacao;

    public CertificadoParticipacao(Participacao participacao) {
        this.participacao = participacao;
        setTipo(TipoCertificado.PARTICIPACAO);
    }

    @PrePersist
    @PreUpdate
    private void preencherTipo() {
        setTipo(TipoCertificado.PARTICIPACAO);
    }

    @Override
    public Participante getParticipante() {
        return participacao != null ? participacao.getParticipante() : null;
    }

    @Override
    public Palestra getPalestra() {
        return participacao != null ? participacao.getPalestra() : null;
    }
}
