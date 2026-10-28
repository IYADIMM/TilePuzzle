# Performance and Android QA

## Browser

- Production build: PASS.
- Phase 2 browser performance sample: 60 FPS, 16.66 ms average, 17.2 ms maximum, 111 textures.
- Dual-style pointer acknowledgement: 19.83–50.04 ms in the final run.
- Responsive captures: 360×640, 390×844, 430×932, 768×1024.
- Source bundle warning remains: the primary minified Phaser bundle is about 1.37 MB (384 KB gzip); route/chunk splitting remains a future optimization.

## Android build-time verification

- Capacitor sync: PASS.
- `lintRelease`: PASS.
- `testReleaseUnitTest`: PASS.
- `assembleDebug`: PASS.
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk` (28,794,031 bytes).

Warnings: Gradle reports deprecated features before Gradle 9 and an Android SDK XML tool-version mismatch warning. Neither failed this build, but toolchain alignment should be handled before a future major Gradle upgrade.

Physical Samsung/Android device performance, touch latency, audio through speakers, thermal behavior, and store-signed release installation were NOT tested in this phase.
