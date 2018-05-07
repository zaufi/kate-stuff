#
# Prepare a tarball
#

VERSION=$(shell cat cpp.xml | grep '^\s\+\bversion=' | sed 's,\s\+version="\(.*\)",\1,')
BUILDDIR=cpp-kate-syntax-${VERSION}

all: ${BUILDDIR}.tar.gz

${BUILDDIR}.tar.gz: cpp.xml qt4.xml gcc.xml install.sh README.md examples/highlight.cc
	mkdir -p ${BUILDDIR}/examples
	cp -r $^ ${BUILDDIR}
	mv ${BUILDDIR}/highlight.cc ${BUILDDIR}/examples/
	tar -jcf ${BUILDDIR}.tar.gz ${BUILDDIR}
	rm -rf ${BUILDDIR}
