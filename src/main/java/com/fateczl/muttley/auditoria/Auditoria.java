package com.fateczl.muttley.auditoria;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// entidade que registra ações realizadas no sistema para fins de rastreabilidade
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private AcaoAuditoria acao;

    private String entidade;
    private Long entidadeId;

    @Column(length = 1000)
    private String descricao;

    private LocalDateTime dataHora;

    private String realizadoPor;

    // preenche automaticamente a data e hora caso não informada antes de persistir
    @PrePersist
    private void prePersist() {
        if (dataHora == null) dataHora = LocalDateTime.now();
    }
}
