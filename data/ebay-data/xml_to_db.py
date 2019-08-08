
import json

from os import path

from parser import Parser

from generator import Generator


# Process every .XML file in the given directory and store its contents
# in a shared-between-files dictionary of auctions hashed by their unique 'ItemID's

parser = Parser(target='./items-0.xml')

# example_id = 1043749860

# if example_id in parser.auctions:

#     print(parser.dumps(example_id), sep='\n')

generator = Generator()

for auction in parser.auctions.values():

    generator.register(auction)

