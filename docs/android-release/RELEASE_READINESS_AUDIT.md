# Android release-readiness audit

Audit date: 2026-10-28. Package: `com.iyadimm.jadegardentiles`. Candidate version: `1.0.0-rc.1` (`versionCode` 1).

## Implemented

- Capacitor Android project targets and compiles against API 36 with minimum API 24.
- Release builds enable R8 and resource shrinking. Debug builds use a separate `.debug` application ID.
- Release signing is environment-driven; no key or password is stored in source control.
- Portrait orientation, offline operation, no cleartext traffic, no Android backup/transfer, predictive-back integration, and edge-to-edge-compatible transparent system bars are declared.
- Native launcher/adaptive/monochrome icons and splash resources are generated from the original Jade Garden brand master.
- Fonts are packaged locally. The release manifest has no Internet permission and production code exposes no mock shop or mock-ad flow.
- Unit, browser gameplay, 1,000-level generation, visual regression, audio, lint and Android assembly checks are automated.

## Verified in this environment

- JDK 21, Gradle 8.14.3, Android Gradle Plugin 8.13.0, Android SDK 36, Node 24 and npm 11 are available.
- Unsigned APK and AAB builds complete. The APK contains no native `.so` libraries, so this candidate has no native-library 16 KB alignment exposure.
- No analytics, advertising, billing, account, cloud-save, Supabase or Firebase SDK is present.

## Acceptance evidence

- 102/102 Node tests passed.
- Full browser acceptance suite passed, including genuine-pointer victory, responsive hit areas, state transactions, both styles and 1,000 generated levels.
- Fifteen-minute headless Chromium soak passed: 123 levels, 4,453 pointer inputs, 51,140 frame samples, 16.9 ms p99 frame time, one frame over 50 ms and no browser errors.
- Android `lintRelease`, `testReleaseUnitTest`, `assembleRelease` and `bundleRelease` passed after moving API-27-only theme attributes into qualified resources.
- Production dependency audit: zero vulnerabilities. Full audit: three moderate development-only findings in Capacitor CLI's transitive `xcode/uuid` chain; automatic remediation proposes an unsafe version change, so it is deferred pending upstream dependency resolution.
- Unsigned artifact verification passed. These artifacts are engineering review outputs and cannot be uploaded as a production release.

## Not yet verified

- Upload-key signing, Play App Signing enrollment, Play Console upload and automated pre-launch report.
- Install/update testing on physical Android devices, including affordable Samsung Galaxy A-series hardware.
- Final store screenshots captured on Android and final feature-graphic visual approval.
- Legal/operator identity, support email, privacy-policy URL, target-audience declaration and content-rating questionnaire.
- The production JavaScript chunk is about 1.36 MB raw / 382 KB gzip; Vite reports a chunk-size warning. It is acceptable for this RC baseline but remains a startup/code-splitting optimization opportunity.

Conclusion: this is a release-candidate engineering baseline, not a publication authorization. See `REMAINING_BLOCKERS.md`.

