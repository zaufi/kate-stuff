#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Copyright (c) 2012 by Alex Turbov (i.zaufi@gmail.com)
#

import logging
from bnf.grammar_tree import *

SPECIAL_TERMINALS = {
    'SPACE'
  , 'STRING'
  , 'IDENTIFIER'
  , 'VARIABLE'
  , 'EXPANSION'
  }


class ParseError(Exception):
    pass


class Parser:
    definitions = dict()
    root = None
    previousName = None
    lineno = 0
    startOfLine = True

    def __init__(self, parentLogger):
        ''' Initialize parser '''
        self.logger = logging.getLogger(parentLogger.name + '.parser')


    def getOrAddNonTerminalDefinition(self, name):
        if name in self.definitions:
            t = self.definitions[name]
            self.logger.debug('Found definition `%s`: %s', name, repr(t))
        else:
            t = NonTerminalNode(name)
            self.logger.debug('Add definition `%s`: %s', name, repr(t))
            self.definitions[name] = t
        return t


    def parseToken(self, token):
        ''' Parse one token withing some alternative '''
        assert(token)

        if token[-1] == '+':
            count = CNT_ONE_OR_MORE
        elif token[-1] == '?':
            count = CNT_ZERO_OR_ONE
        elif token[-1] == '*':
            count = CNT_ZERO_OR_MORE
        else:
            count = CNT_ONE
        if count != CNT_ONE:
            token = token[:-1]                              # Strip multiplier if any

        if not token:
            raise ParseError('Empty token found at line %d' % self.lineno)

        # Try to get term attribute
        if token[0] == '{':
            # Yeah, seems some attribute present
            if '}' in token:
                closeIdx = token.index('}')
                attribute = token[0:closeIdx].strip()
                token = token[closeIdx + 1:].strip()
                if not token:
                    raise ParseError('Attribute {%s} does not belongs to any term' % attribute)
        # Is current token is a terminal symbol? (i.e. a word in single quotes)
        if token[0] == "'" and token[-1] == "'":
            # Yea!
            token = token[1:-1].strip()                     # Get it! (drop quotes)
            if token:
                term = TerminalNode(token)
            else:
                raise ParseError('Empty terminal sequence found at line %d' % self.lineno)
        elif token in SPECIAL_TERMINALS:
            term = TerminalNode(token)
        else:
            term = NonTerminalNode(token)

        # Attach attribute and count
        term.setCount(count)
        if attribute:
            term.setAttribute(attribute)
        return term


    def parseAlternative(self, alt):
        ''' Parse sequence of tokens between '|' '''

        assert(alt)

        altTerm = NonTerminalNode()
        # Split alternatives by spaces
        tokens = [s.strip() for s in alt.split()]
        self.logger.debug('tokens=%s', repr(tokens))
        # For every token in the current alternative
        for t in tokens:
            # Try to get a multiplier
            term = self.parseToken(t)
            self.logger.debug('Append subterm `%s` to unnamed node', str(term))
            altTerm.appendSubterm(term)
        if len(altTerm.subterms) == 1:
            self.logger.debug('Optimize')
            return altTerm.subterms[0]
        return altTerm


    def parseAlternatives(self, alts, parent):
        # Parse each alternative
        for a in alts:
            self.logger.debug('parse current alt=%s', a)
            if not a:                                   # Current alternative is empty?
                raise ParseError('Empty alternative on line %d' % self.lineno)
            altTerm = self.parseAlternative(a)
            self.logger.debug('altTerm=%s', str(altTerm))
            parent.appendAlternative(altTerm)


    def stripComment(self, line):
        if '#' in line:                                     # If comment char on a line
            line = line[0:line.index('#')]                  # Strip everything behind it
        return line.strip()                                 # Remove possible spaces


    def feed(self, line):
        ''' Feed the parser w/ a new line of BNF grammar '''

        self.lineno += 1                                    # Increment lines count
        line = self.stripComment(line)                      # Get rid of possible comments
        if not line:
            return                                          # Nothing to do if there is only comment on a line

        self.logger.debug('%d: %s', self.lineno, repr(line))

        if ':=' in line:                                    # Check if we have a new statement here
            if not self.startOfLine:
                raise ParseError(
                    'Definition started at line %d expected to continue, but new definition found'
                  , self.lineno
                  )
            assert(self.startOfLine)

            # Split definition before and after ':='
            left, right = (s.strip() for s in line.split(':='))
            self.logger.debug('left=%s', repr(left))
            self.logger.debug('right=%s', repr(right))
            # TODO Check left side for inner spaces and prohibited chars

            defineTerm = self.getOrAddNonTerminalDefinition(left)
            self.logger.info('Define term=%s %s', str(defineTerm), repr(defineTerm))
            self.previousName = left                        # Remember a name of the currently defining term
            if not self.root:
                self.root = defineTerm
                self.logger.debug('Assigned %s as root node!', str(defineTerm))

            # Analyze right side: get list of alternatives
            alt = [s.strip() for s in right.split('|')]
            self.logger.debug('alt=%s', repr(alt))
            if not alt[-1]:                                 # Should we expect continue of the current definition?
                self.startOfLine = False                    # Yes, we should!
                del alt[-1]                                 # Remove empty range to avoid troubles
            else:
                self.startOfLine = True                     # It seems we shouldn't...

            # Parse each alternative and append to the currently defining node
            self.parseAlternatives(alt, defineTerm)
        else:                                               # Continue to parse prev definition
            assert(self.previousName)
            assert(self.previousName in self.nodes)

            alt = [s.strip() for s in line.split('|')]
            assert(alt)                                     # list expected to ahve at least 1 item!
            self.logger.debug("... contunue: alt=%s", repr(alt))

            # First alternative can be empty, that means continue of the previous definition
            if alt[0]:                                      # First alternative isn't empty
                if self.startOfLine:                        # Is continue expected?
                    raise ParseError('It seems \'|\' missed', self.lineno)
            else:
                del alt[0]                                  # Just remove leading empty range
                if not alt:                                 # Nothing remains?
                    raise ParseError('It seems something missed here on a line %d %%)', self.lineno)
            # Despite of `startOfLine' flag we'll continue previous definition

            # Check the last range as well...
            self.logger.debug(" alt2=%s", repr(alt))
            if not alt[-1]:                                 # Should we expect continue of the current definition?
                self.startOfLine = False                    # Yes, we should!
                del alt[-1]                                 # Remove empty range to avoid troubles
            else:
                self.startOfLine = True                     # It seems we shouldn't...

            # Get term to process
            defineTerm = self.getOrAddNonTerminalDefinition(self.previousName)
            self.logger.debug("... contunue: to define term %s %s", str(defineTerm), repr(defineTerm))
            # Parse each alternative and append to the currently defining node
            self.parseAlternatives(alt, defineTerm)
        #
        self.logger.debug('---[EOL]--------------------')
        self.definitions[defineTerm.name] = defineTerm
        self.logger.debug('Defined term: %s', repr(defineTerm))
        self.logger.debug('Defined term from dict: %s', repr(self.definitions[defineTerm.name]))
        self.logger.debug('%s', defineTerm.subterms)
        self.logger.debug('%s', defineTerm.alternatives)
        self.logger.debug('* Definitions: %s', str(self.definitions))
        self.logger.debug('---[/EOL]-------------------')

    def _checkDefinitionsRecursively(self, node):
        assert(isinstance(node, NonTerminalNode))
        self.logger.debug('Checking for %s: %s', node.name, repr(node))
        if not node:
            raise ParseError('BNF do not contain valid grammar')

        if not node.subterms and not node.alternatives:
            raise ParseError('Non terminal `%s` is not defined' % node.name)

        if node.subterms and node.alternatives:
            raise ParseError('BNF do not contain valid grammar (l2 violation)')

        if node.subterms:
            result = True
            for t in node.subterms:
                if isinstance(t, NonTerminalNode):
                    if t.name == None:
                        # Unnamed node w/ alternatives
                        self._checkDefinitionsRecursively(t)
                    elif t.name in self.definitions:
                        # Named node should be defined, so lookup it in definitions
                        self._checkDefinitionsRecursively(self.definitions[t.name])
                    else:
                        raise ParseError('Definition for `%s` not found' % t.name)

        if node.alternatives:
            result = True
            for t in node.alternatives:
                if isinstance(t, NonTerminalNode):
                    if t.name == None:
                        # Unnamed node w/ alternatives
                        self._checkDefinitionsRecursively(t)
                    elif t.name in self.definitions:
                        # Named node should be defined, so lookup it in definitions
                        self._checkDefinitionsRecursively(self.definitions[t.name])
                    else:
                        raise ParseError('Definition for `%s` not found' % t.name)


    def checkDefinitions(self):
        ''' Lemma #1: Being resolved, a very first definition should leads to the
                      tree where all leafs are terminals

            Lemma #2: Definition node may consists only w/ subterms or alternatives,
                      but noth both.
        '''
        self._checkDefinitionsRecursively(self.root)


    def getCountSign(self, term):
        if term.count == CNT_ONE:
            return ''
        if term.count == CNT_ONE_OR_MORE:
            return '+'
        if term.count == CNT_ZERO_OR_MORE:
            return '*'
        if term.count == CNT_ZERO_OR_ONE:
            return '?'

    def _showDefinitionsRecursively(self, node):
        if node.name:
            print(node.name + ' := ', end='')

        for t in node.subterms:
            if isinstance(t, NonTerminalNode):
                if t.name == None:
                    self._showDefinitionsRecursively(t)
                else:
                    print(t.name + str(t.count), end=' ')
            else:
                assert(isinstance(t, TerminalNode))
                print('\'' + t.name + '\'' + self.getCountSign(t), end=' ')

        firstIteration = True
        for t in node.alternatives:
            if firstIteration:
                firstIteration = False
            else:
                print(' |', end=' ')
            if isinstance(t, NonTerminalNode):
                if t.name == None:
                    self._showDefinitionsRecursively(t)
                else:
                    print(t.name + self.getCountSign(t), end='')
            else:
                assert(isinstance(t, TerminalNode))
                print('\'' + t.name + '\'' + self.getCountSign(t), end=' ')


    def showDefinitions(self):
        for t in self.definitions.values():
            self._showDefinitionsRecursively(t)
            print('\n')
