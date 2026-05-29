package com.fateczl.muttley.certificado;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.participante.Participante;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Certificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "participante_id")
    private Participante participante;

    @ManyToOne
    @JoinColumn(name = "palestrante_id")
    private Palestrante palestrante;

    @ManyToOne
    @JoinColumn(name = "palestra_id")
    private Palestra palestra;

    private LocalDateTime dataEmissao;

    private Float cargaHoraria;

    @Column(unique = true)
    private String codigoValidacao;

    @Enumerated(EnumType.STRING)
    private TipoCertificado tipo;

    @PrePersist
    private void prePersist() {
        if (codigoValidacao == null) codigoValidacao = UUID.randomUUID().toString();
        if (dataEmissao == null) dataEmissao = LocalDateTime.now();
        if (tipo == null) tipo = TipoCertificado.PARTICIPACAO;
    }

    public String getNomeTitular() {
        if (palestrante != null) return palestrante.getNome();
        if (participante != null) return participante.getNome();
        return "Titular";
    }

    public String getEmailTitular() {
        if (palestrante != null) return palestrante.getEmail();
        if (participante != null) return participante.getEmail();
        return null;
    }
}
