package com.fateczl.muttley.certificado;

import com.fateczl.muttley.palestra.Palestra;
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
    @JoinColumn(name = "palestra_id")
    private Palestra palestra;

    private LocalDateTime dataEmissao;

    private Float cargaHoraria;

    @Column(unique = true)
    private String codigoValidacao;

    @PrePersist
    private void prePersist() {
        if (codigoValidacao == null) codigoValidacao = UUID.randomUUID().toString();
        if (dataEmissao == null) dataEmissao = LocalDateTime.now();
    }
}
