# The `F(n, k)` challenge

Given the examples

```
F(123,   4)  = 1111             (123            + 1111           = 1234)
F(69,    7)  = 537598           (696969         + 537598         = 1234567)
F(73829, 15) = 49627050803730   (73829738297382 + 49627050803730 = 123456789101112)
```

find `F` — without converting numbers to strings. JavaScript, using `BigInt`.

## 1. Reverse-engineering the rule

Two things are being built on the left-hand side of each sum.

**The right-hand side** is always a prefix of `123456789101112131415...` — the
counting numbers glued together, known as *Champernowne's constant*. Call the
first `k` digits of it `C(k)`. In all three examples the total has exactly `k`
digits, so the second argument is simply "how long is the answer".

**The first addend** is `n`'s own digits, repeated over and over. Call it
`R(n, m)` = the digits of `n` cycled and cut to exactly `m` digits.

The only real question is what `m` is. Line up the digit counts:

| `n` | `k` | repeated block | its digits | target | its digits |
|---|---|---|---|---|---|
| `123` | 4 | `123` | 3 | `1234` | 4 |
| `69` | 7 | `696969` | 6 | `1234567` | 7 |
| `73829` | 15 | `73829738297382` | 14 | `123456789101112` | 15 |

The block is always **`k - 1`** digits long. The third example is what pins this
down: `73829` is 5 digits wide, and 14 is not a multiple of 5, so the block is a
*hard truncation* mid-copy (`73829|73829|7382`), not "as many whole copies as
fit". The first two examples happen to land on clean copy boundaries and can't
distinguish the two theories; the third can.

So:

```js
F(n, k) = C(k) - R(n, k - 1)
```

### Why the answer is always positive

`C(k)` begins with the digit `1`, so `10^(k-1) <= C(k) < 2 * 10^(k-1)`. And
`R(n, k-1)` has only `k-1` digits, so `R(n, k-1) < 10^(k-1)`. The subtraction
can never go negative. Note that `F` itself is *not* bounded to `k-1` digits —
`F(1, 4) = 1234 - 111 = 1123` has four.

## 2. Why this has to be `BigInt`

JavaScript's `Number` is a float64 with 53 bits of integer precision, so it goes
wrong at 16 digits — before even the third example:

```js
73829738297382 + 49627050803730          // 123456789101112     ✅ 15 digits, still fine
123456789101112131n                      // needs BigInt        ❌ as a Number: 123456789101112130
```

So every value in the algorithm is a `BigInt`, with `Number` used only for digit
*counts* (small by definition). This is a real difference from the same solution
in a language with arbitrary-precision integers by default — in JS you must opt in
deliberately, and mixing the two types throws `TypeError` rather than silently
rounding, which is a feature here.

## 3. Building `R(n, m)` with arithmetic only

Concatenating `b` onto `a` is `a * 10n ** len(b) + b`. That single identity
replaces every string operation here.

First, `digitCount` divides by `10n` until nothing is left.

Then, to repeat `n` (a `d`-digit block) `q` times, the naive way is a loop of `q`
concatenations. There's a closed form instead. The number

```
(10^(d*q) - 1) / (10^d - 1)  =  1 0…0 1 0…0 1 … 1     (q ones, spaced d apart)
```

is a "repunit with gaps" — for `d = 2, q = 3` it is `010101` → `10101`.
Multiplying `n` by it drops a copy of `n` into each slot at once:

```js
69n * 10101n === 696969n
```

Then any leftover partial copy is the top `r` digits of `n`, which is just
`n / 10n ** (d - r)` (`BigInt` division truncates, which is exactly what's wanted),
appended with the same multiply-and-add:

```js
const copies = Math.floor(m / d);
const leftover = m % d;
let block = n * ((pow10(d * copies) - 1n) / (pow10(d) - 1n));
block = block * pow10(leftover) + n / pow10(d - leftover);
```

## 4. Building `C(k)` with arithmetic only

Champernowne's digits arrive in blocks of fixed width: the 1-digit numbers `1..9`
contribute 9 digits, the 2-digit numbers `10..99` contribute 180, the `w`-digit
numbers contribute `9 * 10^(w-1) * w`. Walk the widths, taking whole blocks while
they fit in the remaining budget. When a block overruns, take `remaining / w`
whole numbers from it, then slice the leading `remaining % w` digits off the next
number with one integer division.

The subtlety is *how* to glue the pieces. Concatenating left to right —
`total = total * 10n ** w + i` for each `i` — rescales the entire accumulator on
every step, and since the accumulator grows to `k` digits, that costs O(k²).
Instead `concatRange` splits each range down the middle and the final chunks are
folded pairwise, so multiplications stay balanced between similarly-sized
operands. That brings it to O(M(k) log k) for big-integer multiplication cost `M`.

Measured on Node 22, building `F(73829n, k)`:

| `k` | time |
|---|---|
| 1,000 | 0.8 ms |
| 10,000 | 8.2 ms |
| 100,000 | 33 ms |
| 200,000 | 78 ms |

## 5. On the no-strings rule

The algorithm never converts a number to a string — only the demo block under
`require.main === module` formats results for display, which any program producing
output must do.

Avoiding strings is a genuine advantage rather than an artificial handicap.
`BigInt.prototype.toString` is superlinear for very large values, so the "obvious"
string solution pays a growing tax exactly where this one stays cheap. (In Python
the equivalent is a hard error: CPython refuses int↔str conversion past 4300
digits by default.)

## Files

- `solution.js` — the implementation
- `test.js` — 13 tests, including randomized checks against a deliberately
  string-based oracle (fine in tests: it's the independent reference the real
  solution is checked against)

```
$ node solution.js
F(123, 4) = 1111      (123 + 1111 = 1234)
F(69, 7) = 537598      (696969 + 537598 = 1234567)
F(73829, 15) = 49627050803730      (73829738297382 + 49627050803730 = 123456789101112)

$ node --test
# tests 13
# pass 13
# fail 0
```
