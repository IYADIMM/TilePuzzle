# Native branding report

The pipeline uses the repository-owned Jade Garden brand masters in `public/assets/brand/`; no competitor screenshot pixels or rejected artwork are used. `scripts/generate-android-branding.mjs` creates:

- legacy launcher icons for Android density buckets;
- adaptive foreground/background resources;
- Android 13 monochrome leaf icon;
- centered native splash artwork;
- a 512×512 Play icon;
- a 1024×500 draft feature graphic.

The source remains separate from generated Android/store derivatives. The generated icon preserves safe-zone padding and transparency; the iOS-opaque source is not used as an Android adaptive foreground.

Store candidates are in `docs/android-release/store-assets/`. They meet required pixel dimensions, but visual acceptance remains an independent owner decision.

[OWNER VISUAL APPROVAL REQUIRED: launcher icon, splash and feature graphic]

