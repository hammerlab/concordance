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


def sample(r, items, count):
    if len(items) < count:
        return items
    else:
        return r.sample(items, count)


def main(args):
    assert len(args) == 2
    vcfs = [vcf.Reader(open(path)) for path in args]

    a_map, b_map = [{call_key(call): call.ALT for call in reader if is_ok(call)}
                    for reader in vcfs]

    a = set(a_map.keys())
    b = set(b_map.keys())

    disagreement_loci = [k for k in a.intersection(b) if a_map[k] != b_map[k]]

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
Disagreements: %(countDisagreements)d

Pairwise samples:
A`B: %(sampleAminusB)s
B`A: %(sampleBminusA)s
A^B: %(sampleAintB)s
Disagreements: %(sampleDisagreements)s
''' % {'sourceA': args[0],
       'sourceB': args[1],
       'countA': len(a),
       'countB': len(b),
       'countAminusB': len(a - b),
       'countBminusA': len(b - a),
       'countAintB': len(a.intersection(b)),
       'countAunionB': len(a.union(b)),
       'sampleAminusB': ', '.join(sample(r, a - b, 10)),
       'sampleBminusA': ', '.join(sample(r, b - a, 10)),
       'sampleAintB': ', '.join(sample(r, a.intersection(b), 10)),
       'countDisagreements': len(disagreement_loci),
       'sampleDisagreements': ', '.join(sample(r, disagreement_loci, 10))}


if __name__ == '__main__':
    main(sys.argv[1:])
