package com.fateczl.muttley.inscricao;

import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.participante.Participante;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

// entidade que representa a inscrição de um participante em uma palestra com token QR Code
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

    private LocalDateTime dataCheckin;

    @Enumerated(EnumType.STRING)
    private StatusInscricao status;

    @Column(unique = true)
    private String qrCodeToken;

    // preenche data de inscrição, status inicial PENDENTE e token QR Code únicos antes de persistir
    @PrePersist
    private void prePersist() {
        if (dataInscricao == null) dataInscricao = LocalDateTime.now();
        if (status == null) status = StatusInscricao.PENDENTE;
        if (qrCodeToken == null) qrCodeToken = UUID.randomUUID().toString();
    }
}
