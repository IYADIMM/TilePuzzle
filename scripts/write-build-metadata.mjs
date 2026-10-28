import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const sha = git('rev-parse', 'HEAD');
const status = git('status', '--porcelain', '--untracked-files=no');
const dirty = Boolean(status);
const commitEpoch = Number(git('show', '-s', '--format=%ct', 'HEAD'));
const sourceEpoch = Number(process.env.SOURCE_DATE_EPOCH || commitEpoch);
const versionCode = Number(process.env.JGT_VERSION_CODE || 1);
const versionName = process.env.JGT_VERSION_NAME || `${pkg.version}-rc.1`;
const metadata = {
  appId: 'com.iyadimm.jadegardentiles',
  versionCode,
  versionName,
  gitSha: sha,
  gitShortSha: sha.slice(0, 12),
  dirty,
  buildTimestamp: new Date(sourceEpoch * 1000).toISOString(),
  releaseStatus: dirty ? 'NOT_RELEASE_CANDIDATE_DIRTY_TREE' : 'SOURCE_CLEAN',
  generatedBy: 'scripts/write-build-metadata.mjs'
};
const out = path.join(root, 'public', 'generated');
await mkdir(out, { recursive: true });
await writeFile(path.join(out, 'build-metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`Build metadata: ${metadata.versionName} (${metadata.versionCode}) ${metadata.gitShortSha} ${metadata.releaseStatus}`);
