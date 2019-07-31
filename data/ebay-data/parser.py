
from datetime import datetime

from re import sub


def to_date(text):

    return datetime.strptime(text, "%b-%d-%y %H:%M:%S")


def to_number(text, modifier, delete="$,"):

    return modifier(sub("[" + delete + "]", "", text))


def seller(field):

    seller = {}

    for attribute, value in field.attrib.items():

        seller[attribute] = int(value) if attribute == "Rating" else value

    return seller


def location(field):

    location = { "Place": field.text }

    for attribute, value in field.attrib.items():

        location[attribute] = float(value)

    return location


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

                bid[subelement.tag] = to_number(subelement.text, float)

            elif subelement.tag == "Time":

                bid[subelement.tag] = to_date(subelement.text)

            else:

                bid[subelement.tag] = subelement.text

        bids.append(bid)

    return bids


def parse(id, field):

    auction = {
        "ItemID": id,
        "Category": []
    }

    for detail in field:

        if detail.tag == "Category":

            auction[detail.tag].append(detail.text)

        elif detail.tag == "Seller":

            auction[detail.tag] = seller(detail)

        elif detail.tag == "Location":

            auction[detail.tag] = location(detail)

        elif detail.tag == "Bids":

            auction[detail.tag] = bids(detail)

        elif detail.tag == "Currently" or detail.tag == "First_Bid":

            auction[detail.tag] = to_number(detail.text, float)

        elif detail.tag == "Started" or detail.tag == "Ends":

            auction[detail.tag] = to_date(detail.text)

        else:

            auction[detail.tag] = detail.text

        return auction

