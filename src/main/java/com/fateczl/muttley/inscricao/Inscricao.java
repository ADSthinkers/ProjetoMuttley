package com.fateczl.muttley.inscricao;

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
public class Inscricao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "participante_id")
    private Participante participante;

    @ManyToOne
    @JoinColumn(name = "palestra_id")
    private Palestra palestra;

    private LocalDateTime dataInscricao;

    @Enumerated(EnumType.STRING)
    private StatusInscricao status;

    @Column(unique = true)
    private String qrCodeToken;

    @PrePersist
    private void prePersist() {
        if (dataInscricao == null) dataInscricao = LocalDateTime.now();
        if (status == null) status = StatusInscricao.PENDENTE;
        if (qrCodeToken == null) qrCodeToken = UUID.randomUUID().toString();
    }
}
