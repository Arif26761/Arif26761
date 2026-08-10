'use strict';

/**
 * Tests for F.
 *
 * The oracle here deliberately DOES use strings. That is the point: the string
 * version is the obvious-but-disallowed implementation, so it makes an honest,
 * independent reference to check the arithmetic-only solution against.
 *
 * Run with:  node --test
 */

const test = require('node:test');
const assert = require('node:assert');

const { F, champernownePrefix, repeatDigits, digitCount } = require('./solution');

function champernownePrefixOracle(k) {
  let s = '';
  for (let i = 1; s.length < k; i++) s += i;
  return BigInt(s.slice(0, k));
}

function repeatDigitsOracle(n, m) {
  if (m <= 0) return 0n;
  const s = String(n);
  return BigInt(s.repeat(Math.floor(m / s.length) + 1).slice(0, m));
}

/** Deterministic PRNG so failures are reproducible. */
function makeRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function randomBigInt(rng, maxDigits) {
  const digits = 1 + Math.floor(rng() * maxDigits);
  let value = 1n + BigInt(Math.floor(rng() * 9));   // no leading zero
  for (let i = 1; i < digits; i++) {
    value = value * 10n + BigInt(Math.floor(rng() * 10));
  }
  return value;
}

test('digitCount', () => {
  assert.strictEqual(digitCount(0n), 1);
  assert.strictEqual(digitCount(7n), 1);
  assert.strictEqual(digitCount(10n), 2);
  assert.strictEqual(digitCount(999n), 3);
  assert.strictEqual(digitCount(1000n), 4);
  assert.strictEqual(digitCount(10n ** 50n), 51);
});

test('repeatDigits reproduces the blocks from the examples', () => {
  assert.strictEqual(repeatDigits(123n, 3), 123n);
  assert.strictEqual(repeatDigits(69n, 6), 696969n);
  assert.strictEqual(repeatDigits(73829n, 14), 73829738297382n);
});

test('repeatDigits truncates mid-copy', () => {
  assert.strictEqual(repeatDigits(123n, 5), 12312n);
  assert.strictEqual(repeatDigits(123n, 2), 12n);
  assert.strictEqual(repeatDigits(7n, 4), 7777n);
  assert.strictEqual(repeatDigits(123n, 0), 0n);
});

test('repeatDigits matches the string oracle', () => {
  const rng = makeRng(1);
  for (let i = 0; i < 300; i++) {
    const n = randomBigInt(rng, 12);
    const m = Math.floor(rng() * 60);
    assert.strictEqual(repeatDigits(n, m), repeatDigitsOracle(n, m), `n=${n} m=${m}`);
  }
});

test('champernownePrefix matches the string oracle', () => {
  for (let k = 1; k < 400; k++) {
    assert.strictEqual(champernownePrefix(k), champernownePrefixOracle(k), `k=${k}`);
  }
});

test('champernownePrefix crosses digit-width boundaries', () => {
  // 9 ends the 1-digit block, 189 the 2-digit block, 2889 the 3-digit block
  for (const k of [9, 10, 11, 189, 190, 191, 2889, 2890, 2891]) {
    assert.strictEqual(champernownePrefix(k), champernownePrefixOracle(k), `k=${k}`);
  }
});

test('the three given examples', () => {
  assert.strictEqual(F(123n, 4), 1111n);
  assert.strictEqual(F(69n, 7), 537598n);
  assert.strictEqual(F(73829n, 15), 49627050803730n);
});

test('plain Numbers are accepted for n', () => {
  assert.strictEqual(F(123, 4), 1111n);
  assert.strictEqual(F(73829, 15), 49627050803730n);
});

test('defining identity: R(n, k-1) + F(n, k) === C(k)', () => {
  const rng = makeRng(2);
  for (let i = 0; i < 400; i++) {
    const n = randomBigInt(rng, 10);
    const k = 1 + Math.floor(rng() * 250);
    assert.strictEqual(repeatDigits(n, k - 1) + F(n, k), champernownePrefix(k), `n=${n} k=${k}`);
  }
});

test('the result is always positive', () => {
  // C(k) >= 10^(k-1) and R(n, k-1) < 10^(k-1), so F can never go <= 0
  const rng = makeRng(3);
  for (let i = 0; i < 200; i++) {
    const n = randomBigInt(rng, 8);
    const k = 1 + Math.floor(rng() * 120);
    assert.ok(F(n, k) > 0n, `n=${n} k=${k}`);
  }
});

test('k = 1 leaves no repeated block at all', () => {
  assert.strictEqual(F(999n, 1), 1n);
});

test('bad arguments are rejected', () => {
  assert.throws(() => F(10n, 0), RangeError);
  assert.throws(() => F(-1n, 5), RangeError);
  assert.throws(() => F(10n, 2.5), RangeError);
});

test('large k', () => {
  const k = 20000;
  const n = 73829n;
  assert.strictEqual(repeatDigits(n, k - 1) + F(n, k), champernownePrefix(k));
  assert.strictEqual(champernownePrefix(k), champernownePrefixOracle(k));
});
