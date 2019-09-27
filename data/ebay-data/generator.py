
from mysql import connector

from faker import Faker

from datetime import datetime

from math import floor

from random import Random

from logger import Logger


class Generator:

    def __init__(
        self,
        cache,
        categories,
        downloader=None,
        seed=123456789,
        verbose=True,
        logger=Logger("Generator"),
        rating_lower=0.0, rating_upper=58823.0, rating_digits=1,
        dollar_digits=2,
        validated_users_percentage=0.7
    ):

        self.cache = cache

        self.verbose, self.logger = verbose, logger

        self.rating_lower, self.rating_upper, self.rating_digits = rating_lower, rating_upper, rating_digits

        self.dollar_digits = dollar_digits

        self.validated_users_percentage = validated_users_percentage


        self.downloader = downloader


        self.random = Random(seed)

        self.generator = Faker()

        self.generator.seed(seed)


        self.auction_id = 0

        self.users = {}

        self.categories = categories

        for category_index, category_data in enumerate(categories):

            category_name, category_caption = category_data

            self.cache.register("Category",
                self.__generate_category__(
                    id=category_index + 1,
                    name=category_name,
                    caption=category_caption
                )
            )

        self.views = {}

        self.address_id = 0

        self.bid_id = 0

        self.image_id = 0


    def __lower_end_biased_random__(self, lower, upper):

        return floor(abs(self.random.random() - self.random.random()) * (1.0 + upper - lower) + lower)


    def __normalize_rating__(self, decimal, dst_lower=0.0, dst_upper=100.0):

        return round((decimal - self.rating_lower) * ((dst_upper - dst_lower) / (self.rating_upper - self.rating_lower)) + dst_lower, self.rating_digits)


    def __random_rating__(self, lower=0.0, upper=100.0):

        return round(self.__lower_end_biased_random__(lower, upper), self.rating_digits)


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
            "Validated": self.random.random() <= self.validated_users_percentage
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


    def __generate_category__(self, id, name, caption=None):

        return {
            "Id": id,
            "Name": name,
            "Caption": caption if caption else self.generator.text(50)
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
            "Description": description,
            "Ended": False
        }


    def __generate_bid__(self, user_id, auction_id, amount, time):

        self.bid_id += 1

        return {
            "Id": self.bid_id,
            "User_Id": user_id,
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


    def __generate_view__(self, user_id, auction_id, time=None):

        if user_id not in self.views:

            self.views[user_id] = set()

        self.views[user_id].add(auction_id)

        return {
            "User_Id": user_id,
            "Auction_Id": auction_id,
            "Time": self.generator.date_time_this_year() if time is None else time
        }


    def register(self, auction):

        if self.verbose:

            self.logger.log("Processing auction '%s'" % auction["ItemID"])

        seller = auction["Seller"]

        if seller["UserID"] not in self.users:

            self.cache.register("Address", self.__generate_address__())

            self.cache.register("User", self.__generate_user__(username=seller["UserID"]))

            self.cache.register("General_User", self.__generate_general_user__(user_id=self.users[seller["UserID"]]))

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

            for path in self.downloader.download(self.auction_id, auction["Name"]):

                self.cache.register("Image", self.__generate_image__(self.auction_id, path))

        for bid in auction["Bids"]:

            bidder = bid["Bidder"]

            if bidder["UserID"] not in self.users:

                self.cache.register("Address", self.__generate_address__())

                self.cache.register("User", self.__generate_user__(username=bidder["UserID"]))

                self.cache.register("General_User", self.__generate_general_user__(user_id=self.users[bidder["UserID"]]))

                self.cache.register("Bid", self.__generate_bid__(user_id=self.users[bidder["UserID"]], auction_id=self.auction_id, amount=bid["Amount"], time=bid["Time"]))

            self.cache.register("Views",
                self.__generate_view__(
                    user_id=self.users[bidder["UserID"]],
                    auction_id=self.auction_id,
                    time=bid["Time"]
                )
            )


        for category_index in self.random.sample(range(len(self.categories)), self.__lower_end_biased_random__(1, len(self.categories))):

            self.cache.register("Auction_has_Category", self.__generate_auction_has_category__(self.auction_id, category_index + 1))


    def generate_views(
        self,
        users_having_views_percentage=0.7,
        min_views_percentage=0.005,
        max_views_percentage=0.025
    ):

        users_having_views_percentage = max(users_having_views_percentage, self.validated_users_percentage)

        total_viewed_percentage = lambda: self.__lower_end_biased_random__(min_views_percentage * 1e+6, max_views_percentage * 1e+6) / 1e+6

        auctions = set(range(0, self.auction_id))

        users_having_views = round(users_having_views_percentage * len(self.users))

        if self.verbose:

            self.logger.log("Generating views for {} users".format(users_having_views))

        for username, user_id in self.random.sample(self.users.items(), users_having_views):

            already_viewed_percentage = len(self.views[user_id]) / self.auction_id if user_id in self.views else 0.0

            generated_views_percentage = max(0.0, total_viewed_percentage() - already_viewed_percentage)

            number_of_views = round(generated_views_percentage * self.auction_id)

            if number_of_views <= 0:

                continue


            if self.verbose:

                self.logger.log("Generating {} views for user '{}' [{}]".format(number_of_views, username, user_id))

            for auction_id in self.random.sample(auctions.difference(self.views[user_id]) if user_id in self.views else auctions, number_of_views):

                self.cache.register("Views",
                    self.__generate_view__(
                        user_id,
                        auction_id
                    )
                )

