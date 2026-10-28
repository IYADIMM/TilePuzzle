# Save, backup and migration report

Progress is stored locally through the existing versioned `SaveManager` transaction and recovery system. Normal application updates retain the Android app sandbox and therefore should retain WebView storage. Existing schema migrations, validation, write verification and recovery copies remain in place.

Android Auto Backup and device-to-device transfer are deliberately disabled for this candidate. WebView Local Storage/LevelDB restoration has not been proven across Android/WebView versions; enabling platform backup could create a misleading promise or restore an inconsistent database. Consequently:

- in-place upgrade preservation: designed and automated save migrations covered;
- uninstall/reinstall recovery: not supported;
- cross-device/cloud recovery: not supported;
- app-data clearing: permanently removes progress.

A signed-device upgrade test from the last published version is mandatory before rollout. If cloud or Android backup is later added, it needs a dedicated encrypted, versioned export/import design and privacy review rather than a manifest-only switch.

[OWNER APPROVAL REQUIRED: local-only save and no-backup policy]

