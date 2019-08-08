
from datetime import datetime

from re import sub

from xml.etree import ElementTree as ET

import json

import os


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

        return {
            "Place": field.text,
            "Latitude": field.attrib.get("Latitude"),
            "Longitude": field.attrib.get("Longitude")
        }


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


    def __init__(self, target=os.path.curdir, verbose=False):

        if not os.path.exists(target):

            raise ValueError("'" + target + "' does not name an existing file or directory")

        if os.path.isfile(target):

            self.filenames = []

            if target.endswith(".xml"):

                self.filenames.append(target)

        elif os.path.isdir(target):

            self.filenames = [filename for filename in os.listdir(target) if filename.endswith(".xml")]
            self.filenames = sorted(self.filenames, key=lambda filename: (len(filename), filename))

        else:

            raise ValueError("'%s' is neither a directory nor a file")


        self.auctions = {}

        for filename in self.filenames:

            if verbose:

                print("Processing file '%s'" % os.path.join(self.directory, filename))

            for element in ET.parse(filename).getroot():

                id = int(element.attrib["ItemID"])

                if verbose:

                    print("\tProcessing auction '%s'" % id)

                self.auctions[id] = { "ItemID": id, **Parser.auction(element) }


    def dumps(self, id):

        return json.dumps(
            self.auctions[id],
            sort_keys=True,
            indent=4,
            separators=(",", ": "),
            default=lambda d: d.strftime("%Y-%m-%d %H:%M:%S"))

