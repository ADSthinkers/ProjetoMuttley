package com.fateczl.muttley.certificado;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.participante.Participante;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

// entidade base para certificados emitidos por participacao ou apresentacao
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "tipo_origem")
public class Certificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime dataEmissao;

    private Float cargaHoraria;

    @Column(unique = true)
    private String codigoValidacao;

    @Enumerated(EnumType.STRING)
    private TipoCertificado tipo;

    // garante código de validação único, data de emissão e tipo padrão antes de persistir
    @PrePersist
    private void prePersist() {
        if (codigoValidacao == null) codigoValidacao = UUID.randomUUID().toString();
        if (dataEmissao == null) dataEmissao = LocalDateTime.now();
        if (tipo == null) tipo = TipoCertificado.PARTICIPACAO;
    }

    public Participante getParticipante() {
        return null;
    }

    public Palestrante getPalestrante() {
        return null;
    }

    public Palestra getPalestra() {
        return null;
    }

    // retorna o nome do titular do certificado, priorizando palestrante sobre participante
    public String getNomeTitular() {
        Palestrante palestrante = getPalestrante();
        Participante participante = getParticipante();
        if (palestrante != null) return palestrante.getNome();
        if (participante != null) return participante.getNome();
        return "Titular";
    }

    // retorna o e-mail do titular do certificado, priorizando palestrante sobre participante
    public String getEmailTitular() {
        Palestrante palestrante = getPalestrante();
        Participante participante = getParticipante();
        if (palestrante != null) return palestrante.getEmail();
        if (participante != null) return participante.getEmail();
        return null;
    }
}
