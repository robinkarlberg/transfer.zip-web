#!/bin/sh
USE_INCLUDES=$1

cd /tmp/includes

last_tmpfile=$(mktemp)
cp /var/www/static/index.html $last_tmpfile

for INC_FILE in *
do
tmpfile=$(mktemp)

catfile=$INC_FILE
if [ "$USE_INCLUDES" = false ] ; then
    catfile="/dev/null"
fi

cat $catfile | sed -e "/{{ $INC_FILE }}/{r /dev/stdin" -e 'd;}' $last_tmpfile > $tmpfile
last_tmpfile=$tmpfile
done

cp $last_tmpfile /var/www/static/index.html
chmod 664 /var/www/static/index.html