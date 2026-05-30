package com.fateczl.muttley.config;

import com.fateczl.muttley.admin.AdminRepository;
import com.fateczl.muttley.palestrante.PalestranteRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// serviço de autenticação que carrega admin ou palestrante pelo login para o Spring Security
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final PalestranteRepository palestranteRepository;

    public UsuarioDetailsService(AdminRepository adminRepository,
                                  PalestranteRepository palestranteRepository) {
        this.adminRepository = adminRepository;
        this.palestranteRepository = palestranteRepository;
    }

    // busca o usuário pelo login verificando admins e palestrantes, e atribui o papel correspondente
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var admin = adminRepository.findByLogin(username);
        if (admin.isPresent()) {
            return User.builder()
                    .username(admin.get().getLogin())
                    .password(admin.get().getSenha())
                    .roles("ADMIN")
                    .build();
        }

        var palestrante = palestranteRepository.findByEmail(username);
        if (palestrante.isPresent()) {
            return User.builder()
                    .username(palestrante.get().getEmail())
                    .password(palestrante.get().getSenha())
                    .roles("PALESTRANTE")
                    .build();
        }

        throw new UsernameNotFoundException("Usuário não encontrado: " + username);
    }
}
