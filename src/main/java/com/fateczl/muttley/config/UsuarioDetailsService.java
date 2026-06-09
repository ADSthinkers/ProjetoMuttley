package com.fateczl.muttley.config;

import com.fateczl.muttley.admin.AdminRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// serviço de autenticação que carrega administradores pelo login para o Spring Security
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;

    public UsuarioDetailsService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    // busca o usuário pelo login verificando apenas administradores
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

        throw new UsernameNotFoundException("Usuário não encontrado: " + username);
    }
}
