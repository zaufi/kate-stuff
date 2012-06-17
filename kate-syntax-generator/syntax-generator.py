#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#

import sys
import logging
from bnf.parser import Parser

def main():
    ''' Main entry point'''

    # Configure logger
    logging.basicConfig(
        format='%(asctime)s %(levelname)8s %(filename)s:%(lineno)-5d [%(name)s] %(message)s'
      , datefmt='%m/%d/%Y %H:%M:%S'
      , level=logging.DEBUG
      )
    logger = logging.getLogger('syntax-builder')
    #logger.setLevel(logging.DEBUG)
    # Check params
    logging.info('sys.argv=%s', repr(sys.argv))
    if len(sys.argv) < 2:
        logger.error('Not enough parameters')
        sys.exit(1)

    # Open an input BNF file
    parser = Parser(logger)
    try:
        with open(sys.argv[1], encoding='utf-8') as f:
            for line in f:
                parser.feed(line)
    except IOError as e:
        logger.exception('Unable to open file: %s', e)
    except ParseError as e:
        logger.exception('Paser error[%s]: %s', sys.argv[1], e)

    parser.checkDefinitions()

    print('*********************************')
    parser.showDefinitions()

if __name__ == '__main__':
    main()
