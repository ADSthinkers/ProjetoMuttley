package com.fateczl.muttley.usuario;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of ="id")

public class Usuario {

    @Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name = "usuario_id")
	private Long id;
	private String login;
    private String senha;
    private String nome;
    private String cpf;
    private String email;

    public Usuario(AtualizacaoUsuario dados){//const baseado no DTO seguindo model  
       // this.id = dados.id(); ? ponho?
        this.login = dados.login();
        this.senha = dados.senha();
        this.nome = dados.nome();
        this.cpf = dados.cpf();
        this.email = dados.email();
    } 
    public void atualizarInformacoes(AtualizacaoUsuario dados){
        if(dados.login() != null){
            this.login = dados.login(); //isso existe ou eh delirio?
        }
        if(dados.senha() != null){
            this.senha = dados.senha();
        }
        if(dados.nome() != null){
            this.nome = dados.nome();
        }
        if(dados.cpf() != null){
            this.cpf = dados.cpf();
        }
        if(dados.email() != null){
            this.email = dados.email();
        }
    }

}
