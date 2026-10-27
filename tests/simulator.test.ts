import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeSecondsBetween, scannerSnapshot } from '../src/lib/simulator';
const at = (date: string, time: string) => Date.parse(`${date}T${time}+10:00`);
test('opening, active/idle and closing boundaries', () => {
  assert.equal(activeSecondsBetween(at('2026-10-16','06:59:00'),at('2026-10-16','07:01:00')),60);
  assert.equal(activeSecondsBetween(at('2026-10-16','07:00:00'),at('2026-10-16','07:20:00')),420);
  assert.equal(activeSecondsBetween(at('2026-10-16','07:07:00'),at('2026-10-16','07:20:00')),0);
  assert.equal(activeSecondsBetween(at('2026-10-16','16:59:00'),at('2026-10-16','17:01:00')),0);
  assert.equal(scannerSnapshot(at('2026-10-16','07:00:00'),at('2026-10-16','17:00:00')).overnight,true);
});
test('Friday to Saturday to Sunday and midnight have identical schedules',()=>{
  assert.equal(activeSecondsBetween(at('2026-10-16','00:00:00'),at('2026-10-19','00:00:00')),3*30*420);
  assert.equal(activeSecondsBetween(at('2026-10-17','23:59:00'),at('2026-10-18','07:01:00')),60);
  assert.equal(scannerSnapshot(0,at('2026-10-17','18:00:00')).nextStart,at('2026-10-18','07:00:00'));
});
test('timestamp recalculation is additive and independent of timer ticks',()=>{
  const a=at('2026-10-18','07:03:13'), b=at('2026-10-18','12:05:24'), c=at('2026-10-19','11:01:49');
  assert.equal(activeSecondsBetween(a,c),activeSecondsBetween(a,b)+activeSecondsBetween(b,c));
  assert.equal(scannerSnapshot(a,b,100).count,100+activeSecondsBetween(a,b)*300000);
  assert.equal(activeSecondsBetween(c,a),0);
});
