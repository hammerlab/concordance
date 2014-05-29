#!/usr/bin/env python
"""Print stats and sample call sites between two VCF files.

Usage:
    ./diff_vcfs.py caller1.vcf caller2.vcf
"""

import sys
import vcf
import random


# In PyVCF, a [] for FILTER means the filter was PASS.
# c.f. https://github.com/jamescasbon/PyVCF/issues/153
PASS = []


def call_key(call):
    return '%s:%s' % (call.CHROM, call.POS)


def is_ok(call):
    return call.FILTER == PASS or not call.FILTER


def main(args):
    assert len(args) == 2
    vcfs = [vcf.Reader(open(path)) for path in args]

    calls = [set([call_key(call) for call in reader if is_ok(call)])
             for reader in vcfs]

    a = calls[0]
    b = calls[1]
    r = random.Random()
    print '''Sources:
A: %s
B: %s

Counts:
A: %d
B: %d
A`B: %d
B`A: %d
A^B: %d
A+B: %d

Pairwise samples:
A`B: %s
B`A: %s
A^B: %s
''' % (args[0],
       args[1],
       len(a),
       len(b),
       len(a - b),
       len(b - a),
       len(a.intersection(b)),
       len(a.union(b)),
       ', '.join(r.sample(a - b, 10)),
       ', '.join(r.sample(b - a, 10)),
       ', '.join(r.sample(a.intersection(b), 10)))


if __name__ == '__main__':
    main(sys.argv[1:])
