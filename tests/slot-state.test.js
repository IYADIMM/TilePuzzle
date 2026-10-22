import test from 'node:test';
import assert from 'node:assert/strict';
import { createTrayState, reduceTray, TRAY_CAPACITY } from '../src/logic/SlotState.js';

const tile = (id, typeId) => ({ visualId: id, typeId });
const insert = (state, entry) => reduceTray(state, { type: 'INSERT', tile: entry });

test('tray capacity is permanently four', () => assert.equal(TRAY_CAPACITY, 4));

test('two identical tiles remain until the third arrives', () => {
  let state = createTrayState();
  state = insert(state, tile('s1', 'STAR')).state;
  const two = insert(state, tile('s2', ' star '));
  assert.equal(two.didClear, false);
  assert.deepEqual(two.state.entries.map(entry => entry.typeId), ['star', 'star']);
  const three = insert(two.state, tile('s3', 'Star'));
  assert.equal(three.didClear, true);
  assert.deepEqual(three.state.entries, []);
});

test('third identical tile clears atomically before full evaluation', () => {
  const state = createTrayState([tile('a1', 'cherry'), tile('a2', 'cherry'), tile('o1', 'orange')]);
  const out = insert(state, tile('a3', 'cherry'));
  assert.equal(out.didClear, true);
  assert.equal(out.full, false);
  assert.deepEqual(out.state.entries, [tile('o1', 'orange')]);
  assert.deepEqual(out.cleared.map(entry => entry.visualId), ['a1', 'a2', 'a3']);
});

test('three occupied slots can resolve to one on the fourth selection', () => {
  const state = createTrayState([tile('s1', 'star'), tile('s2', 'star'), tile('c1', 'cherry')]);
  const out = insert(state, tile('s3', 'star'));
  assert.deepEqual(out.state.entries, [tile('c1', 'cherry')]);
  assert.equal(out.full, false);
});

test('four unmatched entries are a valid loss and a fifth is rejected', () => {
  let state = createTrayState();
  for (const id of ['star', 'cherry', 'orange', 'banana']) state = insert(state, tile(id, id)).state;
  assert.equal(state.entries.length, 4);
  const rejected = insert(state, tile('pear', 'pear'));
  assert.equal(rejected.accepted, false);
  assert.equal(rejected.reason, 'capacity');
  assert.equal(rejected.full, true);
});

test('matched identities never linger in authoritative state or depend on animation', () => {
  let state = createTrayState();
  const results = [];
  for (let i = 0; i < 3; i++) {
    const result = insert(state, tile(`x${i}`, 'X'));
    results.push(result);
    state = result.state;
  }
  assert.equal(state.entries.length, 0);
  assert.equal(results[2].cleared.length, 3);
  assert.equal(results[2].state.entries.length, 0);
  assert.equal(Object.isFrozen(results[2].state.entries), true);
});

test('duplicate and rapid repeat insertions cannot create ghost occupancy', () => {
  const first = insert(createTrayState(), tile('same-board-tile', 'orange'));
  const duplicate = insert(first.state, tile('same-board-tile', 'orange'));
  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.reason, 'duplicate');
  assert.deepEqual(duplicate.state, first.state);
});

test('a matching typeId is mandatory and never falls back to the unique visual id', () => {
  assert.throws(() => insert(createTrayState(), { visualId: 'unique-instance-only' }), /typeId/);
  assert.throws(() => createTrayState([{ visualId: 'unique-instance-only' }]), /typeId/);
});

test('undo snapshot can restore the exact pre-triple tray', () => {
  const before = createTrayState([tile('a1', 'star'), tile('a2', 'star'), tile('c1', 'cherry')]);
  const after = insert(before, tile('a3', 'star'));
  assert.deepEqual(after.state.entries, [tile('c1', 'cherry')]);
  const restored = createTrayState(before.entries);
  assert.deepEqual(restored.entries, before.entries);
});
