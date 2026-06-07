package com.fateczl.muttley.participante;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParticipanteRepository extends JpaRepository<Participante, Long> {

    Optional<Participante> findByCpfAndEmail(String cpf, String email);

    Optional<Participante> findByCpf(String cpf);

    boolean existsByCpf(String cpf);
}
