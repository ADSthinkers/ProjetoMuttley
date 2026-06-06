# Repository Guidelines

## Project Structure & Module Organization

This is a Java 21 Spring Boot project managed with Maven. Application code lives in `src/main/java/com/fateczl/muttley`, organized by feature package: `admin`, `evento`, `palestra`, `participante`, `certificado`, `qrcode`, and related domains. Most features follow the same class pattern: entity, `DTO`, `Listagem`, `Mapper`, `Repository`, `Service`, MVC `Controller`, and REST-style `ApiController`.

Resources live in `src/main/resources`. Thymeleaf pages are in `templates/<feature>/`, shared static files are in `static/CSS` and `static/JS`, and application settings are in `application.properties`. Tests belong in `src/test/java/com/fateczl/muttley`.

## Build, Test, and Development Commands

Use the Maven wrapper so contributors run the same Maven version:

- `./mvnw spring-boot:run` starts the app locally on port `8080`.
- `./mvnw test` runs the JUnit/Spring Boot test suite.
- `./mvnw clean package` compiles, tests, and builds the jar in `target/`.

The app expects a local MySQL database named `medalha`; `application.properties` currently points to `localhost:3306`.

## Coding Style & Naming Conventions

Use standard Java formatting with tabs or consistent IDE formatting matching existing files. Keep package names lowercase and class names in PascalCase. Follow existing suffixes: `EventoService`, `EventoRepository`, `EventoDTO`, `EventoApiController`, and `EventoController`. Prefer constructor injection or existing local dependency-injection patterns. Lombok and MapStruct are configured; use them consistently when adding DTO mapping or boilerplate-heavy models.

## Testing Guidelines

Tests use JUnit 5 with `spring-boot-starter-test`. Name test classes after the unit or feature under test, for example `EventoServiceTest` or `CertificadoApiControllerTest`. Keep integration tests under the same package tree in `src/test/java`. Run `./mvnw test` before opening a PR. Add tests for service rules, repository queries, controller responses, and security-sensitive flows.

## Commit & Pull Request Guidelines

Recent commits use short, direct messages such as `adding findByEmail` and `fix em cargaHoraria`. Keep that style concise, but prefer imperative English or Portuguese with the changed area named, for example `fix certificado validation` or `add evento list endpoint`.

Pull requests should include a short description, the reason for the change, test results, and screenshots when Thymeleaf templates or static assets change. Link related issues when available and call out database, security, mail, or configuration changes explicitly.

## Security & Configuration Tips

Do not commit real credentials, API keys, SMTP passwords, or personal database passwords. Move local overrides to an ignored properties file or environment-specific configuration before sharing changes. Be careful when editing `SecurityConfig`, `ApiKeyInterceptor`, mail settings, or certificate/QR-code generation paths because these affect authentication, external delivery, and user-facing validation.
