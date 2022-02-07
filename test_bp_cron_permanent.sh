#!/bin/bash
urlovh=http://proof.ovh.net/files/10Gb.dat
urlfree=http://test-debit.free.fr/10485760.rnd
madate=`date '+%Y%m%d%H%M'`
wget $urlfree -O /dev/null -a /home/epsimin/LogsCronPermanents/DL_$madate.log