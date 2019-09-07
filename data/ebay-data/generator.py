
from mysql import connector

from faker import Faker

from datetime import datetime

import random

import os

from logger import Logger


class Generator:

    def __init__(
        self,
        cache,
        downloader=None,
        seed=123456789,
        verbose=True,
        logger=Logger("Generator"),
        rating_lower=0.0, rating_upper=58823.0, rating_digits=1,
        dollar_digits=2,
        validated_percentage=0.7
    ):

        self.cache = cache

        self.verbose, self.logger = verbose, logger

        self.rating_lower, self.rating_upper, self.rating_digits = rating_lower, rating_upper, rating_digits

        self.dollar_digits = dollar_digits

        self.validated_percentage = validated_percentage


        self.downloader = downloader


        self.random = random.Random(seed)

        self.generator = Faker()

        self.generator.seed(seed)


        self.auction_id = 0

        self.users = {}

        self.categories = {}

        self.address_id = 0

        self.bid_id = 0

        self.image_id = 0


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


    def register(self, auction):

        if self.verbose:

            self.logger.log("Processing auction '%s'" % auction["ItemID"])

        seller = auction["Seller"]

        if seller["UserID"] not in self.users:

            self.cache.register("Address", self.__generate_address__())

            self.cache.register("User", self.__generate_user__(username=seller["UserID"]))

            self.cache.register("General_User", self.__generate_general_user__(user_id=self.users[seller["UserID"]], seller_rating=seller["Rating"]))

        self.cache.register("Auction",
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

        self.logger.log("Auction '%s' registered as '%d'" % (auction["ItemID"], self.auction_id))

        if self.downloader:

            for path in self.downloader.download(auction["Name"]):

                try:

                    self.cache.register("Image", self.__generate_image__(self.auction_id, path))

                except connector.errors.DatabaseError as error:

                    self.logger.log("Failed to insert (%d, %s) into table 'Image'" % (self.auction_id, path))

                    if self.verbose:

                        self.logger.log(str(error))

                    pass

        for bid in auction["Bids"]:

            bidder = bid["Bidder"]

            if bidder["UserID"] not in self.users:

                self.cache.register("Address", self.__generate_address__())

                self.cache.register("User", self.__generate_user__(username=bidder["UserID"]))

                self.cache.register("General_User", self.__generate_general_user__(user_id=self.users[bidder["UserID"]], bidder_rating=bidder["Rating"]))

                self.cache.register("Bid", self.__generate_bid__(user_id=self.users[bidder["UserID"]], auction_id=self.auction_id, amount=bid["Amount"], time=bid["Time"]))

            self.cache.register("Views",
                self.__generate_view__(
                    user_id=self.users[bidder["UserID"]],
                    auction_id=self.auction_id,
                    time=bid["Time"]
                )
            )

        for category in auction["Category"]:

            if category not in self.categories:

                self.cache.register("Category", self.__generate_category__(category))

                self.cache.register("Auction_has_Category", self.__generate_auction_has_category__(self.auction_id, self.categories[category]))

