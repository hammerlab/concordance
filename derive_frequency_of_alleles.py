import sys
import vcf



def derive_fa(record):
    """Return record with derived FA each sample.

    TODO(ihodes): This works only for Somatic Sniper calls right now."""
    # c.f. Somatic Sniper manual for order of BCOUNT
    bcount_index = {0: 'A', 1: 'C', 2: 'G', 3: 'T'}
    alts = [str(alt) for alt in record.ALT]
    for sample in record.samples:
        add_format_field(record, 'FA')
        read_depth = sample.data.DP
        bcounts = sample.data.BCOUNT
        allele_counts = {bcount_index[idx]: count
                         for idx, count in enumerate(bcounts)}
        alts_total = sum(allele_counts[allele] for allele in alts)
        if read_depth > 0:
            frequency_of_allele = round(float(alts_total) / read_depth, 3)
            if frequency_of_allele in (0, 1):
                frequency_of_allele = int(frequency_of_allele)
            add_field(record, sample.sample, 'FA', frequency_of_allele)
    return record


def add_field(record, sample_name, fieldname, value):
    """Return record with the field added to the data dict of the specified
    sample."""
    sample_idx = record._sample_indexes[sample_name]
    sample = record.samples[sample_idx]
    data = sample.data.__dict__
    data[fieldname] = value
    calldata = call_data(data)
    record.samples[sample_idx] = vcf.model._Call(record, sample_name, calldata)
    add_format_field(record, 'FA')
    return record


def add_format_field(record, fieldname):
    """Return record with fieldname added to the FORMAT field if it doesn't already
    exist."""
    format = record.FORMAT.split(':')
    if fieldname not in format:
        record.FORMAT = record.FORMAT + ":" + fieldname
    return record


def call_data(kvs):
    """Return a CallData with the given keys (fields) and values."""
    CallData = vcf.model.make_calldata_tuple(kvs.keys())
    return CallData._make(kvs.values())



if __name__ == '__main__':
    vcf_in = open(sys.argv[1])
    vcf_out = open(sys.argv[1]+'.derivedFA.out.vcf', 'w')

    vcf_file = vcf.Reader(vcf_in)
    writer = vcf.Writer(vcf_out, vcf_file)
    for record in vcf_file:
        writer.write_record(derive_fa(record))

    writer.close()
    vcf_out.close()
    vcf_in.close()

    print("Derived FA for {}".format(sys.argv[1]))
