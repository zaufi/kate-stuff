#!/bin/bash
#
# Script to generate <items> list w/ all possible predefined gcc/g++ macros
#
# TODO Clean the code
#

default_options_file=`dirname $0`/`basename $0 .sh`.gcc-options

function usage()
{
cat << __EOF
Predefined gcc macros as kate syntax file (partly) generator v.001

$0 [options]

where options are:
    -h          this help screen
    -c file     gcc options file to use (if ommited '${default_options_file}')
    -x          execute g++ instead of gcc

Use CC environment variable to override default gcc executable.
__EOF
}

# set default mode to C
ext=".c"

# Parse command line options
while getopts "hc:x" option; do
    case $option in
    h)  usage
        exit 0
        ;;
    x)  ext=".cc"
        ;;
    c)  option_files="$option_files $OPTARG"
        ;;
    *)  echo "*** Error: Unrecognized option" >&2
        exit 1
        ;;
    esac
done
shift $(($OPTIND - 1))

# Load gentoo spam functions
if [ -f /etc/init.d/functions.sh ]; then
    source /etc/init.d/functions.sh
else
    echo "*** Error: Sorry, this script for gentoo... I'm too lazy"
    exit 1
fi

# Make temp files
ebegin "Makeing temp files" >&2
    tmp=`mktemp --tmpdir \`basename $0 .sh\`.XXXXXXXXXXX`
    tmptmp=`mktemp --tmpdir \`basename $0 .sh\`.XXXXXXXXXXX`
    tgttmp=`mktemp --tmpdir \`basename $0 .sh\`.XXXXXXXXXXX`
    opttmp=`mktemp --tmpdir \`basename $0 .sh\`.XXXXXXXXXXX`
    tmp_src=`mktemp --tmpdir \`basename $0 .sh\`.XXXXXXXXXXX$ext`
eend $? >&2

# Verify options file(s)
test -z "$option_files" && option_files="$default_options_file"
ebegin "Using options file(s): $option_files" >&2
for cf in $option_files; do
    if [ -r $cf ]; then
        eend 0 >&2
    else
        eend 1 >&2
        eerror "Unable to access options file $cf" >&2
        exit 1
    fi
done

# Find desired gcc binary (w/ default to `gcc`)
if [ ext = ".cc" ]; then
    gcc_bin=${CC:-g++}
else
    gcc_bin=${CC:-gcc}
fi
gcc_bin=`which "$gcc_bin" 2>/dev/null`
if [ -x "$gcc_bin" ]; then
    einfo "Using gcc: $gcc_bin" >&2
else
    eerror "Unable to find executable gcc binary" >&2
    exit 1
fi

# Produce aux options file w/ `-m...` options gathered from gcc `--help=targets`
$gcc_bin --help=target | grep '^\s\+\-m[^=]\+\s\+' | cut -d ' ' -f3 > $tgttmp
option_files="$option_files $tgttmp"

# Produce aux options file w/ `-m...` options gathered from gcc `--help=optimizers`
$gcc_bin --help=optimizers | grep '^\s\+\-f[^=]\+\s\+' | cut -d ' ' -f3 > $opttmp
option_files="$option_files $opttmp"

# Do the job!
einfo "Starting..." >&2
eindent
    sed -e 's,\([^#]*\)#.*,\1,' -e '/^ *$/ d' $option_files | while read line; do
        ebegin "Trying $line" >&2
            rm "$tmptmp" 2>/dev/null
            $gcc_bin $line -Werror -Wfatal-errors -dM -E -o "$tmptmp" "$tmp_src"
            test -s "$tmptmp"
        eend $? >&2
        if [ -s "$tmptmp" ]; then
            sed 's,#define \([^ (]*\).*,<item> \1 </item>,' "$tmptmp" >> "$tmp"
        else
            ewarn "Empty result"
        fi
    done
eoutdent

einfo "Remove temporary files" >&2
rm "$tmptmp" "$tmp_src" 2>/dev/null

# Show result. U may use >1 redirect to catch it into some file...
sort -u "$tmp"
rm $tmp
rm $tgttmp
rm $opttmp
