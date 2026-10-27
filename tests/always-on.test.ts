import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alwaysOnSchedule, scannerSnapshot } from '../src/lib/simulator';

test('always-on demo counter keeps counting overnight and at weekends', () => {
  // Sunday 23:30 Brisbane time (UTC+10) = Sunday 13:30 UTC.
  const origin = Date.UTC(2026, 9, 18, 13, 30, 0);
  const snap = scannerSnapshot(origin, origin + 60_000, 0, alwaysOnSchedule);
  assert.equal(snap.overnight, false);
  assert.equal(snap.active, true);
  assert.equal(snap.count, 60 * alwaysOnSchedule.rate);
});
