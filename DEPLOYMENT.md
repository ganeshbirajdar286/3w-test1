# DevOps Configuration for tmpfhbur7tk

This repository has been configured automatically by the **AI DevOps Agent**.

## Architecture Summary

- **Repository Type:** Single Service
## Running Locally with Docker Compose

```bash
# Build and start all services locally
docker compose up --build
```

## CI/CD & Automation Suite

- `.github/workflows/ci.yml`: Full multi-job CI/CD pipeline (Metadata outputs, Linting, Testing, Trivy Security Scan, GHCR Container Image Build, Push-Based Deployment).
- `.github/workflows/ai-devops-verify.yml`: Cloud sandbox workflow for automated container verification.
- `.github/workflows/release.yml`: Automated GitHub release creation and changelog generation on `v*` tags.
- `.github/workflows/stale.yml`: Automated cleanup of inactive issues and pull requests.
- `.github/dependabot.yml`: Automated weekly dependency upgrades for package managers, Docker, and GitHub Actions.
