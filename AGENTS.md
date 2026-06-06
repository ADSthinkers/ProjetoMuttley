# Repository Guidelines

## Project Structure & Module Organization

This is a Vite React frontend. Application code lives in `src/`, with route-level views in `src/pages/`, reusable UI in `src/components/`, shared helpers in `src/utils/`, and static assets in `src/assets/`. The app entry point is `src/main.jsx`, and routing is centralized in `src/App.jsx`. Public HTML starts at `index.html`. Build output is written to `dist/` and should not be edited directly.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server with hot reload.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the production build locally for inspection.
- `npm run lint`: run ESLint across the repository.

Run commands from the repository root.

## Coding Style & Naming Conventions

Use JavaScript modules and React JSX. Follow the existing style: component files use `PascalCase.jsx` (`ParticipanteCard.jsx`, `EventoForm.jsx`), utility modules use lower camel case or descriptive lowercase names (`auth.js`, `formatters.js`), and pages map closely to route names. Prefer functional components and hooks. Keep shared logic in `src/utils/` instead of duplicating it in pages.

ESLint is configured in `eslint.config.js` for JS/JSX, React Hooks, and React Refresh. Fix lint errors before submitting changes. The current codebase uses semicolons inconsistently, so match nearby files when editing and avoid unrelated formatting churn.

## Testing Guidelines

There is currently no test runner or `npm test` script configured. Until tests are added, verify changes with `npm run lint` and `npm run build`, then manually exercise affected routes in `npm run dev`. If adding tests, prefer colocated test files named `*.test.jsx` near the component or page they cover, and add the test command to `package.json`.

## Commit & Pull Request Guidelines

Recent commits use short Portuguese summaries such as `Redesign da home` and `adição de local e patrocinador`. Keep commit messages concise, imperative or descriptive, and focused on one change.

Pull requests should include a brief description, the routes or components changed, verification steps run, and screenshots or screen recordings for visible UI changes. Link related issues when applicable and call out any new environment variables or backend assumptions.

## Security & Configuration Tips

Do not commit secrets. Local configuration belongs in `.env`, which is present for development but should not be used for shared credentials. When adding API calls, keep authentication behavior aligned with `src/utils/auth.js` and handle unauthorized states consistently with existing protected routes.
