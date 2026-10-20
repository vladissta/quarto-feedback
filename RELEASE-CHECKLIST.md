# Release checklist — 0.1.1

## Prepared locally

- [x] Publisher ID selected by the user: `vladissta`.
- [x] MIT license selected by the user; license included.
- [x] Public extension metadata, icon, English/Russian documentation and UI translations.
- [x] Documented supported languages, shortcut behavior and current limitations.
- [x] Privacy and support documentation.
- [x] Pinned development tools with a lockfile; no runtime npm dependencies.
- [x] Official `vsce` package created; package content excludes development dependencies and tests.
- [x] 33 text transformation tests pass.
- [x] VS Code integration tests passed for the unchanged 0.1.0 runtime on macOS arm64.
- [x] Positron integration tests passed for the unchanged 0.1.0 runtime on macOS arm64.
- [x] Final source archive and VSIX checksums recorded alongside the release files.

## Account-dependent steps before public availability

- [ ] Verify/create Marketplace publisher `vladissta` and confirm ownership.
- [x] Open VSX namespace `vladissta` created; publisher agreement signed.
- [ ] Submit namespace ownership evidence and wait for activation.
- [x] User accepted the Open VSX Publisher Agreement.
- [ ] User reviews the final package and authorizes its public upload.
- [ ] Upload the same VSIX to both registries and verify public listings.
- [ ] Install from each registry in a clean editor profile.

Version 0.1.0 was uploaded to Open VSX but remained deactivated pending namespace verification. Version 0.1.1 adds repository metadata for the ownership request.

## Optional follow-up

- [x] Repository and issue tracker: https://github.com/vladissta/quarto-feedback.
- [ ] Manual physical shortcut checks on Windows/Linux (automated host tests here ran on macOS).
- [ ] Broader testing on older supported VS Code versions. The manifest declares VS Code ^1.85.0; direct integration checks use the locally installed editor versions listed in test-results.
