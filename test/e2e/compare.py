#! /usr/bin/env python

from PIL import Image
import math
import operator

h1 = Image.open("simple/expected.png").histogram()
h2 = Image.open("simple/computed.png").histogram()

rms = math.sqrt(reduce(operator.add, map(lambda a,b: (a-b)**2, h1, h2))/len(h1))

print rms
