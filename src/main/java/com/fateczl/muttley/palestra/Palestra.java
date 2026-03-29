package com.fateczl.muttley.palestra;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//import org.springframework.web.bind.annotation.SessionAttributes;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="palestra")
@Getter
@Setter 
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of ="id")

public class Palestra {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private String titulo;
    //private List<Competencia> competencias;
    //private List<String> palestrantes;
    private LocalDateTime inicio;
    private LocalDateTime fim;
}

