# Android build and versioning

## Reproducible commands

```powershell
npm ci
npm test
npm run android:sync
npm run android:release:unsigned
```

The unsigned command produces review APK/AAB files and a SHA-256 manifest under `artifacts/android/`. Signing uses `npm run android:release:signed` only after owner approval.

`JGT_VERSION_CODE` is a monotonically increasing positive integer. `JGT_VERSION_NAME` is the user-facing semantic version. Defaults are `1` and `1.0.0-rc.1`; production publication should use an owner-approved non-RC name and a version code never previously uploaded. Debug builds append `.debug` and `-debug`.

Build metadata records package, version, source commit, dirty state and a deterministic source timestamp in `public/generated/build-metadata.json`; that generated file is ignored. Release artifacts include version, code, source SHA and signing state in their names.

The manual GitHub workflow performs tests, production dependency audit, branding, sync, Android lint/unit checks and unsigned assembly. It never publishes or reads signing secrets.

