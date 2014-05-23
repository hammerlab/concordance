# coding: utf-8
"""Script to compare VCF files to each other and to truth data.

Outputs the resulting data as JavaScript on stdout.
"""
import argparse
import collections
import functools as ft
import json
import os
import sys

import vcf

import dream_evaluator


# In PyVCF, a [] for FILTER means the filter was PASS.
# c.f. https://github.com/jamescasbon/PyVCF/issues/153
PASS = []

DP_BINS = [(1, 5), (6, 10), (11, 20), (21, 30), (31, 100)]
FA_BINS = [(0.0, 0.2), (0.2, 0.4), (0.4, 0.6), (0.6, 0.8), (0.8, 1.0)]


### Utility ###

def base_name(path):
    return os.path.splitext(os.path.basename(path))[0]


def open_vcfs(vcfs):
    return {name: vcf.Reader(open(filename))
            for name, filename in vcfs.iteritems()}


def inclusive_between(tr, num):
    return tr[0] <= num <= tr[1]


def bin_on(val_fn, bins, items):
    """Group items into a pre-determined set of bins.

    Return a mapping of bin to items in that bin, as determined by the value
    of the val_fn applied to the item. Bins are inclusive. Bin keys are
    converted to strings.
    """
    bin_to_item = collections.defaultdict(list)
    for item in items:
        for bin in bins:
            if inclusive_between(bin, val_fn(item)):
                bin_to_item[str(bin)].append(item)
            else:
                bin_to_item[str(bin)] # Ensure all bins are in the map.
    return bin_to_item


### VCF-specific ###

def record_key(record):
    return (record.CHROM + "-" + str(record.POS) + ':' +
            record.REF + "->" + str(record.ALT))


def _get_sample_data_attr(attr, sample_name, record, default=None):
    """Return the value of the attribute for the given sample of a record.
    Applies `tr` to the value before returning it if given.
    """
    indices = record._sample_indexes
    sample_index = indices[sample_name] if sample_name in indices else None
    if sample_index:
        data = record.samples[sample_index].data
        return getattr(data, attr)
    else:
        return default


def bin_variants_by_DP_and_FA(variants, sample_name, DP_bins=DP_BINS, FA_bins=FA_BINS):
    """Sequence of VCF records ->
    {read_depth_bin1: {af_range_1: [record1, ..], ..}, ..} for a given sample.
    """
    _get_dp = ft.partial(_get_sample_data_attr, 'DP', sample_name)
    _get_fa = ft.partial(_get_sample_data_attr, 'FA', sample_name)

    depth_bins = bin_on(_get_dp, DP_BINS, variants)
    for dp_bin, records in depth_bins.iteritems():
        depth_bins[dp_bin] = bin_on(_get_fa, FA_BINS, records)
        for fa_bin, records in depth_bins[dp_bin].iteritems():
            depth_bins[dp_bin][fa_bin] = len(set(records))
    return depth_bins


def variants_to_caller_mapper(vcfname_to_records_dict):
    """Return a mapping from passing variants (identified by CHROM-POS) in the
    provided VCFs to a set of the names of the VCFs in which the variants were
    called.

    e.g. {'2-5712387': {'mutect', 'varscan'}, ...}

    vcf_dct -- mapping of VCF names to vcf.Reader instances of the VCF,
               from open_vcfs (e.g. {'vcfname': vcf.Reader, ...}).
    """
    mapping = collections.defaultdict(set)
    for vcf_name, records in vcfname_to_records_dict.iteritems():
        for record in records:
            mapping[record_key(record)].add(vcf_name)
    return mapping


def vcf_to_concordance(variants_to_vcfs_dict):
    """Returns a mapping from each VCF caller to a mapping of the number of
    VCFs in concordance to the number of calls they concord on.
    """
    concordance_counts = collections.defaultdict(lambda: collections.defaultdict(int))
    for vcfs in variants_to_vcfs_dict.itervalues():
        for vcf in vcfs:
            concordance_counts[vcf][len(vcfs)] += 1
    return concordance_counts


def main(sample_name, truth, vcfs, output):
    scores = {}
    for vcf, vcf_file in vcfs.iteritems():
        scores[vcf] = dream_evaluator.evaluate(vcf_file, truth + ".gz")

    vcfs['truth'] = truth
    vcf_readers = open_vcfs(vcfs)
    vcf_names = vcf_readers.keys()

    passing_records = {}  # Look at only calls that PASS the filters.
    for vcf, records in vcf_readers.iteritems():
        # Important to reify the generator, as we'll be reusing it.
        passing_records[vcf] = [r for r in records
                                if r.FILTER == PASS or not r.FILTER]

    variants_to_callers = variants_to_caller_mapper(passing_records)
    concordance_counts  = vcf_to_concordance(variants_to_callers)

    DP_FA_binning = {}
    for vcf, records in passing_records.iteritems():
        DP_FA_binning[vcf] = bin_variants_by_DP_and_FA(records, sample_name)

    output.write(("var dpfaBinning = " + json.dumps(DP_FA_binning, indent=4) + ";\n"
                  "var concordanceCounts = " + json.dumps(concordance_counts, indent=4) + ";\n"
                  "var scores = " + json.dumps(scores, indent=4) + ";\n"
                  "var callerNames = " + json.dumps(vcf_names) + ";\n"))


class KeyValueAction(argparse.Action):
     def __call__(self, parser, namespace, values, option_string=None):
         values = [value.split('=') for value in values]
         if not all((len(val) == 2 for val in values)):
             sys.stderr.write(("values for " + self.dest +
                               " must be in key=value format\n"))
             sys.exit(2)
         setattr(namespace, self.dest, {val[0]: val[1] for val in values})


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=("output concordance, scoring,"
                                                  " and sensitivity data of VCF"
                                                  "files"))
    parser.add_argument('-o', '--output', default=sys.stdout,
                        type=argparse.FileType('w'),
                        help="designate output file (otherwise stdout)")
    parser.add_argument('sample_name', metavar='sample-name',
                        help="common sample name in VCFs to compare")
    parser.add_argument('truth', metavar='truth.vcf',
                        help=("ground truth VCF with which to "
                              "compare other VCFs against."))
    parser.add_argument('vcfs', metavar='name1=vcf1, name2=vcf2, ...',
                        nargs='+', action=KeyValueAction,
                        help="VCF files to compare to each other")
    args = parser.parse_args()
    main(args.sample_name, args.truth, args.vcfs, args.output)
