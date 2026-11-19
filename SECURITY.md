# Security

## Malware Protection CI

This repository runs a dedicated `Malware Protection` workflow
(`.github/workflows/malware-protection.yml`) in addition to the regular CI. It
exists because of the ongoing **PolinRider** supply-chain campaign (DPRK-linked,
tracked publicly by [OpenSourceMalware](https://github.com/OpenSourceMalware/PolinRider)),
which infects thousands of GitHub repositories by appending obfuscated
JavaScript to frontend build configs, shipping malicious npm packages, and
dropping `.vscode/tasks.json` auto-executing tasks. Compromised contributor
accounts then propagate the payload across repositories.

Because PolinRider re-infects previously cleaned repositories and rotates its
obfuscator fingerprints, the workflow runs on every push and pull request,
**and daily on a schedule**.

### What each layer covers

| Job | Tooling | Covers |
|---|---|---|
| Signature & heuristic scan | `scripts/security/scan-malware.mjs`, YARA (`scripts/security/rules/malware.yar`), `scripts/security/check-workflows.mjs` | PolinRider v1/v2 payload markers, propagation scripts (`temp_auto_push.bat`), TasksJacker `tasks.json` droppers, known malicious npm packages, C2 hosts/blockchain dead-drops, fake-font payloads, `eval`+decoder chains, download-and-execute pipes, env-var stealers, off-registry lockfile resolutions, npm lifecycle scripts, workflow hardening (unpinned actions, script injection, `pull_request_target` misuse, `--no-verify`, force pushes) |
| Dependency integrity | `npm ci --ignore-scripts`, `npm audit`, `npm audit signatures`, SBOM (CycloneDX) | Known advisories, registry-signature/provenance verification, install-time code execution (never runs dependency scripts), SBOM for audit trails |
| Secret & stealer scan | Gitleaks over full history | Committed credentials and token stealers — both injected by malware and abused to spread it |
| Antivirus scan | ClamAV over all files | Known malware families in committed binaries/assets (droppers, PE/ELF payloads) beyond the JS-focused signatures |

Every action is pinned to a full commit SHA, and dependencies are never
installed with lifecycle scripts inside this workflow, so the scanners cannot
execute the malware they are hunting.

### What this does NOT cover

No CI can guarantee protection from "every type" of malware. Residual risk:

- **Zero-day payloads** with none of the published indicators. The generic
  heuristics catch common loader behavior, not novel obfuscation.
- **Malicious code that looks legitimate** (logic bombs, subtly wrong crypto,
  backdoored business logic). This needs human review — see the checklist below.
- **Compromised maintainer credentials** used to push directly to `main`
  after CI has passed, or to change the workflow files themselves in the same
  push that arms a payload. Branch protection is what closes this gap.
- **Build-time compromise upstream** of this repository (e.g. a poisoned
  compiler or base image).
- **`npm audit signatures`** is currently advisory (`continue-on-error: true`)
  because unsigned-but-untampered packages still exist in the ecosystem. Flip
  it to blocking in `.github/workflows/malware-protection.yml` once it passes
  cleanly on this dependency tree.

### Maintainer checklist (do these once)

- [ ] **Branch protection on `main`**: require a pull request, require the
      `Malware Protection` and `CI` checks, require review for changes to
      `.github/workflows/**`, `package.json`, `package-lock.json`, and
      `scripts/security/**`, block force pushes, and disallow bypassing checks.
- [ ] **Ruleset**: restrict who can push to `main`; require linear history.
- [ ] **Secret scanning + push protection** (free for public repos) enabled in
      repository settings, in addition to the Gitleaks job.
- [ ] **Commit signing** encouraged for maintainers (the PolinRider propagation
      script rewrites authorship and timestamps).
- [ ] **Lock `npm` publishes**: if this project ever publishes packages, require
      provenance and 2FA on the npm account.

### If a scan fails

1. **Stop. Do not `npm install` or run the project locally** — the payload can
   execute at install or build time.
2. Identify the finding (`scan-malware.mjs` prints file:line and evidence).
3. For PolinRider-class infections: remove the appended payload from the
   config file (everything after the legitimate `export default` /
   `module.exports`), delete `temp_auto_push.bat` / `config.bat`, remove the
   `config.bat` line from `.gitignore`, and check **every branch** and nested
   package (`apps/*`, `client/`, `frontend/`) — infections hide in deep paths.
4. Treat the finding as evidence of **past compromise**: rotate all tokens,
   wallets' session keys, CI secrets, and npm credentials that were present on
   any machine that built the project. A `temp_auto_push.bat` artifact means
   git history was rewritten — audit `git reflog` and force-push history.
5. Purge the payload from **git history** (filter-repo), not just the tip.
6. Re-scan after cleanup: the campaign is documented to re-infect cleaned
   repositories with rotated fingerprints.
7. Report the repository/indicator to
   [OpenSourceMalware](https://opensourcemalware.com) and, if credentials were
   exposed, rotate them before anything else.

### Updating indicators

All indicators live in `scripts/security/iocs.json`, and signatures in
`scripts/security/rules/malware.yar`. When researchers publish a new variant
(fingerprint, C2 host, malicious package):

1. Add the literal/regex to `iocs.json` under the matching section with a
   severity and a source note.
2. Add an equivalent string/condition to `malware.yar`.
3. Verify with a synthetic fixture (see below), then delete the fixture.

Sanity-check locally:

```bash
node scripts/security/scan-malware.mjs        # worktree scan (zero dependencies)
node scripts/security/check-workflows.mjs     # workflow hardening rules
yara -r scripts/security/rules/malware.yar .  # optional, if yara is installed
```

`scripts/security/**` is excluded from scanning so indicator literals cannot
match themselves. Keep it that way.

### Reporting vulnerabilities

Please report suspected malware indicators, secrets in history, or
vulnerabilities via GitHub private security advisories (Security tab →
"Report a vulnerability"). Do not open a public issue containing live
credentials or active C2 URLs.
