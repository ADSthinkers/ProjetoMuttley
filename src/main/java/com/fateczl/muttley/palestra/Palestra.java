package com.fateczl.muttley.palestra;

import com.fateczl.muttley.apresentacao.Apresentacao;
import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.evento.Evento;
import com.fateczl.muttley.local.Local;
import com.fateczl.muttley.palestrante.Palestrante;
import com.fateczl.muttley.patrocinador.Patrocinador;
import com.fateczl.muttley.tipo.Modalidade;
import com.fateczl.muttley.status.StatusOperacional;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

// entidade que representa uma palestra associada a um evento com palestrantes, competências e token QR Code
@Entity
@Table(name = "palestra")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Palestra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descricao;

    @Enumerated(EnumType.STRING)
    private TipoPalestra tipo;

    @Enumerated(EnumType.STRING)
    private Modalidade modalidade;

    private Float cargaHoraria;
    private Integer vagas;
    private String banner;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "palestra_competencia",
        joinColumns = @JoinColumn(name = "palestra_id"),
        inverseJoinColumns = @JoinColumn(name = "competencia_id")
    )
    private List<Competencia> competencias;

    @OneToMany(mappedBy = "palestra", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Apresentacao> apresentacoes = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

    @ManyToOne
    @JoinColumn(name = "local_id")
    private Local local;

    private LocalDateTime inicio;
    private LocalDateTime fim;

    @Column(unique = true)
    private String qrCodeToken;

    @Column(unique = true)
    private String qrCodeCheckinToken;

    @ManyToOne
    @JoinColumn(name = "patrocinador_id")
    private Patrocinador patrocinador;

    @Enumerated(EnumType.STRING)
    private StatusPalestra status;

    @Enumerated(EnumType.STRING)
    private StatusOperacional statusOperacional;

    public List<Palestrante> getPalestrantes() {
        if (apresentacoes == null) {
            return List.of();
        }
        return apresentacoes.stream()
                .map(Apresentacao::getPalestrante)
                .filter(Objects::nonNull)
                .toList();
    }

    public void setPalestrantes(List<Palestrante> palestrantes) {
        if (apresentacoes == null) {
            apresentacoes = new ArrayList<>();
        }
        apresentacoes.clear();
        if (palestrantes == null) {
            return;
        }
        palestrantes.stream()
                .filter(Objects::nonNull)
                .distinct()
                .forEach(palestrante -> apresentacoes.add(new Apresentacao(this, palestrante)));
    }
}
