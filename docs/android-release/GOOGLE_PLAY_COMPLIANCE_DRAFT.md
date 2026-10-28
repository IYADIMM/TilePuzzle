# Google Play compliance draft

This is a technical draft, not legal advice or a completed Play Console declaration.

| Console area | Proposed answer | Evidence / condition |
|---|---|---|
| App category | Game / Puzzle | Core offline tile puzzle |
| Ads | No | No ad SDK; mock ad path excluded from production |
| App access | All functionality available without account | No login or restricted area |
| Data Safety | No data collected or shared | Offline app, no Internet permission or telemetry; reconfirm final binary |
| Financial features | None | No billing, real-money purchase or cash reward |
| Target audience | Recommend 13+ | Owner must decide before rating questionnaire |
| Content rating | Complete IARC questionnaire truthfully | Mild puzzle visuals/audio only; Play Console result pending |
| Privacy policy | Required public URL | Draft provided separately; owner details/hosting pending |
| Play App Signing | Required release process | Owner upload-key approval pending |

API 36 is used to satisfy the Android 16 target requirement applicable from 31 August 2026. The app uses no native libraries, but future native dependencies must be checked for 16 KB page-size compatibility. Edge-to-edge and predictive back are implemented for modern Android.

Before submission, inspect the final Play-generated universal APK/bundle explorer result, rerun a network scan, answer the target-audience/content-rating questionnaires, and resolve every Play Console warning.

Official references checked on 2026-10-28:

- [Target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-EN)
- [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756)
- [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Store listing assets](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Target audience](https://support.google.com/googleplay/android-developer/answer/9867159)
- [Content ratings](https://support.google.com/googleplay/android-developer/answer/9898843)
- [Privacy policy requirements](https://support.google.com/googleplay/android-developer/answer/9859455)
- [16 KB page sizes](https://developer.android.com/guide/practices/page-sizes)
- [Edge-to-edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge)
- [Predictive back](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture)

[OWNER CONFIRM: legal/operator name]

[OWNER CONFIRM: public support email]

[OWNER CONFIRM: privacy policy URL]

[OWNER DECISION: target audience; engineering recommendation is 13+]

