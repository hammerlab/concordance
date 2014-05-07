# coding: utf-8
import collections
import json
import os
import sys
import vcf



# In PyVCF, a [] for FILTER means the filter was PASS.
# c.f. https://github.com/jamescasbon/PyVCF/issues/153
PASS = []


def record_key(record):
    return record.CHROM + "-" + str(record.POS)


def variants_to_caller_mapper(vcf_dict):
    """Return a mapping from passing variants (identified by CHROM-POS) in the
    provided VCFs to a set of the names of the VCFs in which the variants were
    called.

    e.g. {'2-5712387': {'mutect', 'varscan'}, ...}

    vcf_dct -- mapping of VCF names to vcf.Reader instances of the VCF,
               from open_vcfs (e.g. {'vcfname': vcf.Reader, ...}).
    """
    mapping = collections.defaultdict(set)
    for vcf_name, records in vcf_dict.iteritems():
        for record in records:
            if record.FILTER == PASS:
                # Should we also check genotype of normal/tumor?
                mapping[record_key(record)].add(vcf_name)
    return mapping


def count_vcf_concordance(mapping):
    """Return a mapping from comma-separated strings of VCF names to the number
    of concordances found in that, and only that, set of VCFs.

    e.g. {'vcf1,vcf2': 123124, 'vcf1': 10012, 'vcf2': 201}

    mapping -- mapping of variants to the set of VCFs in which those variants
               are found, from variants_to_caller_mapper.
    """
    concordance_counts = collections.defaultdict(int)
    for vcfs in mapping.itervalues():
        concordance_counts[','.join(vcfs)] += 1
    return concordance_counts


def base_name(path):
    return os.path.splitext(os.path.basename(path))[0]


def open_vcfs(vcfs):
    return {base_name(vcf_file): vcf.Reader(open(vcf_file))
            for vcf_file in vcfs}


def main(args):
    readers = open_vcfs(args)
    mapping = variants_to_caller_mapper(readers)
    concordance_counts = count_vcf_concordance(mapping)

    print "var data = "    + json.dumps(concordance_counts) + ";"
    print "var callers = " + json.dumps(readers.keys())     + ";"



if __name__ == '__main__':
    main(sys.argv[1:])
