package com.fateczl.muttley.config;

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

    // redireciona administradores após login
    @GetMapping("/dashboard")
    public String dashboard() {
        return "redirect:/evento";
    }
}
