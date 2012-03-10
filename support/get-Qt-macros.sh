#!/bin/sh

grep '^\s*#\s*define Q_' /usr/include/qt4/QtCore/qglobal.h \
  | sed 's,.*\(Q_[A-Z0-9_]\+\).*,<item> \1 </item>,' \
  | sort \
  | uniq \
  | grep -v EXPORT
