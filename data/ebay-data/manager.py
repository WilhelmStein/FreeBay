
from mysql import connector

from faker import Faker

from datetime import datetime

import random


class Manager:

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
        "Category": (
            "INSERT INTO Category "
            "(Id, Name) "
            "VALUES (%(Id)s, %(Name)s)"
        ),
        "Auction_has_Category": (
            "INSERT INTO Auction_has_Category "
            "(Auction_Id, Category_Id) "
            "VALUES (%(Auction_Id)s, %(Category_Id)s)"
        ),
        "Auction": (
            "INSERT INTO Auction "
            "(id, Seller_id, Name, Currently, First_Bid, Buy_Price, Location, Latitude, Longitude, Started, Ends, Description) "
            "VALUES (%(id)s, %(Seller_id)s, %(Name)s, %(Currently)s, %(First_Bid)s, %(Buy_Price)s, %(Location)s, %(Latitude)s, %(Longitude)s, %(Started)s, %(Ends)s, %(Description)s)"
        ),
        "Bid": (
            "INSERT INTO Bid"
            "(Id, User_id, Auction_Id, Amount, Time)"
            "(%(Id)s, %(User_id)s, %(Auction_Id)s, %(Amount)s, %(Time)s)"
        )
    }

    def __init__(self, seed=123456789, starting_user_id=0, starting_address_id=0, starting_category_id=0, starting_auction_id=0, starting_bid_id=0):

        self.cnx = connector.connect(**Manager.config)

        self.cur = self.cnx.cursor()


        self.random.seed(seed)

        self.generator = Faker()

        self.generator.seed(seed)


        self.user_id = starting_user_id

        self.address_id = starting_address_id

        self.category_id = starting_category_id

        self.auction_id = starting_auction_id

        self.bid_id = starting_bid_id


    def __del__(self):

        self.cur.close()

        self.cnx.close()


    @staticmethod
    def __random_decimal__(lower=0.0, upper=999.9, round_digits=2):

        return round(random.uniform(lower, upper), round_digits)


    @staticmethod
    def __random_amount__(mean=500, sigma=165):

        return random.gauss(mean, sigma)


    def __random_datetime__(self):

        return datetime.combine(self.generator.date_object(), self.generator.time_object())


    def __random_auction_description__(self, lower=100, upper=300):

        return self.generator.text(random.randint(lower, upper))


    def __generate_user__(self, user_id, username=None, password=None, email=None):

        return {
            "Id" : user_id,
            "Username" : username if username else self.generator.user_name(),
            "Password" : password if password else self.generator.password(),
            "Email" : email if email else self.generator.email()
        }


    def __generate_general_user__(self, user_id, address_id, seller_rating=None, bidder_rating=None, name=None, surname=None, phone=None):

        return {
            "User_Id": user_id,
            "Seller_Rating": seller_rating if seller_rating else __random_decimal__(),
            "Bidder_Rating": bidder_rating if bidder_rating else __random_decimal__(),
            "Name": name if name else self.generator.first_name(),
            "Surname": surname if surname else self.generator.last_name(),
            "Phone": phone if phone else self.generator.phone_number(),
            "Address_Id": address_id,
            "Validated": True
        }


    def __generate_address__(self, address_id, street=None, number=None, zip_code=None, country=None, city=None):

        return {
            "Id": address_id,
            "Street": street if street else self.generator.street_name(),
            "Number": number if number else random.randint(1, 100),
            "ZipCode": zip_code if zip_code else self.generator.zip_code(),
            "Country": country if country else self.generator.country(),
            "City": city if city else self.generator.city()
        }


    def __generate_category__(self, category_id, name):

        return {
            "Id": category_id,
            "Name": name
        }


    def __generate_auction_has_category__(self, auction_id, category_id):

        return {
            "Auction_Id": auction_id,
            "Category_Id": category_id
        }


    def __generate_auction__(self, auction_id, seller_id, name, currently=None, first_bid=None, buy_price=None, location=None, latitude=None, longitude=None, started=None, ends=None, description=None):

        if location is None:

            latitude, longitude, region, country_code, country_city = self.generator.location_on_land()

            location = " ".join(region, country_code, country_city)

        return {
            "Id": auction_id,
            "Seller_id": seller_id,
            "Name": name,
            "Currently": currently if currently else __random_amount__(),
            "First_Bid": first_bid if first_bid else __random_amount__(),
            "Buy_Price": buy_price if buy_price else __random_amount__(),
            "Location":  location,
            "Latitude": latitude,
            "Longitude": longitude,
            "Started": __random_datetime__(),
            "Ends": __random_datetime__(),
            "Description": __random_auction_description__()
        }


    def __generate_bid__(self, bid_id, user_id, auction_id, amount=None, time=None):

        return {
            "Id": bid_id,
            "User_id": user_id,
            "Auction_Id": auction_id,
            "Amount": amount if amount else __random_amount__(),
            "Time": time if time else __random_datetime__()
        }


    def register(self, entry, table):

        if table is None or not isinstance(table, str):

            raise TypeError("'table' is not a string")

        if table not in queries:

            raise ValueError("'" + table + "' is not a valid table name")

        if entry is None or not isinstance(entry, dict):

            raise TypeError("'entry' is not a dictionary")

        self.cur.execute(queries[table], entry)

        self.cnx.commit()

