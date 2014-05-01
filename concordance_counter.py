# coding: utf-8
import json
import os
import sys
import vcf

from collections import defaultdict



def record_key(record):
    return record.CHROM + "-" + str(record.POS)


def variants_to_caller_mapper(vcf_dict):
    mapping = defaultdict(set)
    for vcf_name, records in vcf_dict.iteritems():
        for record in records:
            mapping[record_key(record)].add(vcf_name)
    return mapping


def count_vcf_concordance(mapping):
    concordance_counts = defaultdict(int)
    for vcfs in mapping.itervalues():
        concordance_counts[','.join(vcfs)] += 1
    return concordance_counts


def main(args):
    readers = {os.path.splitext(os.path.basename(vcf_file))[0]: vcf.Reader(open(vcf_file)) for vcf_file in args}
    mapping = variants_to_caller_mapper(readers)
    concordance_counts = count_vcf_concordance(mapping)

    print "var data = "
    print json.dumps(concordance_counts)

    print "var callers = "
    print json.dumps(readers.keys())


if __name__ == '__main__':
    main(sys.argv[1:])
