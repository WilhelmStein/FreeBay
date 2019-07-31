
import mysql.connector as sql


class Database:

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
            "(id, Username, Password, Email) "
            "(%(id)s, %(Username)s, %(Password)s, %(Email)s)"
        ),
        "General_User": (
            "INSERT INTO General_User "
            "(User_Id, Seller_Rating, Bidder_Rating, Name, Surname, Phone, Address_Id, Validated) "
            "(%(User_Id)s, %(Seller_Rating)s, %(Bidder_Rating)s, %(Name)s, %(Surname)s, %(Phone)s, %(Address_Id)s, %(Validated)s)"
        ),
        "Address": (
            "INSERT INTO General_User "
            "(User_Id, Seller_Rating, Bidder_Rating, Name, Surname, Phone, Address_Id, Validated) "
            "(%(User_Id)s, %(Seller_Rating)s, %(Bidder_Rating)s, %(Name)s, %(Surname)s, %(Phone)s, %(Address_Id)s, %(Validated)s)"
        ),
        "Views": (
            "INSERT INTO Views "
            "(User_Id, Auction_Id, Time) "
            "(%(User_Id)s, %(Auction_Id)s, %(Time)s)"
        ),
        "Category": (
            "INSERT INTO Category "
            "(Id, Name) "
            "VALUES (%(Id)s, %(Name)s)"
        ),
        "Auction": (
            "INSERT INTO Auction "
            "(id, Seller_id, Name, Currently, First_Bid, Buy_Price, Location, Latitude, Longitude, Started, Ends, Description) "
            "VALUES (%(id)s, %(Seller_id)s, %(Name)s, %(Currently)s, %(First_Bid)s, %(Buy_Price)s, %(Location)s, %(Latitude)s, %(Longitude)s, %(Started)s, %(Ends)s, %(Description)s)"
        ),
        "Auction_has_Category": (
            "INSERT INTO Auction_has_Category "
            "(Auction_Id, Category_Id) "
            "VALUES (%(Auction_Id)s, %(Category_Id)s)"
        ),
        "Bid": (
            "INSERT INTO Bid"
            "(Id, User_id, Auction_Id, Amount, Time)"
            "(%(Id)s, %(User_id)s, %(Auction_Id)s, %(Amount)s, %(Time)s)"
        )
    }

    def __init__(self):

        self.cnx = sql.connect(**config)

        self.cur = cnx.cursor()


    def __del__(self):

        self.cur.close()

        self.cnx.close()


    def insert(self, entry, table):

        if table is None or not isinstance(table, str):

            raise TypeError("'table' is not a string")

        if table not in queries:

            raise ValueError("'" + table + "' is not a valid table name")

        if entry is None or not isinstance(entry, dict):

            raise TypeError("'entry' is not a dictionary")

        self.cur.execute(queries[table], entry)

        self.cnx.commit()

