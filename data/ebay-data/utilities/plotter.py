
from matplotlib import pyplot as pp

from random import random

from math import floor

def lower_end_biased_random(min=30, max=1440):

    return floor(abs(random() - random()) * (1.0 + max - min) + min)


size = 10000

histogram = {}

for value in [lower_end_biased_random() for _ in range(size)]:

    if value not in histogram:

        histogram[value] = 0

    histogram[value] += 1

pp.bar(list(histogram.keys()), list(histogram.values()))

pp.show()

