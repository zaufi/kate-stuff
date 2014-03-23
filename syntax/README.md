What is this
============

Since the upstream wants to have a _"full featured C++ highlighting"_ as default (i.e. w/ Qt classes and extensions),
I've decided to continue to maintain my _pure_ C++ highliter (i.e. w/o Qt) and _C++/Qt4_ as a separate syntax.
Because (I think) most of <del>my</del> C++ projects are _pure_ C++ and not a Qt based one, which is just a subset
of all C++ projects. And I do not need annoying highlighting of some "common" words, like `connect`, which is
an ordinal POSIX sockets call, or `disconnect`, which is, for example, a part of `boost::signals` library.


How to install
==============

Run the `install.sh` provided. Install to the user's `$HOME`:

    $ ./install.sh -u

or to the system:

    $ ./install.sh -s


Changes
=======

Version 2.1
-----------

* Hihglight standard C++ header files
* Fix highlighting of `#include` files
* Rename uncertain _Prep. Libs_ to _Include Header_
