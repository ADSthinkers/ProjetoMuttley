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

    // 🔹 LISTAR
    @GetMapping
    public List<ListagemAdmin> listar() {
        return service.listarTodos()
                .stream()
                .map(mapper::toListagemDto)
                .toList();
    }

    // 🔹 BUSCAR POR ID
    @GetMapping("/{id}")
    public AtualizacaoAdmin buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(mapper::toAtualizacaoDto)
                .orElseThrow(() -> new RuntimeException("Admin não encontrado"));
    }

    // 🔹 CRIAR
    @PostMapping
    public Admin criar(@RequestBody AtualizacaoAdmin dto) {
        return service.salvarOuAtualizar(dto);
    }

    // 🔹 ATUALIZAR
    @PutMapping("/{id}")
    public Admin atualizar(@PathVariable Long id, @RequestBody AtualizacaoAdmin dto) {

        AtualizacaoAdmin novoDto = new AtualizacaoAdmin(
                id,
                dto.login(),
                dto.senha(),
                dto.nome(),
                dto.cpf(),
                dto.email()
        );

        return service.salvarOuAtualizar(novoDto);
    }

    // 🔹 DELETAR
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}