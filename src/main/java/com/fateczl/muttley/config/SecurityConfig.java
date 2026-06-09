package com.fateczl.muttley.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

// configura as regras de segurança, autenticação e autorização da aplicação
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UsuarioDetailsService usuarioDetailsService;

    public SecurityConfig(UsuarioDetailsService usuarioDetailsService) {
        this.usuarioDetailsService = usuarioDetailsService;
    }

    // define o encoder de senhas BCrypt para ser utilizado na autenticação
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // configura o provedor de autenticação ligando o serviço de usuários ao encoder de senha
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(usuarioDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // define as permissões de acesso por rota, login form e configurações de logout
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
            .authenticationProvider(authenticationProvider())
            .authorizeHttpRequests(auth -> auth
                // rotas públicas
                .requestMatchers("/login", "/error", "/participar/**", "/api/**").permitAll()
                .requestMatchers(
                    "/admin/**", "/evento/**", "/local/**", "/patrocinador/**",
                    "/competencia/**", "/medalha/**", "/xp/**", "/palestra/**",
                    "/palestrante/**", "/assinante/**", "/presencas/**",
                    "/participante/**", "/participacao/**", "/auditoria/**"
                ).hasRole("ADMIN")
                .anyRequest().hasRole("ADMIN")
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard", true)
                .failureUrl("/login?erro=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?saiu=true")
                .permitAll()
            );

        return http.build();
    }
}
