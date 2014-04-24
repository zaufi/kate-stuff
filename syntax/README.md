What is this
============

Since the upstream wants to have a _"full featured C++ highlighting"_ as a default (i.e. w/ Qt classes and extensions),
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


TODO
====

* Qt5 syntax w/ depreated (since Qt4) classes as a separate file


Changes
=======

Version 2.3
-----------

* Support for quote digits separator and user defined literals for floating point literals
* Regular expressions to detect various numeric literals has reviewed and refactored according upcoming C++14 stardard
* Highlight standard user defined literals for std::chrono, std::complex and std::string as defined by C++14


Version 2.2
-----------

* A bug with incorrect comment highlighting after #include has been fixed
* Introduce a separate attribute for Aligned Comments -- i.e. comments aligned to most used in C++ world TAB size 4
  (it was a RegionMarker before), so now it is possible to assign the same color as for Comment if you don't want this feature


Version 2.1
-----------

* Hihglight standard C++ header files
* Fix highlighting of `#include` files
* Rename uncertain _Prep. Libs_ to _Include Header_
