'use strict';

/**
 * F(n, k): the number that completes a repeated-digit block into Champernowne's sequence.
 *
 *     F(n, k) = C(k) - R(n, k - 1)
 *
 * where
 *     C(k)    = the first k digits of 1234567891011121314...  (Champernowne's constant)
 *     R(n, m) = the digits of n repeated cyclically and truncated to exactly m digits
 *
 * Everything is BigInt arithmetic: no Number <-> String conversion anywhere, and no
 * float Numbers in the math either (the values blow past Number.MAX_SAFE_INTEGER by
 * k = 16). Digits are extracted with division and exponentiation, and concatenating
 * `b` onto `a` is expressed as `a * 10n ** len(b) + b`.
 */

/** 10n ** e, with a plain-Number exponent for convenience. */
function pow10(e) {
  return 10n ** BigInt(e);
}

/** Number of decimal digits of a non-negative BigInt, by repeated division. */
function digitCount(n) {
  if (n === 0n) return 1;
  let count = 0;
  while (n > 0n) {
    n /= 10n;
    count += 1;
  }
  return count;
}

/**
 * The digits of n repeated cyclically, truncated to exactly m digits.
 *
 *     repeatDigits(69n, 6)     -> 696969n
 *     repeatDigits(73829n, 14) -> 73829738297382n
 *
 * Uses the repunit identity instead of a loop: writing n's block d digits wide,
 * q copies of it equal n * (10^(d*q) - 1) / (10^d - 1), because the second factor
 * is 1 followed by q-1 groups of d zeros, i.e. 1000...1000...1.
 */
function repeatDigits(n, m) {
  if (m <= 0) return 0n;

  const d = digitCount(n);
  const copies = Math.floor(m / d);
  const leftover = m % d;

  let block = 0n;
  if (copies > 0) {
    // 10^(d*(copies-1)) + ... + 10^d + 1, as a closed form
    const spacer = (pow10(d * copies) - 1n) / (pow10(d) - 1n);
    block = n * spacer;
  }

  if (leftover > 0) {
    // append the top `leftover` digits of n
    block = block * pow10(leftover) + n / pow10(d - leftover);
  }

  return block;
}

/**
 * Concatenate the integers lo..hi (each exactly `width` digits) into one BigInt.
 *
 * Returns [value, digits]. Splits down the middle so the BigInt multiplications stay
 * balanced -- a straight left-to-right loop would rescale the whole accumulator on
 * every step and cost O(k^2).
 */
function concatRange(lo, hi, width) {
  if (lo > hi) return [0n, 0];
  if (lo === hi) return [lo, width];

  const mid = (lo + hi) / 2n;
  const [left, leftDigits] = concatRange(lo, mid, width);
  const [right, rightDigits] = concatRange(mid + 1n, hi, width);
  return [left * pow10(rightDigits) + right, leftDigits + rightDigits];
}

/** The first k digits of 1234567891011121314... as a BigInt. */
function champernownePrefix(k) {
  if (k <= 0) return 0n;

  let pieces = [];      // [value, digits] chunks, in order
  let remaining = k;
  let width = 1;        // how many digits the current block's numbers have

  while (remaining > 0) {
    const lo = pow10(width - 1);
    const hi = pow10(width) - 1n;
    const blockDigits = (hi - lo + 1n) * BigInt(width);

    if (blockDigits <= BigInt(remaining)) {
      pieces.push(concatRange(lo, hi, width));
      remaining -= Number(blockDigits);
      width += 1;
      continue;
    }

    const whole = Math.floor(remaining / width);
    const partial = remaining % width;
    if (whole > 0) {
      pieces.push(concatRange(lo, lo + BigInt(whole) - 1n, width));
    }
    if (partial > 0) {
      // take just the leading `partial` digits of the next number
      const next = lo + BigInt(whole);
      pieces.push([next / pow10(width - partial), partial]);
    }
    remaining = 0;
  }

  // fold the chunks together pairwise, again to keep the multiplications balanced
  while (pieces.length > 1) {
    const merged = [];
    for (let i = 0; i + 1 < pieces.length; i += 2) {
      const [lv, ld] = pieces[i];
      const [rv, rd] = pieces[i + 1];
      merged.push([lv * pow10(rd) + rv, ld + rd]);
    }
    if (pieces.length % 2 === 1) {
      merged.push(pieces[pieces.length - 1]);
    }
    pieces = merged;
  }

  return pieces[0][0];
}

/**
 * The addend that turns n's repeated digits into the first k digits of Champernowne.
 *
 *     R(n, k-1) + F(n, k) === C(k)
 *
 * @param {bigint|number} n  non-negative; pass a BigInt if it exceeds 2^53
 * @param {number} k         how many digits the target has, >= 1
 * @returns {bigint}
 */
function F(n, k) {
  const value = BigInt(n);
  if (value < 0n) throw new RangeError('n must be non-negative');
  if (!Number.isInteger(k) || k < 1) throw new RangeError('k must be an integer >= 1');
  return champernownePrefix(k) - repeatDigits(value, k - 1);
}

module.exports = { F, champernownePrefix, repeatDigits, digitCount, pow10 };

if (require.main === module) {
  // The demo below formats numbers for display. That is printing, not solving --
  // the algorithm above never converts a number to a string.
  for (const [n, k] of [[123n, 4], [69n, 7], [73829n, 15]]) {
    const result = F(n, k);
    const base = repeatDigits(n, k - 1);
    console.log(`F(${n}, ${k}) = ${result}      (${base} + ${result} = ${base + result})`);
  }
}
