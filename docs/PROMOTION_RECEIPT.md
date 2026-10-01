# Maturity promotion receipt

Copy this template into the server repository. Complete it for the exact artifact being reviewed. Link the completed receipt from the Rack listing's `maturityEvidence` field. A checklist with missing evidence is not a promotion.

- Project:
- Proposed status and supported scope:
- Release tag, commit and package version:
- Artifact name and SHA-256:
- Reviewer and review date:
- Review type: maintainer or independent (name the independent reviewer if applicable)

## Beta gate

- [ ] Clean versioned install from the distributed artifact, with commands and result.
- [ ] Required CI passes on supported runtimes and platforms. Link runs.
- [ ] Real initialise, tools/list and representative calls pass.
- [ ] End-to-end workflow passes in at least 2 named client versions.
- [ ] Applicable security findings have regression evidence and a recorded disposition.
- [ ] Permissions, data handling, costs and failure behaviour are documented.
- [ ] Someone outside the original development environment can follow the setup.

## Stable gate

- [ ] Versioned core contract, upgrade path and support policy are documented.
- [ ] Install, upgrade and failure/recovery checks cover the supported scope.
- [ ] No unresolved critical or high-severity defect remains in that scope.
- [ ] Operational record covers 30 days, 2 independent operator reports and 3 representative workflows. Record attempts and failures. Explain any product-specific exception.
- [ ] Known limits and experimental features are clearly excluded from the stable promise.

## Evidence table

| Check | Artifact / environment | Result | Evidence |
|---|---|---|---|
| Clean install | | | |
| Client workflows | | | |
| Recovery | | | |
| Security regressions | | | |
| Operational use | | | |

## Decision

Record pass, hold or narrower scope, with reasons and remaining work. When upstream behaviour, client compatibility or a security finding changes, review this decision again.
