#!/bin/sh

egrep '^\s*#\s*define (Q|QT|QT3)_' /usr/include/qt4/QtCore/qglobal.h \
  | sed 's,^\s*#\s*define\s\+\(Q[A-Z0-9_]\+\).*,<item> \1 </item>,' \
  | sort \
  | uniq \
  | grep -v EXPORT
