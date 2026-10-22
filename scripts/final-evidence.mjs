import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchQaBrowser,legalTilePoint,startQaServer } from './qa-helpers.mjs';
import { LEVEL_CONFIGS } from '../src/data/levels.js';
import { generateLevel } from '../src/logic/LevelGenerator.js';
import { computeBlockedBy } from '../src/logic/LevelSolver.js';
import { createTrayState, reduceTray } from '../src/logic/SlotState.js';

const root = process.cwd();
const output = path.join(root, 'qa', 'audit-final-evidence');
await mkdir(output, { recursive: true });
const server = await startQaServer(root,4178);
const browser = await launchQaBrowser();
const report = [];

async function capture(name, url, action, viewport = { width: 390, height: 844 }) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:4178/${url}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(()=>window.jadeGame?.isBooted,{timeout:8000});
  await page.waitForTimeout(850);
  if (action) await action(page);
  const file = path.join(output, `${name}.png`);
  await page.screenshot({ path: file });
  const activeScenes=await page.evaluate(()=>window.jadeGame?.scene?.getScenes(true).map(scene=>scene.scene.key)||[]);
  report.push({ name, file, viewport, canvas: await page.locator('canvas').count(), activeScenes, errors });
  await page.close();
}

const tapSolution = async (page, count = Infinity, pause = 950, fast = false) => {
  const ids = await page.evaluate(() => jadeGame.scene.getScene('Game').board.level.solution);
  if(fast)await page.evaluate(()=>{jadeGame.scene.getScene('Game').tweens.timeScale=12;});
  for (const id of ids.slice(0, count)) {
    const point=await legalTilePoint(page,id);
    await page.mouse.click(point.x,point.y);
    if(fast)await page.waitForFunction(()=>{const scene=window.jadeGame?.scene?.getScene('Game');return !scene?.scene?.isActive()||!scene.tray?.isBusy;},{timeout:2400});
    else await page.waitForTimeout(pause);
  }
  if(fast)await page.evaluate(()=>{const scene=jadeGame.scene.getScene('Game');if(scene)scene.tweens.timeScale=1;});
};

await capture('01-premium-home-390x844', '', null);
await capture('02-fruit-level-390x844', '?screen=game&level=1', null);
await capture('03-car-chrome-level-390x844', '?screen=game&level=2', null);
await capture('04-sports-leather-level-390x844', '?screen=game&level=3', null);
await capture('05-wild-animal-level-390x844', '?screen=game&level=5', null);
await capture('05b-auto-parts-level-390x844', '?screen=game&level=4', null);
await capture('06-soft-fur-material-detail-390x844', '?screen=game&level=5&debugGrid=1', null);
await capture('07-four-slot-collection-tray-390x844', '?screen=game&level=1', null);

await capture('07b-pending-pair-highlight-390x844', '?screen=game&level=1', async page => {
  await tapSolution(page, 2);
  await page.waitForTimeout(160);
});

await capture('08-successful-triple-smash-390x844', '?screen=game&level=1', async page => {
  await tapSolution(page, 2);
  const third = await page.evaluate(() => jadeGame.scene.getScene('Game').board.level.solution[2]);
  const point=await legalTilePoint(page,third);
  await page.mouse.click(point.x,point.y);
  await page.waitForTimeout(55);
});

await capture('09-tray-cleared-immediately-390x844', '?screen=game&level=1', async page => {
  await tapSolution(page, 3);
  await page.waitForTimeout(180);
});

const losing = findLosingSequence();
await capture('10-legitimate-tray-full-390x844', `?screen=game&level=${losing.level}`, async page => {
  for (const id of losing.sequence) {
    const point=await legalTilePoint(page,id);
    await page.mouse.click(point.x,point.y);
    await page.waitForTimeout(950);
  }
  await page.waitForTimeout(520);
});

await capture('11-level-completion-celebration-390x844', '?screen=game&level=1', async page => {
  await tapSolution(page, Infinity, 950, true);
  await page.waitForTimeout(900);
});

await capture('12-achievement-reward-screen-390x844', '?screen=collection', async page => {
  await page.evaluate(() => {
    const save = {
      version: 2, maxUnlockedLevel: 8, lastLevel: 8, coins: 825, xp: 180, stars: 21,
      chestProgress: 3, completedLevels: { 1: { score: 1200, stars: 3, bestTime: 24 } },
      claimedRewards: { 'level:1': true }, achievements: { 'first-clear': { claimed: true, at: Date.now() } },
      unlockedThemes: ['fruits', 'cars', 'sports'], boosters: { undo: 3, hint: 3, shuffle: 3 },
      prefs: { audioDisabled: true, haptics: false, reducedMotion: false }
    };
    localStorage.setItem('jade-garden-tiles-save-v2', JSON.stringify(save));
    jadeGame.scene.start('Achievements');
  });
  await page.waitForTimeout(900);
});

await capture('13-pause-settings-silent-390x844', '?screen=game&level=1', async page => {
  await page.evaluate(() => jadeGame.scene.getScene('Game').pauseGame());
  await page.waitForTimeout(450);
});

await capture('14-runtime-icon-contact-sheet-768x1024', '?screen=icons', null, { width: 768, height: 1024 });
await capture('15-level-navigation-390x844', '?screen=levels', null);
await capture('16-mock-economy-shop-390x844', '?screen=shop', null);

await browser.close();
server.command.kill();
const completion=report.find(item=>item.name==='11-level-completion-celebration-390x844');
const passed = report.length === 18 && report.every(item => item.canvas === 1 && item.errors.length === 0) && completion?.activeScenes.includes('Reward');
await writeFile(path.join(root, 'qa', 'final-evidence-report.json'), JSON.stringify({ passed, losing, captures: report }, null, 2));
console.log(JSON.stringify({ passed, losing, captures: report.map(item => ({ name: item.name, errors: item.errors })) }, null, 2));
if (!passed) process.exitCode = 1;

function findLosingSequence() {
  for (const config of LEVEL_CONFIGS) {
    const level = generateLevel(config);
    const byId = new Map(level.tiles.map(tile => [tile.id, tile]));
    const search = (alive, tray, sequence) => {
      if (tray.entries.length === 4) return sequence;
      if (sequence.length === 4) return null;
      const blockers = computeBlockedBy(level.tiles, alive);
      const exposed = [...alive].filter(id => !(blockers.get(id)?.length)).map(id => byId.get(id));
      for (const tile of exposed) {
        const next = reduceTray(tray, { type: 'INSERT', tile: { visualId: tile.id, typeId: tile.typeId } });
        if (!next.accepted || next.didClear) continue;
        const nextAlive = new Set(alive); nextAlive.delete(tile.id);
        const result = search(nextAlive, next.state, [...sequence, tile.id]);
        if (result) return result;
      }
      return null;
    };
    const sequence = search(new Set(level.tiles.map(tile => tile.id)), createTrayState(), []);
    if (sequence) return { level: config.level, sequence };
  }
  throw new Error('No solver-legal four-unmatched losing sequence found');
}

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
