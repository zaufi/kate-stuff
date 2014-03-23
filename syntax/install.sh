#!/bin/sh
#
# Install syntax files
#
# Copyright 2014, Alex Turbov <i.zaufi@gmail.com>
#

_help_string=`cat <<__EOF__
Usage: $0 OPTION
where an OPTION is one of
    -s,--system     system-wide install
    -u,--user       install to user's HOME
__EOF__
`

# Execute getopt
ARGS=`getopt -o "hsu" -l "help,system,user" -n "install.sh" -- "$@"`

# Check args
if [ $? -ne 0 ]; then
    echo "*** Error: Invalid agrument"
    exit 1
fi

eval set -- "$ARGS"

# Now go through all the options
while true; do
    case "$1" in
        -h|--help)
            echo "$_help_string"
            shift
            exit 0
            ;;
        -s|--system)
            _install_to=`kde4-config --prefix`
            shift
            ;;
        -u|--user)
            _install_to=`kde4-config --localprefix`
            shift
            ;;
        --)
            shift
            break
            ;;
    esac
done

if [ -z "${_install_to}" ]; then
    echo "*** Error: Can't detect a destination path"
    exit 1
fi

_dst_dir="${_install_to}/share/apps/katepart/syntax"

echo install -m 0644 -D cpp.xml "${DESTDIR}${_dst_dir}/cpp.xml"
install -m 0644 -D cpp.xml "${DESTDIR}${_dst_dir}/cpp.xml"

echo install -m 0644 -D qt4.xml ${DESTDIR}/${_dst_dir}/qt4.xml
install -m 0644 -D qt4.xml ${DESTDIR}/${_dst_dir}/qt4.xml

# Remove the upstream isocpp.xml, which is a precursor of mine cpp.xml
# [ -e "${DESTDIR}${_dst_dir}/isocpp.xml" ] \
#   && { echo rm "${DESTDIR}${_dst_dir}/isocpp.xml" && rm "${DESTDIR}${_dst_dir}/isocpp.xml"; }

echo "WARNING: Consider to remove isocpp.xml, which is a precursor of just installed cpp.xml"
echo "to avoid (almost) duplicate highlighter..."
