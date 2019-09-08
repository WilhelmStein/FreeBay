
import numpy as np

from os.path import exists

from pickle import load, dump

from mysql import connector

from logger import Logger

from cfiltering import CFiltering


class Loader(CFiltering):

    def __load_view_matrix__():

        cnx = connector.connect(
            user="root",
            password="password",
            host="127.0.0.1",
            database="freebay",
            raise_on_warnings=True
        )

        cur = cnx.cursor()

        cur.execute("""
            SELECT User_Id, Auction_Id
            FROM Views
            ORDER BY User_Id, Auction_Id
        """)

        views = cur.fetchall()

        cur.close()

        cnx.close()


        rated = {}

        auctions = set()

        for view in views:

            user_id, auction_id = view

            auctions.add(auction_id)

            if user_id not in rated:

                rated[user_id] = set()

            rated[user_id].add(auction_id)


        matrix = []

        auctions = sorted(auctions)

        for user_id in rated.keys():

            vector = []

            for auction_id in auctions:

                vector.append(1 if auction_id in rated[user_id] else 0)

            matrix.append(np.array(vector))

        for i in range(len(matrix)):

            matrix[i] = matrix[i] / np.linalg.norm(matrix[i])

        return matrix, auctions


    def __init__(
        self,
        precision=1e-09,
        verbose=False,
        logger=Logger("Loader"),
        filename="model.pkl",
        overwrite=False
    ):

        self.precision = precision

        self.verbose, self.logger = verbose, logger

        if isinstance(filename, str) and exists(filename):

            if overwrite:

                if self.verbose:

                    self.logger.log("Skipped loading pickled file '%s'" % filename)

            else:

                if self.verbose:

                    self.logger.log("Loading '%s'" % filename)

                with open(filename, 'rb') as file:

                    self.underlying, self.auctions = load(file)

                return

        matrix, self.auctions = Loader.__load_view_matrix__()

        CFiltering.__init__(self, matrix)

        if isinstance(filename, str):

            if exists(filename):

                if overwrite:

                    if self.verbose:

                        self.logger.log("Overwriting model '%s'" % filename)

                else:

                    if self.verbose:

                        self.logger.log("Skipped overwriting model '%s'" % filename)

                    return
            else:

                if self.verbose:

                    self.logger.log("Saving to '%s'" % filename)

            with open(filename, 'wb') as file:

                dump((self.underlying, self.auctions), file)


    def top(self, query, limit=10):

        try:

            if self.verbose:

                self.logger.log("Query:", query)

            prediction = CFiltering.predict(self, query.copy(), self.precision)

            if self.verbose:

                self.logger.log("Prediction:", prediction)

                self.logger.log("Query != Prediction:", any(abs(x - y) > self.precision for x, y in zip(query, prediction)))

            candidates = sorted([(self.auctions[i], prediction[i]) for i in range(len(self.auctions)) if query[i] < self.precision], reverse=True, key=lambda candidate: candidate[1])

            return candidates[:limit]

        except ValueError as error:

            if self.verbose:

                self.logger.log(str(error))


    def dimension(self):

        return len(self.auctions)

