
from mysql import connector


class Cache:

    config = {
        "user": "root",
        "password": "password",
        "host": "127.0.0.1",
        "database": "freebay",
        "raise_on_warnings": True
    }

    queries = {
        "User": (
            "INSERT INTO User "
                "(Id, Username, Password, Email) "
            "VALUES "
                "(%(Id)s, %(Username)s, %(Password)s, %(Email)s)"
        ),
        "General_User": (
            "INSERT INTO General_User "
                "(User_Id, Seller_Rating, Bidder_Rating, Name, Surname, Phone, Address_Id, Validated) "
            "VALUES "
                "(%(User_Id)s, %(Seller_Rating)s, %(Bidder_Rating)s, %(Name)s, %(Surname)s, %(Phone)s, %(Address_Id)s, %(Validated)s)"
        ),
        "Address": (
            "INSERT INTO Address "
                "(Id, Street, Number, ZipCode, Country, City) "
            "VALUES "
                "(%(Id)s, %(Street)s, %(Number)s, %(ZipCode)s, %(Country)s, %(City)s)"
        ),
        "Category": (
            "INSERT INTO Category "
                "(Id, Name, Caption) "
            "VALUES "
                "(%(Id)s, %(Name)s, %(Caption)s)"
        ),
        "Auction_has_Category": (
            "INSERT INTO Auction_has_Category "
                "(Auction_Id, Category_Id) "
            "VALUES "
                "(%(Auction_Id)s, %(Category_Id)s)"
        ),
        "Auction": (
            "INSERT INTO Auction "
                "(Id, Seller_id, Name, Currently, First_Bid, Buy_Price, Location, Latitude, Longitude, Started, Ends, Description) "
            "VALUES "
                "(%(Id)s, %(Seller_id)s, %(Name)s, %(Currently)s, %(First_Bid)s, %(Buy_Price)s, %(Location)s, %(Latitude)s, %(Longitude)s, %(Started)s, %(Ends)s, %(Description)s)"
        ),
        "Bid": (
            "INSERT INTO Bid "
                "(Id, User_id, Auction_Id, Amount, Time) "
            "VALUES "
                "(%(Id)s, %(User_id)s, %(Auction_Id)s, %(Amount)s, %(Time)s)"
        ),
        "Image": (
            "INSERT INTO Image "
                "(Id, Path, Auction_Id) "
            "VALUES "
                "(%(Id)s, %(Path)s, %(Auction_Id)s)"
        ),
        "Views": (
            "INSERT INTO Views "
                "(User_Id, Auction_Id, Time) "
            "VALUES "
                "(%(User_Id)s, %(Auction_Id)s, %(Time)s) "
            "ON DUPLICATE KEY UPDATE "
                "Time = IF(VALUES(Time) > Time, VALUES(Time), Time)"
        )
    }

    def __init__(
        self,
        verbose=True,
        size=4096,
        tables_to_drop=[
            "Auction_has_Category",
            "Bid",
            "Image",
            "Views",
            "Auction",
            "General_User",
            "Admin",
            "User",
            "Address",
            "Category"
        ],
        views_to_drop=[]
    ):

        self.verbose = verbose

        self.size = size

        self.cnx = connector.connect(**Cache.config)

        self.cur = self.cnx.cursor()

        if isinstance(views_to_drop, list) and views_to_drop:

            for view in views_to_drop:

                print("[Cache] Dropping view '%s'" % view)

                self.cur.execute("DROP VIEW IF EXISTS {}".format(view))

        if isinstance(tables_to_drop, list) and tables_to_drop:

            for table in tables_to_drop:

                print("[Cache] Deleting all rows from table '%s'" % table)

                self.cur.execute("DELETE FROM {}".format(table))

        self.cur.execute("SET FOREIGN_KEY_CHECKS=0;")


        self.cache = {}

        for table in Cache.queries.keys():

            self.cache[table] = []


    def __del__(self):

        for table, entries in self.cache.items():

            if entries:

                self.__flush__(table)


        self.cur.execute("SET FOREIGN_KEY_CHECKS=1;")

        self.cur.close()

        self.cnx.close()


    def __flush__(self, table):

        if self.verbose:

            print("[Cache] Flushing %d entries to table '%s'" % (len(self.cache[table]), table))

        try:

            self.cur.executemany(self.queries[table], self.cache[table])

            self.cnx.commit()

            self.cache[table].clear()

        except connector.errors.DatabaseError as error:

            code, message = str(error).split(": ")

            raise connector.errors.DatabaseError("[Cache] [ERROR {}] {}".format(code, message))


    def register(self, table, entry):

        if table is None or not isinstance(table, str):

            raise TypeError("'" + str(table) + "' is not a string")

        if table not in self.queries:

            raise ValueError("'" + str(table) + "' is not a valid table name")

        if entry is None or not isinstance(entry, dict):

            raise TypeError("'" + str(entry) + "' is not a dictionary")


        if len(self.cache[table]) < self.size:

            self.cache[table].append(entry)

        else:

            self.__flush__(table)

