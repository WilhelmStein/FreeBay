
from math import sqrt

from nearpy.distances.distance import Distance


class Pearson(Distance):

    def distance(self, vector_a, vector_b):

        avg_a, avg_b = sum(vector_a) / len(vector_a), sum(vector_b) / len(vector_b)

        k, l, m = 0, 0, 0

        for a, b in zip(vector_a, vector_b):

            na, nb = a - avg_a, b - avg_b

            k += na * nb

            l += na * na

            m += nb * nb

        return (k / sqrt(l * m))

