# Release-candidate checklist

## Engineering complete

- [x] Dedicated release branch
- [x] API 36 target/compile; API 24 minimum
- [x] Release shrinking and offline manifest hardening
- [x] Environment-only signing configuration with secret ignores
- [x] Native icon, adaptive/monochrome icon and splash pipeline
- [x] Locally packaged fonts
- [x] Native back behavior
- [x] Mock shop/ad paths excluded from production UI
- [x] Unit, browser, 1,000-level, build and Android preflight automation
- [x] Unsigned APK/AAB and SHA-256 inventory

## Required before internal testing

- [ ] Owner approves and secures upload key
- [ ] Produce signed AAB from clean commit
- [ ] Verify signature/certificate fingerprints and archive checksums
- [ ] Host privacy policy and provide support details
- [ ] Approve icon, splash, feature graphic and listing copy

## Required before production rollout

- [ ] Physical-device matrix, including affordable Samsung hardware
- [ ] Signed update/migration test from prior public version
- [ ] Play internal/closed test and pre-launch report clean
- [ ] Android screenshots from actual build
- [ ] Complete Data Safety, target audience, content rating and app access forms
- [ ] Resolve Play Console warnings and review final generated APKs
- [ ] Staged rollout/rollback plan and support ownership approved

