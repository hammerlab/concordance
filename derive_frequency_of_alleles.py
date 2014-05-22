"""Add the FA (Frequency of Allelle) field to a VCF file, deriving it from the
   existing information in the VCF file.

   Supports SomaticSniper, VarScan, Mutect, Strelka VCFs.
"""
import os
import sys

import vcf



FA_FORMAT = vcf.parser._Format('FA', 1, 'Float', 'Frequency of ALT alleles.')


def deriver_for(caller):
    """Returns the deriver for a given variant caller. The deriver is a function
    which takes a VCF record and outputs a VCF record which has the FA attribute
    set.

    Caller must be one of 'strelka', 'somaticsniper', 'virmid', 'varscan',
    'mutect'.
    """
    callers = {'strelka': _derive_strelka_fa,
               'somaticsniper': _derive_somaticsniper_fa,
               'varscan': _derive_varscan_fa,
               'mutect': lambda x: x,
               'virmid': lambda x: x}
    try:
        return callers[caller.lower()]
    except KeyError:
        sys.stderr.write('ERROR: caller "' + caller + '" is not recognized.')
        sys.exit(1)


def _derive_varscan_fa(record):
    # Varscan outputs FA already, but in a string formatted as 'XX.XX%' under
    # the key FREQ, so we just need to pull that out and process it correctly.
    for sample in record.samples:
        add_format_field(record, 'FA')
        freq_string = sample.data.FREQ
        frequency_of_allele = float(freq_string[:-1]) / 100
        add_field(record, sample.sample, 'FA', frequency_of_allele)
    return record


def _derive_strelka_fa(record):
    alts = [str(alt) for alt in record.ALT]
    for sample in record.samples:
        add_format_field(record, 'FA')
        read_depth = sample.data.DP
        # In Strelka, allele counts are in fields AU, GU, CU, TU.
        # These fields are lists of tier1 and tier2 allele counts
        # with tier1 being the higher quality used.
        counts = {alt: sample.data.__dict__[alt+"U"][0]
                  for alt in alts if alt != 'None'}
        alts_total = sum(counts[allele] for allele in alts if allele != 'None')
        frequency_of_allele = round(float(alts_total) / read_depth, 3)
        add_field(record, sample.sample, 'FA', frequency_of_allele)
    return record


def _derive_somaticsniper_fa(record):
    # c.f. Somatic Sniper's manual for order of bcount alleles
    bcount_index = {0: 'A', 1: 'C', 2: 'G', 3: 'T'}
    alts = [str(alt) for alt in record.ALT]
    for sample in record.samples:
        add_format_field(record, 'FA')
        read_depth = sample.data.DP
        bcounts = sample.data.BCOUNT
        allele_counts = {bcount_index[idx]: count
                         for idx, count in enumerate(bcounts)}
        alts_total = sum(allele_counts[allele] for allele in alts)
        frequency_of_allele = round(float(alts_total) / read_depth, 3)
        add_field(record, sample.sample, 'FA', frequency_of_allele)
    return record


def add_field(record, sample_name, fieldname, value):
    """Return record with the field added to the data dict of the specified
    sample.
    """
    sample_idx = record._sample_indexes[sample_name]
    sample = record.samples[sample_idx]
    data = sample.data.__dict__
    data[fieldname] = value
    calldata = call_data(data)
    record.samples[sample_idx] = vcf.model._Call(record, sample_name, calldata)
    add_format_field(record, 'FA')
    return record


def add_format_field(record, fieldname):
    """Return record with fieldname added to the FORMAT field if it doesn't
    already exist.
    """
    format = record.FORMAT.split(':')
    if fieldname not in format:
        record.FORMAT = record.FORMAT + ":" + fieldname
    return record


def call_data(kvs):
    """Return a CallData with the given keys (fields) and values."""
    CallData = vcf.model.make_calldata_tuple(kvs.keys())
    return CallData._make(kvs.values())



if __name__ == '__main__':
    _, caller, infile = sys.argv
    basename = os.path.splitext(infile)[0]
    deriver = deriver_for(caller)

    with open(infile) as vcf_in:
        records = vcf.Reader(vcf_in)
        records.formats['FA'] = FA_FORMAT

        with open(basename + '.derivedFA.vcf', 'w') as output:
            writer = vcf.Writer(output, records)
            for record in records:
                writer.write_record(deriver(record))

    print("Derived FA for {}".format(sys.argv[1]))
