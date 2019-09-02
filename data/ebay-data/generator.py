
from mysql import connector

from faker import Faker

from datetime import datetime

import random

import json

import os


class Generator:

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
        downloader=None,
        seed=123456789,
        verbose=True,
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
        views_to_drop=[],
        rating_lower=0.0, rating_upper=58823.0, rating_digits=1,
        dollar_digits=2,
        validated_percentage=0.7):

        self.verbose = verbose

        self.rating_lower, self.rating_upper, self.rating_digits = rating_lower, rating_upper, rating_digits

        self.dollar_digits = dollar_digits

        self.validated_percentage = validated_percentage


        self.downloader = downloader


        self.cnx = connector.connect(**Generator.config)

        self.cur = self.cnx.cursor()

        if isinstance(views_to_drop, list) and views_to_drop:

            for view in views_to_drop:

                print("[Generator] Dropping view '%s'" % view)

                self.cur.execute("DROP VIEW IF EXISTS {}".format(view))

        if isinstance(tables_to_drop, list) and tables_to_drop:

            for table in tables_to_drop:

                print("[Generator] Deleting all rows from table '%s'" % table)

                self.cur.execute("DELETE FROM {}".format(table))


        self.random = random.Random(seed)

        self.generator = Faker()

        self.generator.seed(seed)


        self.auction_id = 0

        self.users = {}

        self.categories = {}

        self.address_id = 0

        self.bid_id = 0

        self.image_id = 0


    def __del__(self):

        self.cur.close()

        self.cnx.close()


    def __normalize_rating__(self, decimal, dst_lower=0.0, dst_upper=100.0):

        return round((decimal - self.rating_lower) * ((dst_upper - dst_lower) / (self.rating_upper - self.rating_lower)) + dst_lower, self.rating_digits)


    def __random_rating__(self, lower=0.0, upper=100.0):

        return round(self.random.uniform(lower, upper), self.rating_digits)


    def __normalize_dollars__(self, dollars):

        return round(dollars, self.dollar_digits)


    def __generate_user__(self, username=None, password=None, email=None):

        self.users[username] = len(self.users) + 1

        return {
            "Id" : self.users[username],
            "Username" : username if username else self.generator.user_name(),
            "Password" : password if password else self.generator.password(),
            "Email" : email if email else self.generator.email()
        }


    def __generate_general_user__(self, user_id, seller_rating=None, bidder_rating=None, name=None, surname=None, phone=None):

        return {
            "User_Id": user_id,
            "Seller_Rating": self.__normalize_rating__(seller_rating) if seller_rating else self.__random_rating__(),
            "Bidder_Rating": self.__normalize_rating__(bidder_rating) if bidder_rating else self.__random_rating__(),
            "Name": name if name else self.generator.first_name(),
            "Surname": surname if surname else self.generator.last_name(),
            "Phone": phone if phone else self.generator.phone_number(),
            "Address_Id": self.address_id,
            "Validated": self.random.random() <= self.validated_percentage
        }


    def __generate_admin__(self, user_id):

        return {
            "User_Id": user_id
        }


    def __generate_address__(self, street=None, number=None, zip_code=None, country=None, city=None):

        self.address_id += 1

        return {
            "Id": self.address_id,
            "Street": street if street else self.generator.street_name(),
            "Number": number if number else self.random.randint(1, 100),
            "ZipCode": zip_code if zip_code else self.generator.zipcode(),
            "Country": country if country else self.generator.country(),
            "City": city if city else self.generator.city()
        }


    def __generate_category__(self, name):

        self.categories[name] = len(self.categories) + 1

        return {
            "Id": len(self.categories),
            "Name": name,
            "Caption": self.generator.text(50)
        }


    def __generate_auction_has_category__(self, auction_id, category_id):

        return {
            "Auction_Id": auction_id,
            "Category_Id": category_id
        }


    def __generate_auction__(self, seller_id, name, currently, first_bid, started, ends, description, buy_price=None, location=None):

        if not location:

            latitude, longitude, region, country_code, country_city = self.generator.location_on_land()

            location = " ".join(region, country_code, country_city)

        else:

            latitude, longitude, location = location["Latitude"], location["Longitude"], location["Place"]

        self.auction_id += 1

        return {
            "Id": self.auction_id,
            "Seller_id": seller_id,
            "Name": name,
            "Currently": self.__normalize_dollars__(currently),
            "First_Bid": self.__normalize_dollars__(first_bid),
            "Buy_Price": self.__normalize_dollars__(buy_price) if buy_price else None,
            "Location":  location,
            "Latitude": latitude,
            "Longitude": longitude,
            "Started": started,
            "Ends": ends,
            "Description": description
        }


    def __generate_bid__(self, user_id, auction_id, amount, time):

        self.bid_id += 1

        return {
            "Id": self.bid_id,
            "User_id": user_id,
            "Auction_Id": auction_id,
            "Amount": self.__normalize_dollars__(amount),
            "Time": time
        }


    def __generate_image__(self, auction_id, path):

        self.image_id += 1

        return {
            "Id": self.image_id,
            "Path": path,
            "Auction_Id": auction_id
        }


    def __generate_view__(self, user_id, auction_id, time):

        return {
            "User_Id": user_id,
            "Auction_Id": auction_id,
            "Time": time
        }


    def __register__(self, table, entry):

        if table is None or not isinstance(table, str):

            raise TypeError("'" + str(table) + "' is not a string")

        if table not in self.queries:

            raise ValueError("'" + str(table) + "' is not a valid table name")

        if entry is None or not isinstance(entry, dict):

            raise TypeError("'" + str(entry) + "' is not a dictionary")

        try:

            self.cur.execute(self.queries[table], entry)

        except connector.errors.DatabaseError as error:

            dump = json.dumps(
                entry,
                sort_keys=True,
                indent=4,
                separators=(",", ": "),
                default=lambda d: d.strftime("%Y-%m-%d %H:%M:%S"))

            code, message = str(error).split(": ")

            raise connector.errors.DatabaseError("[Generator] [ERROR {}] {}\n\nDump:{}".format(code, message, dump))

        self.cnx.commit()


    def register(self, auction):

        if self.verbose:

            print("[Generator] Processing auction '%s'" % auction["ItemID"])

        seller = auction["Seller"]

        if seller["UserID"] not in self.users:

            self.__register__("Address", self.__generate_address__())

            self.__register__("User", self.__generate_user__(username=seller["UserID"]))

            self.__register__("General_User", self.__generate_general_user__(user_id=self.users[seller["UserID"]], seller_rating=seller["Rating"]))

        self.__register__("Auction",
            self.__generate_auction__(
                seller_id=self.users[seller["UserID"]],
                name=auction.get("Name"),
                currently=auction.get("Currently"),
                first_bid=auction.get("First_Bid"),
                buy_price=auction.get("Buy_Price"),
                location=auction.get("Location"),
                started=auction.get("Started"),
                ends=auction.get("Ends"),
                description=auction.get("Description")
            )
        )

        if self.downloader:

            for path in self.downloader.download(auction["Name"]):

                try:

                    self.__register__("Image", self.__generate_image__(self.auction_id, path))

                except connector.errors.DatabaseError as error:

                    print("[Generator] Failed to insert (%d, %s) into table 'Image'" % (self.auction_id, path))

                    if self.verbose:

                        print(str(error))

                    pass

        for bid in auction["Bids"]:

            bidder = bid["Bidder"]

            if bidder["UserID"] not in self.users:

                self.__register__("Address", self.__generate_address__())

                self.__register__("User", self.__generate_user__(username=bidder["UserID"]))

                self.__register__("General_User", self.__generate_general_user__(user_id=self.users[bidder["UserID"]], bidder_rating=bidder["Rating"]))

                self.__register__("Bid", self.__generate_bid__(user_id=self.users[bidder["UserID"]], auction_id=self.auction_id, amount=bid["Amount"], time=bid["Time"]))

            self.__register__("Views",
                self.__generate_view__(
                    user_id=self.users[bidder["UserID"]],
                    auction_id=self.auction_id,
                    time=bid["Time"]
                )
            )

        for category in auction["Category"]:

            if category not in self.categories:

                self.__register__("Category", self.__generate_category__(category))

                self.__register__("Auction_has_Category", self.__generate_auction_has_category__(self.auction_id, self.categories[category]))

