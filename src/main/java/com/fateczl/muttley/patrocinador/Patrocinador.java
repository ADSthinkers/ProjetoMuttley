package com.fateczl.muttley.patrocinador;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "patrocinador")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
// entidade que representa um patrocinador PJ ou PF com dados de contato, endereço e redes sociais
public class Patrocinador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Tipo é obrigatório")
    @Enumerated(EnumType.STRING)
    private TipoPatrocinador tipo;

    // Dados PJ
    private String razaoSocial;
    private String nomeFantasia;
    private String cnpj;
    private String inscricaoEstadual;

    // Dados PF
    private String nomeCompleto;
    private String cpf;

    // Dados de Contato
    @NotBlank(message = "Telefone é obrigatório")
    private String telefone;

    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    private String email;

    @NotBlank(message = "Nome do responsável é obrigatório")
    private String nomeResponsavel;

    // Localização
    @NotBlank(message = "Logradouro é obrigatório")
    private String logradouro;

    @NotBlank(message = "Número é obrigatório")
    private String numero;

    private String complemento;

    @NotBlank(message = "Bairro é obrigatório")
    private String bairro;

    @NotBlank(message = "CEP é obrigatório")
    private String cep;

    @NotBlank(message = "Cidade é obrigatória")
    private String cidade;

    @NotBlank(message = "UF é obrigatória")
    private String uf;

    // Social
    private String linkedin;

    // retorna o nome de exibição conforme o tipo, priorizando nome fantasia para PJ
    public String getNomeExibicao() {
        if (tipo == TipoPatrocinador.PJ) {
            return nomeFantasia != null ? nomeFantasia : razaoSocial;
        }
        return nomeCompleto;
    }
}
