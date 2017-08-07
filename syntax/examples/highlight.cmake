#[=======================================================================[.rst:
highlight.cmake Example
-----------------------

This *pseudo* module **doesn't do any usefull**, but it shoudl demonstrate
the cmake syntax highlighting...

.. code-block:: cmake
   :caption: Example

   # CMake code example
   add_library(blah foo.cc bar.cc)
   target_link_libraries(blah Boost::boost)

.. note::

    This file designed to demonstrate as much as possible syntax features
    ;-)

#]=======================================================================]

cmake_minimum_required(VERSION 3.9)

project(
    HighlightingDemo VERSION 1.0.0
    DESCRIPTION "Kate's CMake Highlighting Demo"
    LANGUAGES C CXX
  )

option(BUILD_EXECUTABLE "Enable demo executable build" OFF)

#
# Find prerequisites
#

# Setup threads library finder
if(UNIX)
    set(CMAKE_THREAD_PREFER_PTHREAD ON)
    set(THREADS_PREFER_PTHREAD_FLAG ON)
endif()
# Find a native threads library: all C++ project need it!
find_package(Threads REQUIRED)

find_package(
    Boost 1.64 REQUIRED
    COMPONENTS thread
    OPTIONAL_COMPONENTS program_options
  )

include(GNUInstallDirs)

# Add some targets
add_library(libfoo foo.cc)
add_library(Vendor::libfoo ALIAS libfoo)
target_include_directories(
    libfoo
    PUBLIC
        # ... at build time ...
        $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/include>
        # ... to use by depended project ...
        $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>
  )
target_link_libraries(libfoo PUBLIC Boost::thread)
target_compile_definitions(libfoo PUBLIC BOOST_SYSTEM_NO_DEPRECATED)

if(BUILD_EXECUTABLE AND (Boost_program_options_FOUND AND TARGET Boost::program_options))
    add_executable(hl-demo main.cc)
    target_link_libraries(libfoo PUBLIC Vendor::libfoo Boost::program_options)
endif()

install(
    TARGETS libfoo $<$<BOOL:${BUILD_EXECUTABLE}>:hl-demo>
    COMPONENT main
    RUNTIME DESTINATION "${CMAKE_INSTALL_BINDIR}"
    ARCHIVE DESTINATION "${CMAKE_INSTALL_LIBDIR}"
    LIBRARY DESTINATION "${CMAKE_INSTALL_LIBDIR}"
    INCLUDES DESTINATION "${CMAKE_INSTALL_INCLUDEDIR}"
  )

#BEGIN Playground
function(hl_demo)
    set(_options SOME)
    set(_one_value_args USER)
    set(_multi_value_args OPTIONS)
    cmake_parse_arguments(_hl_demo "${_options}" "${_one_value_args}" "${_multi_value_args}" ${ARGN})

    if(NOT _hl_demo_SOME)
        message(FATAL_ERROR [==[
            `SOME` named parameter hasn't given
            in call to `hl_demo`!
            Review your code!
            (${VARIABLES} do not expand here)
        ]==] )
    endif()

    # ATTENTION A very important note!
    if($ENV{USER})
        message(STATUS "Using environment variable \"USER\": $ENV{USER}")
    endif()
    # NOTE Normal note...
endfunction()
#END Playground

add_custom_target(
    foo
    COMMAND ${CMAKE_COMMAND} -E echo $\(some\)
  )
add_dependencies(foo Vendor::libfoo)
