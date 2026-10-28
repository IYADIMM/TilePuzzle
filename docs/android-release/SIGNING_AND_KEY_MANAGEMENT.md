# Signing and key management

Status: **WAITING FOR OWNER APPROVAL**. No permanent signing key was generated.

Google Play App Signing should manage the distribution signing key. The owner retains a separate upload key used only to authenticate uploads. Keep the upload keystore in an encrypted password manager or restricted secret store, with an offline recovery copy. Never commit it.

The build accepts only these environment variables:

```text
JGT_UPLOAD_KEYSTORE
JGT_UPLOAD_KEY_ALIAS
JGT_UPLOAD_STORE_PASSWORD
JGT_UPLOAD_KEY_PASSWORD
JGT_VERSION_CODE
JGT_VERSION_NAME
```

`npm run android:release:signed` refuses an incomplete signing configuration, missing keystore, dirty worktree, or invalid version. It does not print passwords. The keystore, `.env`, `keystore.properties`, APK/AAB and Google service configuration are ignored by Git.

Owner procedure after approval:

1. Create the upload key locally using current Play Console guidance; record alias, validity and certificate fingerprints.
2. Back it up in two controlled locations and document the authorized maintainers.
3. Export the six variables only in the signing shell or CI secret store.
4. Run the signed release command from a clean, reviewed commit.
5. Verify APK/AAB signatures and compare SHA-256 hashes with `artifacts/android/release-manifest.json`.
6. Enroll in Play App Signing and upload only to an internal test track first.

[OWNER APPROVAL REQUIRED: upload-key creation and signing]

