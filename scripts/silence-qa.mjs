import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { LEVEL_CONFIGS } from '../src/data/levels.js';
import { generateLevel } from '../src/logic/LevelGenerator.js';
import { computeBlockedBy } from '../src/logic/LevelSolver.js';
import { createTrayState, reduceTray } from '../src/logic/SlotState.js';

const root = process.cwd();
const port = 4179;
const server = process.platform === 'win32'
  ? spawn('C:\\Windows\\System32\\cmd.exe', ['/d', '/s', '/c', `npm run dev -- --port ${port}`], { cwd: root, stdio: 'ignore' })
  : spawn('npm', ['run', 'dev', '--', '--port', String(port)], { cwd: root, stdio: 'ignore' });
await new Promise(resolve => setTimeout(resolve, 2500));
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await page.addInitScript(() => {
  window.__audioAudit = { contextConstructions: 0, mediaPlayCalls: 0 };
  for (const key of ['AudioContext', 'webkitAudioContext']) {
    const Original = window[key];
    if (Original) window[key] = new Proxy(Original, { construct(target, args, receiver) { window.__audioAudit.contextConstructions++; return Reflect.construct(target, args, receiver); } });
  }
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) { window.__audioAudit.mediaPlayCalls++; return originalPlay.apply(this, args); };
});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const started = Date.now();
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await page.evaluate(() => jadeGame.scene.start('Game', { level: 1 }));
await page.waitForTimeout(900);

const select = async id => {
  await page.evaluate(tileId => {
    const scene = jadeGame.scene.getScene('Game');
    scene.board.requestSelection(scene.board.tiles.find(tile => tile.tileData.id === tileId));
  }, id);
  await page.waitForTimeout(430);
};
const firstSolution = await page.evaluate(() => jadeGame.scene.getScene('Game').board.level.solution);
for (const id of firstSolution.slice(0, 3)) await select(id);
await page.evaluate(() => jadeGame.scene.getScene('Game').pauseGame());
await page.waitForTimeout(500);
await page.evaluate(() => { const scene = jadeGame.scene.getScene('Game'); scene.modal.close(true); scene.board.setLocked(false); });

const loss = findLoss();
await page.evaluate(level => jadeGame.scene.start('Game', { level }), loss.level);
await page.waitForTimeout(900);
for (const id of loss.sequence) await select(id);
await page.waitForTimeout(650);
await page.evaluate(level => jadeGame.scene.getScene('Game').scene.restart({ level }), loss.level);
await page.waitForTimeout(900);

const fullSolution = await page.evaluate(() => jadeGame.scene.getScene('Game').board.level.solution);
for (const id of fullSolution) await select(id);
await page.waitForTimeout(1000);
const remaining = 60000 - (Date.now() - started);
if (remaining > 0) await page.waitForTimeout(remaining);
const audit = await page.evaluate(() => ({ ...window.__audioAudit, activeScene: jadeGame.scene.getScenes(true)[0]?.scene.key }));
await browser.close();
server.kill();
const report = { durationMs: Date.now() - started, interactions: ['home','game','multiple selections','triple','pause','resume','legitimate loss','restart','complete level','reward'], audit, errors, passed: audit.contextConstructions === 0 && audit.mediaPlayCalls === 0 && errors.length === 0 };
await writeFile(path.join(root, 'qa', 'silence-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;

function findLoss() {
  for (const config of LEVEL_CONFIGS) {
    const level = generateLevel(config), byId = new Map(level.tiles.map(tile => [tile.id, tile]));
    const dfs = (alive, tray, sequence) => {
      if (tray.entries.length === 4) return sequence;
      const blocked = computeBlockedBy(level.tiles, alive);
      for (const id of alive) {
        if (blocked.get(id)?.length) continue;
        const tile = byId.get(id), next = reduceTray(tray, { type: 'INSERT', tile: { visualId: id, typeId: tile.typeId } });
        if (!next.accepted || next.didClear) continue;
        const nextAlive = new Set(alive); nextAlive.delete(id);
        const found = dfs(nextAlive, next.state, [...sequence, id]);
        if (found) return found;
      }
      return null;
    };
    const sequence = dfs(new Set(level.tiles.map(tile => tile.id)), createTrayState(), []);
    if (sequence) return { level: config.level, sequence };
  }
  throw new Error('No legal loss sequence');
}
