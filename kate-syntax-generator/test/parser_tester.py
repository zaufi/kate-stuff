#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Copyright (c) 2012 by Alex Turbov (i.zaufi@gmail.com)
#

import logging
import sys
import unittest

sys.path.append('..')
from bnf.parser import Parser, ParseError

# Configure logger
logging.basicConfig(
    format='%(asctime)s %(levelname)8s %(filename)s:%(lineno)-5d [%(name)s] %(message)s'
    , datefmt='%m/%d/%Y %H:%M:%S'
    , level=logging.DEBUG
    )
logger = logging.getLogger('unit-test')

class ParserTests(unittest.TestCase):
    def setUp(self):
        self.parser = Parser(logger)

    def test_parseEmptyToken1(self):
        with self.assertRaises(ParseError):
            self.parser.parseToken('')

    def test_parseEmptyToken2(self):
        with self.assertRaises(ParseError):
            self.parser.parseToken('+')

    def test_parseEmptyToken3(self):
        with self.assertRaises(ParseError):
            self.parser.parseToken('*')

    def test_parseEmptyToken4(self):
        with self.assertRaises(ParseError):
            self.parser.parseToken('?')

    def test_parseEmptyToken5(self):
        with self.assertRaises(ParseError):
            self.parser.parseToken('\'\'?')

    def test_parseToken1(self):
        node = self.parser.parseToken('token')
        self.assertEqual(node.name, 'token')

suite = unittest.TestLoader().loadTestsFromTestCase(ParserTests)
unittest.TextTestRunner(verbosity=2).run(suite)

#if __name__ == '__main__':
    #unittest.main()
