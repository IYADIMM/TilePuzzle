import test from 'node:test';
import assert from 'node:assert/strict';
import { canCompleteLevel } from '../src/logic/VictoryState.js';
import { quadraticBezierPoint } from '../src/logic/MotionMath.js';

test('victory cannot occur after one triple while board tiles remain',()=>{assert.equal(canCompleteLevel({remainingBoard:18,trayCount:0,busy:false}),false);});
test('victory requires board and tray empty after the transaction settles',()=>{assert.equal(canCompleteLevel({remainingBoard:0,trayCount:1,busy:false}),false);assert.equal(canCompleteLevel({remainingBoard:0,trayCount:0,busy:true}),false);assert.equal(canCompleteLevel({remainingBoard:0,trayCount:0,busy:false}),true);});
test('victory notification is single-fire',()=>{assert.equal(canCompleteLevel({remainingBoard:0,trayCount:0,busy:false,alreadyEmitted:true}),false);});
test('tray flight midpoint follows an elevated quadratic curve',()=>{const point=quadraticBezierPoint(100,200,200,80,300,500,.5);assert.equal(point.x,200);assert.equal(point.y,215);assert.notEqual(point.y,350);});
