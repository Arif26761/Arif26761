"""Tests for solution.F.

The oracle here deliberately DOES use strings. That is the point: the string
version is the obvious-but-disallowed implementation, so it makes an honest,
independent reference to check the arithmetic-only solution against.
"""

import random
import unittest
from itertools import count, islice

from solution import F, champernowne_prefix, digit_count, repeat_digits


def champernowne_prefix_oracle(k):
    digits = islice((c for i in count(1) for c in str(i)), k)
    return int("".join(digits))


def repeat_digits_oracle(n, m):
    if m <= 0:
        return 0
    s = str(n)
    return int((s * (m // len(s) + 1))[:m])


class TestHelpers(unittest.TestCase):
    def test_digit_count(self):
        self.assertEqual(digit_count(0), 1)
        self.assertEqual(digit_count(7), 1)
        self.assertEqual(digit_count(10), 2)
        self.assertEqual(digit_count(999), 3)
        self.assertEqual(digit_count(1000), 4)
        self.assertEqual(digit_count(10 ** 50), 51)

    def test_repeat_digits_examples(self):
        self.assertEqual(repeat_digits(123, 3), 123)
        self.assertEqual(repeat_digits(69, 6), 696969)
        self.assertEqual(repeat_digits(73829, 14), 73829738297382)

    def test_repeat_digits_truncates_mid_block(self):
        self.assertEqual(repeat_digits(123, 5), 12312)
        self.assertEqual(repeat_digits(123, 2), 12)
        self.assertEqual(repeat_digits(7, 4), 7777)
        self.assertEqual(repeat_digits(123, 0), 0)

    def test_repeat_digits_matches_oracle(self):
        rng = random.Random(1)
        for _ in range(300):
            n = rng.randrange(0, 10 ** rng.randrange(1, 12))
            m = rng.randrange(0, 60)
            self.assertEqual(repeat_digits(n, m), repeat_digits_oracle(n, m),
                             msg="n=%d m=%d" % (n, m))

    def test_champernowne_prefix_matches_oracle(self):
        for k in range(1, 400):
            self.assertEqual(champernowne_prefix(k), champernowne_prefix_oracle(k),
                             msg="k=%d" % k)

    def test_champernowne_crosses_digit_width_boundaries(self):
        # 9 -> end of 1-digit block, 189 -> end of 2-digit, 2889 -> end of 3-digit
        for k in (9, 10, 11, 189, 190, 191, 2889, 2890, 2891):
            self.assertEqual(champernowne_prefix(k), champernowne_prefix_oracle(k),
                             msg="k=%d" % k)


class TestF(unittest.TestCase):
    def test_given_examples(self):
        self.assertEqual(F(123, 4), 1111)
        self.assertEqual(F(69, 7), 537598)
        self.assertEqual(F(73829, 15), 49627050803730)

    def test_defining_identity(self):
        """R(n, k-1) + F(n, k) == C(k), for a wide spread of inputs."""
        rng = random.Random(2)
        for _ in range(400):
            n = rng.randrange(1, 10 ** rng.randrange(1, 10))
            k = rng.randrange(1, 250)
            self.assertEqual(repeat_digits(n, k - 1) + F(n, k),
                             champernowne_prefix(k),
                             msg="n=%d k=%d" % (n, k))

    def test_result_is_always_positive(self):
        """C(k) >= 10**(k-1) and R(n, k-1) < 10**(k-1), so F is never <= 0."""
        rng = random.Random(3)
        for _ in range(200):
            n = rng.randrange(1, 10 ** rng.randrange(1, 8))
            k = rng.randrange(1, 120)
            self.assertGreater(F(n, k), 0, msg="n=%d k=%d" % (n, k))

    def test_k_of_one(self):
        # No repeated block at all; F is just the first digit of Champernowne.
        self.assertEqual(F(999, 1), 1)

    def test_rejects_bad_arguments(self):
        with self.assertRaises(ValueError):
            F(10, 0)
        with self.assertRaises(ValueError):
            F(-1, 5)

    def test_large_k(self):
        k = 20000
        n = 73829
        self.assertEqual(repeat_digits(n, k - 1) + F(n, k), champernowne_prefix(k))

        # The string oracle needs its leash loosened past CPython's 4300-digit
        # int<->str limit to get this far. The arithmetic solution has no such
        # ceiling, which is a side benefit of never touching str.
        import sys
        old = sys.get_int_max_str_digits()
        sys.set_int_max_str_digits(k + 10)
        try:
            self.assertEqual(champernowne_prefix(k), champernowne_prefix_oracle(k))
        finally:
            sys.set_int_max_str_digits(old)


if __name__ == "__main__":
    unittest.main(verbosity=2)
