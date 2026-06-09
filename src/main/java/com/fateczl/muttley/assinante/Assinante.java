package com.fateczl.muttley.assinante;

import com.fateczl.muttley.evento.Evento;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

// entidade que representa uma pessoa autorizada a assinar documentos de eventos
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Assinante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotBlank(message = "CPF é obrigatório")
    private String cpf;

    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    private String email;

    @NotBlank(message = "Cargo é obrigatório")
    private String cargo;

    @Lob
    @NotNull(message = "Assinatura é obrigatória")
    private byte[] assinatura;

    @ManyToMany(mappedBy = "assinantes")
    private List<Evento> eventos;
}
