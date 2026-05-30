package com.fateczl.muttley.config;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    private final UsuarioDetailsService usuarioDetailsService;
    private final PasswordEncoder passwordEncoder;

    public AuthApiController(UsuarioDetailsService usuarioDetailsService, PasswordEncoder passwordEncoder) {
        this.usuarioDetailsService = usuarioDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @PublicRoute
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            UserDetails user = usuarioDetailsService.loadUserByUsername(request.login());
            if (!passwordEncoder.matches(request.senha(), user.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("message", "Login ou senha inválidos."));
            }

            String role = user.getAuthorities().stream()
                    .findFirst()
                    .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                    .orElse("USER");

            return ResponseEntity.ok(new LoginResponse(user.getUsername(), role));
        } catch (Exception exception) {
            return ResponseEntity.status(401).body(Map.of("message", "Login ou senha inválidos."));
        }
    }

    public record LoginRequest(String login, String senha) {}
    public record LoginResponse(String login, String role) {}
}
