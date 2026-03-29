package com.fateczl.muttley;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MuttleyApplication {

	public static void main(String[] args) {
		SpringApplication.run(MuttleyApplication.class, args);
	}

}


-- PROCEDURE PARA INSERIR PEÇA

DELIMITER //

CREATE PROCEDURE inserirPeca(
    IN p_codPeca VARCHAR(5),
    IN p_nomePeca VARCHAR(20),
    IN p_corPeca VARCHAR(20),
    IN p_pesoPeca FLOAT,
    IN p_cidadePeca VARCHAR(20)
)
BEGIN

INSERT INTO PECA (codPeca, nomePeca, corPeca, pesoPeca, cidadePeca)
VALUES (p_codPeca, p_nomePeca, p_corPeca, p_pesoPeca, p_cidadePeca);

END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE inserir5000Pecas()
BEGIN

DECLARE i INT DEFAULT 1;

WHILE i <= 5000 DO

    INSERT INTO PECA (codPeca, nomePeca, corPeca, pesoPeca, cidadePeca)
    VALUES (
        CONCAT('P', i), 
        CONCAT('Peca', i),
        CONCAT('Cor', i),
        RAND() * 100,
        CONCAT('Cidade', i)
    );

    SET i = i + 1;

END WHILE;

END //

DELIMITER ;