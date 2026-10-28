# Android device test matrix

Status: **PHYSICAL DEVICE TEST PENDING**. `adb devices` returned no connected device. No Android emulator/system image is installed on this host, and no physical results are inferred from browser QA.

| Class | Target example | Required checks | Status |
|---|---|---|---|
| Affordable Samsung | Galaxy A14/A15/A24-class, Android 13–15 | cold/warm launch, 30-minute play, touch latency, memory, audio focus, thermal/battery | Pending |
| Mid-range Samsung | Galaxy A34/A35-class | 60 fps stability, animations, pause/resume, style switching | Pending |
| Small phone | 360×640-equivalent device | safe areas, text, tray hitboxes, navigation | Browser layout passed; device pending |
| Tall phone | 390×844 / 430×932 | edge-to-edge, gesture nav, predictive back | Browser layout passed; device pending |
| Tablet/foldable | 7–10 inch or unfolded | scaling, orientation lock, aspect handling | Pending |
| API floor | Android 7 / API 24 | install, launch, storage migration, audio | Pending |
| Current API | Android 16 / API 36 | edge-to-edge, back gesture, install/update | Pending |

For each device: install signed internal-test artifact, complete levels in both styles using genuine taps, exercise all boosters, background/restore, audio toggles, tray-full/revive/restart, save recovery, update from previous build, uninstall warning, airplane mode and accessibility text/display scaling. Capture build ID, OS, model, frame-time trace, screenshots and defects.

