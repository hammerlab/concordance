# Concordance

Visualize concordance and other quality metrics between variant callers.

Usage:

    concordance_counter.py [-h] [-o output] sample-name truth.vcf
                           vcfname=file.vcf [vcfname=file.vcf ...]

    open concordance.html

For example, to reproduce the sample data included in the repo, run:

    concordance_counter.py tumor.chr20 sampledata/trn.truth.chr20.vcf.gz \
    somatic-sniper=sampledata/trn.somaticsniper.20140508.chr20.derivedFA.vcf \
    mutect=sampledata/trn.mutect.20140505.chr20.vcf \
    strelka=sampledata/trn.strelka.20140508.chr.20.derivedFA.vcf \
    varscan=sampledata/trn.varscan.05142014.chr20.hc.derivedFA.vcf \
    > viewer/concordance-data.js

## Setting up

We use [virtualenv](https://pypi.python.org/pypi/virtualenv) for dependency management.

To get started, run:

    virtualenv env                   # make a new virtualenv named 'env'.
    source env/bin/activate          # activate the env (local pip, python).
    pip install -r requirements.txt  # install the requirements in the env.

## Examples


![](http://link.isaachodes.io/image/3v362B0g1t3B/Screen%20Shot%202014-05-22%20at%204.57.29%20PM.png)

Visualizing calls made against read depth and frequency of variant allele, for all callers.

![](http://link.isaachodes.io/image/003d052e053b/Screen%20Shot%202014-05-22%20at%204.58.00%20PM.png)

Visualizing concordance across variant callers.

![](http://link.isaachodes.io/image/383244063D1q/Screen%20Shot%202014-05-22%20at%204.59.16%20PM.png)

Visualizing scoring data across variant callers.
