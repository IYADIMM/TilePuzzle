import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const requestedSigned = process.argv.includes('--signed');
const metadata = JSON.parse(await readFile(path.join(root, 'public', 'generated', 'build-metadata.json'), 'utf8'));
const apkSource = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'release', requestedSigned ? 'app-release.apk' : 'app-release-unsigned.apk');
const aabSource = path.join(root, 'android', 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
const out = path.join(root, 'artifacts', 'android');
await mkdir(out, { recursive: true });
const label = requestedSigned ? 'signed' : 'unsigned';
const base = `Ivory-Mahjong-${metadata.versionName}-${metadata.versionCode}-${metadata.gitShortSha}-${label}`;
const entries = [];

for (const [kind, source, extension] of [['apk', apkSource, 'apk'], ['aab', aabSource, 'aab']]) {
  const destination = path.join(out, `${base}.${extension}`);
  await copyFile(source, destination);
  const bytes = await readFile(destination);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const size = (await stat(destination)).size;
  const verification = verify(kind, destination, requestedSigned);
  entries.push({ kind, path: path.relative(root, destination).replaceAll('\\', '/'), size, sha256, signing: verification });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  source: metadata,
  requestedSigning: label,
  ownerApprovalRequired: !requestedSigned,
  artifacts: entries
};
await writeFile(path.join(out, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));

function verify(kind, file, signed) {
  if (kind === 'aab') {
    const javaHome = process.env.JAVA_HOME;
    const jarsigner = javaHome ? path.join(javaHome, 'bin', process.platform === 'win32' ? 'jarsigner.exe' : 'jarsigner') : 'jarsigner';
    const result = spawnSync(jarsigner, ['-verify', '-strict', file], { encoding: 'utf8' });
    const output = `${result.stdout || ''}\n${result.stderr || ''}`.toLowerCase();
    const saysUnsigned = output.includes('jar is unsigned');
    const saysVerified = output.includes('jar verified');
    return {
      expected: signed ? 'upload-key-signed' : 'unsigned',
      verified: signed ? result.status === 0 && saysVerified && !saysUnsigned : saysUnsigned
    };
  }
  if (!signed) return { expected: 'unsigned', verified: true };
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  const apksigner = sdk ? path.join(sdk, 'build-tools', '36.0.0', process.platform === 'win32' ? 'apksigner.bat' : 'apksigner') : 'apksigner';
  const result = spawnSync(apksigner, ['verify', '--verbose', file], { encoding: 'utf8', shell: process.platform === 'win32' });
  return { expected: 'upload-key-signed', verified: result.status === 0 };
}
