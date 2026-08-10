"""F(n, k): the number that completes a repeated-digit block into Champernowne's sequence.

    F(n, k) = C(k) - R(n, k - 1)

where
    C(k)      = the first k digits of 1234567891011121314...  (Champernowne's constant)
    R(n, m)   = the digits of n repeated cyclically and truncated to exactly m digits

Everything is done with integer arithmetic only: no int <-> str conversion anywhere.
Digits are extracted with divmod/pow, and concatenation `a || b` is expressed as
`a * 10**len(b) + b`.
"""


def digit_count(n):
    """Number of decimal digits of a non-negative integer, by repeated division."""
    if n == 0:
        return 1
    count = 0
    while n:
        n //= 10
        count += 1
    return count


def repeat_digits(n, m):
    """The digits of n repeated cyclically, truncated to exactly m digits.

    repeat_digits(69, 6)     -> 696969
    repeat_digits(73829, 14) -> 73829738297382

    Uses the repunit identity instead of a loop: writing n's block d digits wide,
    q copies of it equal n * (10**(d*q) - 1) // (10**d - 1), because the second
    factor is 1 followed by q-1 groups of d zeros, i.e. 1000...1000...1.
    """
    if m <= 0:
        return 0
    d = digit_count(n)
    copies, leftover = divmod(m, d)

    block = 0
    if copies:
        # 10^(d*(copies-1)) + ... + 10^d + 1, as a closed form
        spacer = (pow(10, d * copies) - 1) // (pow(10, d) - 1)
        block = n * spacer

    if leftover:
        # append the top `leftover` digits of n
        block = block * pow(10, leftover) + n // pow(10, d - leftover)

    return block


def _concat_range(lo, hi, width):
    """Concatenate the integers lo..hi (each exactly `width` digits) into one integer.

    Returned as (value, digits). Split down the middle so the big-integer
    multiplications stay balanced -- a straight left-to-right loop would rescale
    the whole accumulator on every step and cost O(k^2).
    """
    if lo > hi:
        return 0, 0
    if lo == hi:
        return lo, width
    mid = (lo + hi) // 2
    left, left_digits = _concat_range(lo, mid, width)
    right, right_digits = _concat_range(mid + 1, hi, width)
    return left * pow(10, right_digits) + right, left_digits + right_digits


def champernowne_prefix(k):
    """The first k digits of 1234567891011121314... as an integer."""
    if k <= 0:
        return 0

    pieces = []          # (value, digits) chunks, in order
    remaining = k
    width = 1            # how many digits the current block's numbers have

    while remaining > 0:
        lo = pow(10, width - 1)
        hi = pow(10, width) - 1
        block_digits = (hi - lo + 1) * width

        if block_digits <= remaining:
            pieces.append(_concat_range(lo, hi, width))
            remaining -= block_digits
            width += 1
            continue

        whole, partial = divmod(remaining, width)
        if whole:
            pieces.append(_concat_range(lo, lo + whole - 1, width))
        if partial:
            # take just the leading `partial` digits of the next number
            nxt = lo + whole
            pieces.append((nxt // pow(10, width - partial), partial))
        remaining = 0

    # fold the chunks together pairwise, again to keep the multiplications balanced
    while len(pieces) > 1:
        merged = []
        for i in range(0, len(pieces) - 1, 2):
            (lv, ld), (rv, rd) = pieces[i], pieces[i + 1]
            merged.append((lv * pow(10, rd) + rv, ld + rd))
        if len(pieces) % 2:
            merged.append(pieces[-1])
        pieces = merged

    return pieces[0][0]


def F(n, k):
    """The addend that turns n's repeated digits into the first k digits of Champernowne.

    R(n, k-1) + F(n, k) == C(k)
    """
    if n < 0:
        raise ValueError("n must be non-negative")
    if k < 1:
        raise ValueError("k must be at least 1")
    return champernowne_prefix(k) - repeat_digits(n, k - 1)


if __name__ == "__main__":
    # The demo below formats numbers for display. That is printing, not solving --
    # the algorithm above never converts an int to a str.
    for n, k in ((123, 4), (69, 7), (73829, 15)):
        result = F(n, k)
        base = repeat_digits(n, k - 1)
        print("F(%d, %d) = %d      (%d + %d = %d)"
              % (n, k, result, base, result, base + result))
