#
# Prepare a tarball
#

VERSION=$(shell cat cpp.xml | grep '^\s\+\bversion=' | sed 's,\s\+version="\(.*\)",\1,')
BUILDDIR=cpp-kate-syntax-${VERSION}

all: ${BUILDDIR}.tar.gz

${BUILDDIR}.tar.gz: cpp.xml qt4.xml gcc.xml install.sh README.md examples/
	mkdir -p ${BUILDDIR}/examples
	cp -r $^ ${BUILDDIR}
	tar -jcf ${BUILDDIR}.tar.gz ${BUILDDIR}
	rm -rf ${BUILDDIR}
