
from os import path, listdir

from datetime import datetime

from re import sub

from xml.etree import ElementTree as ET


class Parser:

    @staticmethod
    def to_date(text, fmt="%b-%d-%y %H:%M:%S"):

        return datetime.strptime(text, fmt)


    @staticmethod
    def to_number(text, modifier, delete="$,"):

        return modifier(sub("[" + delete + "]", "", text))


    @staticmethod
    def seller(field):

        seller = {}

        for attribute, value in field.attrib.items():

            seller[attribute] = int(value) if attribute == "Rating" else value

        return seller


    @staticmethod
    def location(field):

        location = { "Place": field.text }

        for attribute, value in field.attrib.items():

            location[attribute] = float(value)

        return location


    @staticmethod
    def bids(field):

        bids = []

        for element in field:

            bid = {}

            for subelement in element:

                if subelement.tag == "Bidder":

                    bid[subelement.tag] = {}

                    for attribute, value in subelement.attrib.items():

                        bid[subelement.tag][attribute] = int(value) if attribute == "Rating" else value

                    for detail in subelement:

                        bid[subelement.tag][detail.tag] = detail.text

                elif subelement.tag == "Amount":

                    bid[subelement.tag] = Parser.to_number(subelement.text, float)

                elif subelement.tag == "Time":

                    bid[subelement.tag] = Parser.to_date(subelement.text)

                else:

                    bid[subelement.tag] = subelement.text

            bids.append(bid)

        return bids


    @staticmethod
    def auction(field):

        auction = {
            "Category": []
        }

        for detail in field:

            if detail.tag == "Category":

                auction[detail.tag].append(detail.text)

            elif detail.tag == "Seller":

                auction[detail.tag] = Parser.seller(detail)

            elif detail.tag == "Location":

                auction[detail.tag] = Parser.location(detail)

            elif detail.tag == "Bids":

                auction[detail.tag] = Parser.bids(detail)

            elif detail.tag == "Currently" or detail.tag == "First_Bid":

                auction[detail.tag] = Parser.to_number(detail.text, float)

            elif detail.tag == "Number_of_Bids":

                auction[detail.tag] = Parser.to_number(detail.text, int)

            elif detail.tag == "Started" or detail.tag == "Ends":

                auction[detail.tag] = Parser.to_date(detail.text)

            else:

                auction[detail.tag] = detail.text

        return auction


    def __init__(self, directory, verbose):

        self.directory = directory

        self.verbose = verbose


    def parse(self):

        auctions = {}

        for filename in sorted(listdir(self.directory), key=lambda filename: (len(filename), filename)):

            if filename.endswith(".xml"):

                if self.verbose:

                    print("Processing file '%s'" % path.join(self.directory, filename))

                for element in ET.parse(filename).getroot():

                    id = int(element.attrib["ItemID"])

                    if self.verbose:

                        print("\tProcessing auction '%s'" % id)

                    auctions[id] = { "ItemID": id, **Parser.auction(element) }

            else:

                if self.verbose:

                    print("Ignoring file '%s'" % path.join(directory, filename))

        return auctions

