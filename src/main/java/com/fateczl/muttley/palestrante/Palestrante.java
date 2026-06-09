package com.fateczl.muttley.palestrante;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

// entidade que representa um palestrante com dados de perfil
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Palestrante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    private String cpf;

    @Email(message = "E-mail inválido")
    private String email;

    @Column(length = 1000)
    private String miniCurriculo;

    private String formacao;

    private String areaAtuacao;

    private String instituicao;

    private String linkedin;

    private String foto;
}
