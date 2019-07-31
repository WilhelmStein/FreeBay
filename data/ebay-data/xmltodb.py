
import os

import xml.etree.ElementTree as ET

import json

from parser import parse

# Parameters

debug = False

directory = os.path.curdir

# Process every .XML file in the given directory and store its contents
# in a shared-between-files dictionary of auctions hashed by their unique 'ItemID's

for filename in sorted(os.listdir(directory), key=lambda filename: (len(filename), filename)):

    if filename.endswith(".xml"):

        if debug:

            print("Processing file '%s'" % os.path.join(directory, filename))

        for element in ET.parse(filename).getroot():

            id = int(element.attrib["ItemID"])

            if debug:

                print("\tProcessing auction '%s'" % id)

            auction = parse(id, element)

            if id == 1043495702:

                print("\n\nExample:", json.dumps(
                    auction,
                    sort_keys=True,
                    indent=4,
                    separators=(",", ": "),
                    default=lambda d: d.strftime("%Y-%m-%d %H:%M:%S")),
                    sep='\n'
                )

    else:

        if debug:

            print("Ignoring file '%s'" % os.path.join(directory, filename))

