
import numpy as np

from os.path import exists

from pickle import load, dump

from mysql import connector

from logger import Logger

from cfiltering import CFiltering


class Loader(CFiltering):

    def __init__(
        self,
        precision=1e-09,
        verbose=False,
        logger=Logger("Loader"),
        filename="model.pkl",
        overwrite=False
    ):

        self.cnx = connector.connect(
            user="root",
            password="password",
            host="127.0.0.1",
            database="freebay",
            raise_on_warnings=True
        )

        self.cur = self.cnx.cursor()

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

        matrix, self.auctions = self.__fetch_views_matrix__()

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


    def __del__(self):

        self.cur.close()

        self.cnx.close()


    def __fetch_views_matrix__(self):

        self.cur.execute("""
            SELECT User_Id, Auction_Id
            FROM Views
            ORDER BY User_Id, Auction_Id
        """)

        views = self.cur.fetchall()


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


    def __fetch_query_vector__(self, user_id):

        self.cur.execute("""
            SELECT Auction_Id
            FROM Views
            WHERE User_Id = %(User_Id)s
            ORDER BY Auction_Id
        """, user_id)

        views = set(map(lambda t: t[0], self.cur.fetchall()))

        query = []

        for auction_id in self.auctions:

            query.append(1 if auction_id in views else 0)

        return query / np.linalg.norm(query)


    def top(self, user_id, limit=10):

        query = self.__fetch_query_vector__({ "User_Id": user_id })

        if self.verbose:

            self.logger.log("Query:", query)

        prediction = CFiltering.predict(self, query.copy(), self.precision)

        if self.verbose:

            self.logger.log("Prediction:", prediction)

            self.logger.log("Query != Prediction:", any(abs(x - y) > self.precision for x, y in zip(query, prediction)))

        candidates = sorted([(self.auctions[i], prediction[i]) for i in range(len(self.auctions)) if query[i] < self.precision], reverse=True, key=lambda candidate: candidate[1])

        return candidates[:limit]

