
import os

import re

import xml.etree.ElementTree as ET

import mysql.connector as sql

import json

import datetime

# Parameters

directory = os.path.curdir

# 'General User' Table

general_users = {}

general_user_query = (
    "INSERT INTO General_User "
    "(User_Id, Seller_Rating, Bidder_Rating, Name, Surname, Phone, Address_Id, Validated) "
    "(%(User_Id)s, %(Seller_Rating)s, %(Bidder_Rating)s, %(Name)s, %(Surname)s, %(Phone)s, %(Address_Id)s, %(Validated)s)"
)

construct_general_user = lambda id: { "User_Id": id, **general_users[id] }

# 'Category' Table

categories = {}

category_query = (
    "INSERT INTO Category "
    "(Id, Name) "
    "VALUES (%(Id)s, %(Name)s)"
)

construct_category = lambda id: { "Id": id, **categories[id] }

# 'Auction' Table

auctions = {}

auction_query = (
    "INSERT INTO Auction "
    "(id, Seller_id, Name, Currently, First_Bid, Buy_Price, Location, Latitude, Longitude, Started, Ends, Description) "
    "VALUES (%(id)s, %(Seller_id)s, %(Name)s, %(Currently)s, %(First_Bid)s, %(Buy_Price)s, %(Location)s, %(Latitude)s, %(Longitude)s, %(Started)s, %(Ends)s, %(Description)s)"
)

construct_auction = lambda id: { "id": id, **auctions[id] }

# 'Auction_has_Category' Table

auction_has_category = {}

auction_has_category_query = (
    "INSERT INTO Auction_has_Category "
    "(Auction_Id, Category_Id) "
    "VALUES (%(Auction_Id)s, %(Category_Id)s)"
)

construct_auction_has_category = lambda id: [ { "Auction_Id": id, "Category_Id": category_id } for category_id in auction_has_category[id] ]

# 'Bid' Table

bids = {}

bid_query = (
    "INSERT INTO Bid"
    "(Id, User_id, Auction_Id, Amount, Time)"
    "(%(Id)s, %(User_id)s, %(Auction_Id)s, %(Amount)s, %(Time)s)"
)

construct_bid = lambda id: { "Id": id, **bids[id] }

# Utility Functions

to_date = lambda text: datetime.datetime.strptime(text, "%b-%d-%y %H:%M:%S")

to_number = lambda text, modifier, delete="$,": modifier(re.sub("[" + delete + "]", "", text))

# Processing XML Elements

def processSeller(id, field):

    auctions[id][field.tag] = {}

    for subelement in field.attrib.keys():

        auctions[id][field.tag][subelement] = int(field.attrib[subelement]) if subelement == "Rating" else field.attrib[subelement]


def processLocation(id, field):

    auctions[id][field.tag] = { "Place": field.text }

    for subelement in field.attrib.keys():

        auctions[id][field.tag][subelement] = float(field.attrib[subelement])


def processBids(id, field):

    auctions[id][field.tag] = []

    for element in field:

        bid = {}

        for subelement in element:

            if subelement.tag == "Bidder":

                bid[subelement.tag] = {}

                for attribute in subelement.attrib.keys():

                    bid[subelement.tag][attribute] = int(subelement.attrib[attribute]) if attribute == "Rating" else subelement.attrib[attribute]

                for detail in subelement:

                    bid[subelement.tag][detail.tag] = detail.text

            elif subelement.tag == "Amount":

                bid[subelement.tag] = float(re.sub("[$,]", "", subelement.text))

            elif subelement.tag == "Time":

                bid[subelement.tag] = datetime.datetime.strptime(subelement.text, "%b-%d-%y %H:%M:%S")

            else:

                bid[subelement.tag] = subelement.text

        auctions[id][field.tag].append(bid)


def process(id, item):

    if id in auctions:

        raise ValueError("Duplicate auction '" + id + "'")

    auctions[id] = {
        "Category": []
    }

    for detail in item:

        if detail.tag == "Category":

            auctions[id][detail.tag].append(detail.text)

        elif detail.tag == "Seller":

            processSeller(id, detail)

        elif detail.tag == "Location":

            processLocation(id, detail)

        elif detail.tag == "Bids":

            processBids(id, detail)

        elif detail.tag == "Currently" or detail.tag == "First_Bid":

            auctions[id][detail.tag] = to_number(detail.text, float)

        elif detail.tag == "Started" or detail.tag == "Ends":

            auctions[id][detail.tag] = to_date(detail.text)

        else:

            auctions[id][detail.tag] = detail.text


# Process every .XML file in the given directory and store its contents
# in a shared-between-files dictionary of auctions hashed by their unique 'ItemID's

for filename in sorted(os.listdir(directory), key=lambda filename: (len(filename), filename)):

    if filename.endswith(".xml"):

        print("Processing file '%s'" % os.path.join(directory, filename))

        for item in ET.parse(filename).getroot():

            id = int(item.attrib["ItemID"])

            print("\tProcessing auction '%s'" % id)

            process(id, item)

    else:

        print("Ignoring file '%s'" % os.path.join(directory, filename))

# Example showcasing the format of an auction stored in the dictionary

example_id = 1043495702

if example_id in auctions:

    print("\n\nExample:", json.dumps(auctions[example_id], sort_keys=True, indent=4, separators=(",", ": "), default=lambda d: d.strftime("%Y-%m-%d %H:%M:%S")), sep='\n')

# Establish an sql connection, register every auction while updating any relative tables

config = {
    "user": "root",
    "password": "password",
    "host": "127.0.0.1",
    "database": "freebay",
    "raise_on_warnings": True
}

cnx = sql.connect(**config)

cursor = cnx.cursor()

cursor.close()

cnx.close()

