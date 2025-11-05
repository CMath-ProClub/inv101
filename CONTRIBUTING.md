# Contributing to inv101

Thanks for your interest in improving inv101! This document outlines how to get a local environment running, the workflow we follow for changes, and expectations for pull requests.

## Getting Started

1. **Install dependencies**
   - Root workspace: `npm install`
   - Backend services: `cd backend && npm install`
   - Frontend app: `cd apps/web && npm install`

2. **Run the prototype**
   - Static prototype assets live in `prototype/`. Open the HTML files directly in a browser or serve them with your favorite static file server.

3. **Run the web app**
   - From `apps/web`: `npm start`
   - Lint and format: `npm run lint` and `npm run format`

4. **Run backend utilities**
   - Most backend scripts live under `backend/`. Use `npm run dev` to start the API or execute individual scripts with `node script-name.js`.

## Branching Strategy

- Create feature branches from `main` using the format `feature/short-description` or `fix/short-description`.
- Keep branches focused—separate fixes and features into different pull requests.

## Coding Standards

- Use the existing ESLint and Prettier configurations (`npm run lint` / `npm run format`).
- Favor accessibility and responsiveness; test in both light/dark (and now sepia/colorblind) themes.
- Document complex UI interactions with succinct comments—avoid obvious restatements.
- Keep assets ASCII unless the file already contains extended characters.

## Commit Guidelines

- Write clear, present-tense commit messages (e.g., `Add theme picker to settings`).
- Group related changes into a single commit when practical.
- Avoid committing generated files or logs.

## Pull Requests

- Ensure `npm run lint` and `npm run format` pass before submitting.
- Link to related issues and describe the problem / solution succinctly.
- Include screenshots or GIFs for visual changes (especially UI/UX work).
- Highlight potential regressions or areas needing extra review/testing.

## Issue Reporting

When filing an issue, please include:

- Expected vs. actual behavior
- Steps to reproduce
- Screenshots or logs when relevant
- Environment details (OS, browser, Node version)

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md). We are committed to a respectful, inclusive community.

We appreciate your help—thank you for contributing!
