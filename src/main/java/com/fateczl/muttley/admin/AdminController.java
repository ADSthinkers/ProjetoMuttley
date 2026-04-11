package com.fateczl.muttley.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/usuarios")
public class AdminController {

    @Autowired
    private AdminService service;

    @Autowired
    private AdminMapper mapper;

    @GetMapping
    public List<AdminListagem> listar() {
        return service.listarTodos()
                .stream()
                .map(mapper::toListagemDto)
                .toList();
    }

    @GetMapping("/{id}")
    public AdminAtualizacao buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(mapper::toAtualizacaoDto)
                .orElseThrow(() -> new RuntimeException("Admin não encontrado"));
    }

    @PostMapping
    public Admin criar(@RequestBody AdminAtualizacao dto) {
        return service.salvarOuAtualizar(dto);
    }

    @PutMapping("/{id}")
    public Admin atualizar(@PathVariable Long id, @RequestBody AdminAtualizacao dto) {

        AdminAtualizacao novoDto = new AdminAtualizacao(
                id,
                dto.login(),
                dto.senha(),
                dto.nome(),
                dto.cpf(),
                dto.email()
        );

        return service.salvarOuAtualizar(novoDto);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}