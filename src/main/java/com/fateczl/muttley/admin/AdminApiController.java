package com.fateczl.muttley.admin;

import com.fateczl.muttley.auditoria.AcaoAuditoria;
import com.fateczl.muttley.auditoria.AuditoriaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admins")
public class AdminApiController {

    private final AdminService service;
    private final AdminMapper mapper;
    private final AuditoriaService auditoriaService;

    public AdminApiController(AdminService service, AdminMapper mapper, AuditoriaService auditoriaService) {
        this.service = service;
        this.mapper = mapper;
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public ResponseEntity<List<AdminListagem>> listar() {
        List<AdminListagem> admins = service.listarTodos()
                .stream()
                .map(mapper::toListagemDto)
                .toList();
        return ResponseEntity.ok(admins);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminListagem> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(mapper::toListagemDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AdminListagem> criar(
            @Valid @RequestBody AdminDTO dto,
            @RequestHeader(value = "X-Ator", required = false) String ator) {
        Admin salvo = service.salvarOuAtualizar(dto);
        auditoriaService.registrar(AcaoAuditoria.CRIADO, "Admin", salvo.getId(),
                "Admin criado: " + salvo.getLogin(), ator);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(salvo.getId())
                .toUri();
        return ResponseEntity.created(location).body(mapper.toListagemDto(salvo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminListagem> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AdminDTO dto,
            @RequestHeader(value = "X-Ator", required = false) String ator) {
        AdminDTO payload = new AdminDTO(id, dto.login(), dto.senha(), dto.nome(), dto.cpf(), dto.email());
        Admin salvo = service.salvarOuAtualizar(payload);
        auditoriaService.registrar(AcaoAuditoria.ALTERADO, "Admin", salvo.getId(),
                "Admin alterado: " + salvo.getLogin(), ator);
        return ResponseEntity.ok(mapper.toListagemDto(salvo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long id,
            @RequestHeader(value = "X-Ator", required = false) String ator) {
        service.buscarPorId(id).ifPresent(admin ->
                auditoriaService.registrar(AcaoAuditoria.DELETADO, "Admin", id,
                        "Admin excluído: " + admin.getLogin(), ator)
        );
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
