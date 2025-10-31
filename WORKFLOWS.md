## GitHub Actions Workflows

This file documents the GitHub Actions workflows included in this repository, their purpose, triggers, configuration details, and guidance for interpreting results and setting up required secrets.

Each workflow file lives in `.github/workflows/` and is named as listed below.

---

### 1) ci.yml

- Purpose: Continuous Integration for the project. Runs linting and unit tests on every push to `main`.
- Trigger: `push` to branch `main`.
- Jobs / Steps:
	- Checkout repository (`actions/checkout`).
	- Setup Node.js 18 (`actions/setup-node`).
	- Install dependencies (`npm ci`).
	- Run linter (`npm run lint`).
	- Run tests (`npm test`).
- Configuration details:
	- Uses Node 18 to match runtime used in the project.
	- The `lint` script is defined in `package.json` and runs ESLint across the repo.
	- Tests use Jest and are run with `npm test`.
- Interpreting results:
	- Go to the Actions tab in GitHub, open the `CI` workflow run, and inspect the logs for each step.
	- Lint failures will be visible in the `Run linter` step logs. Tests failures show in `Run tests` logs and Jest output.
- Best practices followed:
	- The workflow stops on the first failing step so failures are immediate.
	- Use small, focused steps so logs point to specific failures.

---

### 2) deploy.yml

- Purpose: Deploy the app to Heroku after CI succeeds on `main`.
- Trigger: `push` to `main`. The job is intended to run after successful CI by using `needs` or by being triggered when CI has completed.
- Jobs / Steps:
	- Checkout repository.
	- Setup Node.js 18.
	- Install dependencies (`npm ci`).
	- Run tests (as a safety gate).
	- Deploy to Heroku using `akhileshns/heroku-deploy` action.
- Configuration details / Secrets:
	- Requires repository secrets:
		- `HEROKU_API_KEY` — personal API key from Heroku (store in GitHub repo Settings → Secrets).
		- `HEROKU_APP_NAME` — target Heroku app name.
		- `HEROKU_EMAIL` — Heroku account email (used by some deploy actions).
	- The deploy action uses `git push` to Heroku remotely and will fail if credentials or app name are invalid.
- Interpreting results:
	- Check the `Deploy` job logs for push output and any Heroku response.
	- A successful step indicates the new code was pushed to Heroku; use Heroku dashboard to verify the deployed revision.
- Best practices followed:
	- Deploy only after the build/test job succeeds (the workflow uses `needs` or conditional checks).
	- Keep secrets in repository settings; never hard-code credentials in workflows.

---

### 3) scheduled-tasks.yml

- Purpose: Run scheduled tasks (daily scraper) and notify maintainers with results.
- Trigger: `schedule` — daily at midnight Asia/Karachi (converted to UTC in the workflow).
- Jobs / Steps:
	- Checkout repository.
	- Setup Node.js 18.
	- Install dependencies (`npm ci`).
	- Run the scraper via a Node one-liner that calls `run.runScrape()` and writes `scrape_output.log`.
	- Send an email with `scrape_output.log` attached using `dawidd6/action-send-mail`.
- Configuration details / Secrets:
	- Requires email-related secrets to be added to the repository:
		- `MAIL_SERVER` (SMTP host)
		- `MAIL_PORT` (SMTP port)
		- `MAIL_USERNAME` (SMTP username)
		- `MAIL_PASSWORD` (SMTP password)
		- `MAIL_TO` (comma-separated recipient(s))
		- `MAIL_FROM` (sender address)
	- The workflow writes the scraper output to a log file and attaches it to the mail action.
- Interpreting results:
	- Inspect the workflow run logs in Actions to see scraper logs (scrape_output.log) and email-send status.
	- If the job exits non-zero, the Actions run will be marked failed and logs show stack traces.
- Best practices followed:
	- Secrets are used for SMTP credentials.
	- Scraper is run inside CI environment with network access; be considerate of target site's rate limits and terms.

---

### 4) dependency-updates.yml

- Purpose: Automate dependency updates weekly and open a PR with updated dependency versions if tests pass.
- Trigger: Schedule — weekly on Monday (cron `0 0 * * 1`). Also manual dispatch is enabled.
- Jobs / Steps:
	- Checkout repository and setup Node.js 18.
	- Run `npm ci` to install current deps.
	- Install `npm-check-updates` (`ncu`) and run `ncu -u` to update `package.json`.
	- If `package.json` changed, run `npm install` and `npm test`.
	- If tests succeed, create a PR with the updates using `peter-evans/create-pull-request`.
- Configuration details:
	- The job uses `GITHUB_TOKEN` (provided by Actions) to create the PR.
	- You can tune `ncu` options (e.g., `--target minor`) to restrict updates to non-major bumps.
- Interpreting results:
	- If updates are detected, a PR is created. Check the PR for test results and CI status.
	- If no updates were found, the workflow logs indicate no changes.
- Best practices followed:
	- Tests are executed after updates before opening a PR to avoid breaking changes.
	- The workflow uses `ncu` to automate upgrades but can be replaced by Dependabot for gradual PRs.

---

### 5) code-review.yml

- Purpose: Run automated code review checks on Pull Requests to `main` — lint, tests, audit, and CodeQL analysis.
- Trigger: `pull_request` targeting `main`.
- Jobs / Steps:
	- Checkout, setup Node.js 18, install deps.
	- Run lint (`npm run lint`) and capture status.
	- Run tests (`npm test`) and capture status.
	- Run `npm audit` to check for vulnerabilities.
	- Run CodeQL init/autobuild/analyze to scan for code issues and security alerts.
	- Post a summary comment on the PR with results using `actions/github-script`.
	- Fail the job if lint/tests/audit detect issues (prevents merging if branch protection requires this check).
- Configuration details:
	- The workflow posts a PR comment summarizing results and points developers to the Actions logs for details.
	- CodeQL results are visible in the Security tab for the repository; the workflow also reports whether CodeQL steps ran successfully.
- Interpreting results:
	- Open the PR, check the `Checks` section for the `Code Review` workflow. Expand each step to see logs.
	- CodeQL alerts appear in the repository's Security → Code scanning alerts.
	- The comment left on the PR gives a quick pass/fail summary.
- Best practices followed:
	- The workflow ensures automated checks run on every PR and block merges if there are failures.
	- Using CodeQL adds a security-focused static analysis pass.

---

### 6) documentation.yml

- Purpose: Build and deploy documentation from `docs/` to GitHub Pages when docs change.
- Trigger: `push` to `main` with changes under `docs/**`.
- Jobs / Steps:
	- Checkout the repo and (optionally) setup Node.js.
	- Build docs using one of:
		- `npm run docs:build` (if present), or
		- `mkdocs build` if `mkdocs.yml` exists, or
		- fallback: copy `docs/` to `site/`.
	- Upload the build artifact and deploy to GitHub Pages using `actions/deploy-pages`.
- Configuration details:
	- The workflow uses `actions/upload-pages-artifact` and `actions/deploy-pages` which require repository `pages:write` permission.
	- If using mkdocs, Python/mkdocs needs to be available; the workflow installs it as needed.
- Interpreting results:
	- Actions log shows build output; the Pages deployment step provides the publication status and link.
	- If deployment fails, check the artifact upload and deploy step logs for errors.
- Best practices followed:
	- The workflow only triggers when docs change to minimize unnecessary runs.
	- Uses the official Pages deploy action flow.

---

### 7) custom.yml (release notes)

- Purpose: Generate changelog/release notes and create a GitHub Release when a `release/*` tag is pushed.
- Trigger: `push` of tags matching `release/*`.
- Jobs / Steps:
	- Checkout (fetch full history) to compute tag ranges.
	- Determine the current tag and the previous tag.
	- Generate a simple `release_notes.md` from commit messages between tags.
	- Create a GitHub Release using `softprops/action-gh-release` and attach the generated notes.
- Configuration details:
	- This workflow uses the `GITHUB_TOKEN` to create releases; ensure the token has permission for releases (default `GITHUB_TOKEN` usually does).
	- The changelog generation is intentionally simple (commit messages). Consider using more advanced tools if you need structured release notes.
- Interpreting results:
	- The Actions run will show the generated `release_notes.md` and the release creation step output.
	- Visit the Releases page in GitHub to see the new release and notes.
- Best practices followed:
	- Releases are generated from tags which helps ensure releases are scoped to deliberate tagged revisions.

---

## Secrets and Repository Setup

Several workflows require secrets (deploy, email, Heroku). To configure them:

1. Go to your repository on GitHub.
2. Settings → Secrets and variables → Actions → New repository secret.
3. Add the required secrets (example keys used in our workflows):
	 - `HEROKU_API_KEY`, `HEROKU_APP_NAME`, `HEROKU_EMAIL` — for Heroku deploy.
	 - `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_TO`, `MAIL_FROM` — for scheduled email notifications.
	 - The workflows use the built-in `GITHUB_TOKEN` automatically; no action needed for that secret.

Security notes:
- Keep secrets scoped to repository (or organization) and do not print them in logs.
- For deploy tokens prefer creating a service account or deploy key with restricted permissions.

## How to interpret workflow failures

- Open the Actions tab and select the workflow run.
- Expand each job and step to view logs and error messages.
- For linting: ESLint output shows file/line numbers and rule names.
- For tests: Jest output includes failing tests and stack traces.
- For CodeQL and security findings: check Security → Code scanning alerts for details.

## Recommendations and next steps

- Protect `main` with Branch Protection Rules requiring the `CI` and `Code Review` checks to pass before merging.
- Consider adding caching to the CI workflow (`actions/cache`) to speed up `npm ci`.
- Consider switching dependency updates to Dependabot if you prefer one PR per update.
- Add a separate staging deploy workflow if you want to test deploys before pushing to production.

---

If you'd like, I can also:
- commit and push this file to `main`,
- add badges to `README.md` for CI and Pages, or
- implement the recommended caching and branch protection automation.

