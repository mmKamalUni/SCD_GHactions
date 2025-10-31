---
title: Heavens-Above Satellite Scraper
---

# Heavens-Above Satellite Scraper

## Project Overview

This project is a small Node.js/Express web application that wraps a scraper for the "Heavens-Above" website. It extracts satellite pass information (for example the ISS) and stores generated data and assets under `public/data/`.

The repository contains the original scraping code (adapted to be promise-friendly) and a lightweight Express server exposing two main endpoints that make it easier to trigger and view results.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mmKamalUni/SCD_GHactions.git
cd SCD_GHactions
npm install
```

Notes:
- The project uses some native modules and network requests. Ensure your environment has Node.js installed (the `package.json` lists `node >= 12.10.0`).
- If you see engine warnings during `npm install`, they are warnings only; upgrade Node if you want to match the engines exactly.

## Usage

Start the server:

```bash
npm start
```

Once running (default port 3000), the app exposes these endpoints:

- `GET /` — a simple welcome message.
- `GET /scrape` — triggers the scraper (calls the existing `run.js` logic), waits for it to finish, and returns JSON with the scraped items. Note: the scraper performs external HTTP requests and downloads images; expect this request to take time.

Example:

```bash
curl http://localhost:3000/
curl http://localhost:3000/scrape
```

## Dependencies

Key dependencies (from `package.json`):

- cheerio — HTML parsing
- request — HTTP client used by the scraper
- express — small web server framework

Dev dependencies used for development and testing:

- eslint — linting
- jest — test runner
- supertest — HTTP assertions for tests

## Contributing

Contributions are welcome. A suggested workflow:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`.
3. Implement your changes and add tests where appropriate.
4. Run lint and tests locally:

```bash
npm run lint
npm test
```

5. Commit and open a Pull Request.

Guidelines:
- Keep the scraper respectful (don't overload external sites). Add rate limiting or delays when implementing repeated scraping.
- If you add new dependencies, update `package.json` and keep the dependency list concise.

## GitHub Pages

This `docs/index.md` can be used for GitHub Pages. In repository settings, set Pages source to the `docs/` folder and GitHub Pages will render this markdown as the project site.

---

If you'd like, I can also:
- add more documentation pages (API reference, developer notes),
- add a CI workflow to run lint and tests on push/PR, or
- generate a small README.md from this content and/or add badges.
