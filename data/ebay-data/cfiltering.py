
from nearpy import Engine
from nearpy.hashes import RandomBinaryProjections
from nearpy.filters import NearestFilter, UniqueFilter

from pearson import Pearson


class CFiltering:

    def __init__(
        self,
        matrix,
        max_neighbours=20,
        lshashes=[RandomBinaryProjections("rbp", 10)],
        vector_filters=[UniqueFilter()],
        distance=Pearson()
    ):

        if not isinstance(lshashes, list):

            raise TypeError("'lshashes' must be an instance of 'list'")

        if not isinstance(vector_filters, list):

            raise TypeError("'vector_filters' must be an instance of 'list'")

        self.underlying = Engine(
            len(matrix[0]),
            lshashes=lshashes,
            vector_filters=vector_filters + [NearestFilter(max_neighbours)],
            distance=distance
        )

        for vector in matrix:

            self.underlying.store_vector(vector)


    def predict(self, vector, precision):

        neighbours = self.underlying.neighbours(vector)

        if not neighbours:

            raise ValueError("Failed to acquire any neighbours")

        average = [ sum(neighbour) / len(neighbour) for neighbour, _, _ in neighbours ]

        avg = sum(vector) / len(vector)

        for i in range(len(vector)):

            if vector[i] < precision:

                weighted_sum = 0

                for j, neighbour in enumerate(neighbours):

                    neighbour, _, similarity = neighbour

                    weighted_sum += similarity * (neighbour[j] - average[j])

                vector[i] = avg + weighted_sum / len(vector)

        return vector

