import test from 'node:test';
import assert from 'node:assert/strict';
import { canCompleteLevel } from '../src/logic/VictoryState.js';
import { quadraticBezierPoint } from '../src/logic/MotionMath.js';

const evidence={levelTileCount:36,selectedTileCount:36,resolvedTrioCount:12,score:3600};
test('victory cannot occur after one triple while board tiles remain',()=>{assert.equal(canCompleteLevel({remainingBoard:18,trayCount:0,busy:false,evidence}),false);});
test('victory requires board, tray, transaction and legal-match evidence',()=>{assert.equal(canCompleteLevel({remainingBoard:0,trayCount:1,busy:false,evidence}),false);assert.equal(canCompleteLevel({remainingBoard:0,trayCount:0,busy:true,evidence}),false);assert.equal(canCompleteLevel({remainingBoard:0,trayCount:0,busy:false,evidence}),true);});
test('externally emptied tiles cannot force a zero-score victory',()=>{assert.equal(canCompleteLevel({remainingBoard:0,trayCount:0,busy:false,evidence:{levelTileCount:36,selectedTileCount:0,resolvedTrioCount:0,score:0}}),false);});
test('victory notification is single-fire',()=>{assert.equal(canCompleteLevel({remainingBoard:0,trayCount:0,busy:false,alreadyEmitted:true,evidence}),false);});
test('tray flight midpoint follows an elevated quadratic curve',()=>{const point=quadraticBezierPoint(100,200,200,80,300,500,.5);assert.equal(point.x,200);assert.equal(point.y,215);assert.notEqual(point.y,350);});
