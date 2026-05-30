package com.fateczl.muttley.config;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// controlador responsável pela tela de login e redirecionamento ao dashboard após autenticação
@Controller
public class LoginController {

    // exibe a tela de login da aplicação
    @GetMapping("/login")
    public String login() {
        return "login";
    }

    // redireciona o usuário para a página correta após login com base no seu papel (admin ou palestrante)
    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return isAdmin ? "redirect:/evento" : "redirect:/palestra";
    }
}
