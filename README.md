# The `F(n, k)` challenge

Given the examples

```
F(123,   4)  = 1111             (123            + 1111           = 1234)
F(69,    7)  = 537598           (696969         + 537598         = 1234567)
F(73829, 15) = 49627050803730   (73829738297382 + 49627050803730 = 123456789101112)
```

find `F` — without converting numbers to strings.

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

```
F(n, k) = C(k) - R(n, k-1)
```

### Why the answer is always positive

`C(k)` begins with the digit `1`, so `10^(k-1) <= C(k) < 2 * 10^(k-1)`. And
`R(n, k-1)` has only `k-1` digits, so `R(n, k-1) < 10^(k-1)`. The subtraction
can never go negative. Note that `F` itself is *not* bounded to `k-1` digits —
`F(1, 4) = 1234 - 111 = 1123` has four.

## 2. Building `R(n, m)` with arithmetic only

Concatenating `b` onto `a` is `a * 10^(digits of b) + b`. That single identity
replaces every string operation here.

First, `digit_count` divides by 10 until nothing is left.

Then, to repeat `n` (a `d`-digit block) `q` times, the naive way is a loop of `q`
concatenations. There's a closed form instead. The number

```
(10^(d*q) - 1) / (10^d - 1)  =  1 0…0 1 0…0 1 … 1     (q ones, spaced d apart)
```

is a "repunit with gaps" — for `d = 2, q = 3` it is `010101` → `10101`.
Multiplying `n` by it drops a copy of `n` into each slot at once:

```
69 * 10101 = 696969
```

Then any leftover partial copy is the top `r` digits of `n`, which is just
`n // 10^(d - r)`, appended with the same multiply-and-add:

```python
copies, leftover = divmod(m, d)
block = n * (pow(10, d * copies) - 1) // (pow(10, d) - 1)
block = block * pow(10, leftover) + n // pow(10, d - leftover)
```

## 3. Building `C(k)` with arithmetic only

Champernowne's digits arrive in blocks of fixed width: the 1-digit numbers `1..9`
contribute 9 digits, the 2-digit numbers `10..99` contribute 180, the `w`-digit
numbers contribute `9 * 10^(w-1) * w`. Walk the widths, taking whole blocks while
they fit in the remaining budget. When a block overruns, take `remaining // w`
whole numbers from it, then slice the leading `remaining % w` digits off the next
number with one integer division.

The subtlety is *how* to glue the pieces. Concatenating left to right —
`total = total * 10^w + i` for each `i` — rescales the entire accumulator on every
step, and since the accumulator grows to `k` digits, that costs O(k²). Instead
`_concat_range` splits each range down the middle and the final chunks are folded
pairwise, so multiplications stay balanced between similarly-sized operands. That
brings it to O(M(k) log k) for big-integer multiplication cost `M`.

Measured, building `F(73829, k)`:

| `k` | time |
|---|---|
| 1,000 | 0.000 s |
| 10,000 | 0.002 s |
| 100,000 | 0.039 s |
| 200,000 | 0.110 s |

## 4. On the no-strings rule

The algorithm never converts an int to a str — only the `__main__` demo formats
results for display, which any program producing output must do.

Avoiding strings turns out to be a real advantage rather than an artificial
handicap. CPython caps int↔str conversion at 4300 digits by default, so the
"obvious" string solution raises `ValueError` at `k = 20000` unless you call
`sys.set_int_max_str_digits`. The arithmetic version has no such ceiling. This
actually surfaced while testing: `test_large_k` failed on the *oracle*, not the
solution.

## Files

- `solution.py` — the implementation
- `test_solution.py` — 12 tests, including randomized checks against a
  deliberately string-based oracle (fine in tests: it's the independent
  reference the real solution is checked against)

```
$ python3 solution.py
F(123, 4) = 1111      (123 + 1111 = 1234)
F(69, 7) = 537598      (696969 + 537598 = 1234567)
F(73829, 15) = 49627050803730      (73829738297382 + 49627050803730 = 123456789101112)

$ python3 -m unittest test_solution
Ran 12 tests in 0.073s
OK
```
