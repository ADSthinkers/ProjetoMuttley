package com.fateczl.muttley.config;

import com.fateczl.muttley.admin.Admin;
import com.fateczl.muttley.admin.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// cria o usuário admin padrão na inicialização da aplicação caso ainda não exista nenhum
@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // executa ao subir a aplicação e insere o admin padrão se o banco estiver vazio
    @Override
    public void run(String... args) {
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setLogin("admin");
            admin.setNome("Administrador");
            admin.setCpf("00000000000");
            admin.setEmail("admin@muttley.com");
            admin.setSenha(passwordEncoder.encode("admin"));
            adminRepository.save(admin);
            System.out.println("Admin padrão criado: login=admin / senha=admin");
        }
    }
}
