import { execFileSync } from 'node:child_process';
import { access } from 'node:fs/promises';

const required = ['JGT_UPLOAD_KEYSTORE', 'JGT_UPLOAD_KEY_ALIAS', 'JGT_UPLOAD_STORE_PASSWORD', 'JGT_UPLOAD_KEY_PASSWORD'];
const missing = required.filter(name => !process.env[name]);
if (missing.length) throw new Error(`Release signing is waiting for owner credentials: ${missing.join(', ')}`);
await access(process.env.JGT_UPLOAD_KEYSTORE);
const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
if (dirty) throw new Error('Refusing to label a dirty working tree as a signed release candidate. Commit or stash changes first.');
if (!/^\d+$/.test(process.env.JGT_VERSION_CODE || '')) throw new Error('JGT_VERSION_CODE must be a positive integer.');
if (!process.env.JGT_VERSION_NAME?.trim()) throw new Error('JGT_VERSION_NAME is required.');
console.log('Release environment validated without printing credentials.');
