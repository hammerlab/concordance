#!/usr/bin/env python
"""Print stats and sample call sites between two VCF files.

Usage:
    ./diff_vcfs.py caller1.vcf caller2.vcf
"""

import sys
import random

import vcf


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

    a, b = [{call_key(call) for call in reader if is_ok(call)}
            for reader in vcfs]

    r = random.Random()
    print '''Sources:
A: %(sourceA)s
B: %(sourceB)s

Counts:
A: %(countA)d
B: %(countB)d
A`B: %(countAminusB)d
B`A: %(countBminusA)d
A^B: %(countAintB)d
A+B: %(countAunionB)d

Pairwise samples:
A`B: %(sampleAminusB)s
B`A: %(sampleBminusA)s
A^B: %(sampleAintB)s
''' % {'sourceA': args[0],
       'sourceB': args[1],
       'countA': len(a),
       'countB': len(b),
       'countAminusB': len(a - b),
       'countBminusA': len(b - a),
       'countAintB': len(a.intersection(b)),
       'countAunionB': len(a.union(b)),
       'sampleAminusB': ', '.join(r.sample(a - b, 10)),
       'sampleBminusA': ', '.join(r.sample(b - a, 10)),
       'sampleAintB': ', '.join(r.sample(a.intersection(b), 10))}


if __name__ == '__main__':
    main(sys.argv[1:])
