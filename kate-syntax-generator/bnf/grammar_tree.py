#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Copyright (c) 2012 by Alex Turbov (i.zaufi@gmail.com)
#

CNT_ZERO_OR_ONE = 0
CNT_ZERO_OR_MORE = -1
CNT_ONE = 1
CNT_ONE_OR_MORE = 2

class Node:
    def __init__(self, name = None):
        self.name = name
        self.subterms = list()                              # List of subterms
        self.alternatives = list()                          # list of alternatives
        self.count = CNT_ONE

    def setCount(self, count):
        self.count = count

    def appendSubterm(self, t):
        self.subterms.append(t)

    def appendAlternative(self, t):
        self.alternatives.append(t)


class NonTerminalNode(Node):
    def __init__(self, name = None):
        #super(NonTerminalNode, self).__init__(name)
        Node.__init__(self, name)
        self.parentTerm = None

    def __str__(self):
        if self.name:
            return 'NT(\'%s\') w/ subs: %s, alts: %s' % (self.name, str(self.subterms), str(self.alternatives))
        return 'NT()'


class TerminalNode(Node):
    def __init__(self, name = None):
        Node.__init__(self, name)

    def __str__(self):
        if self.name:
            return 'T(\'%s\')' % self.name
        return 'T()'
