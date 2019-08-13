
import json

from os import path

from parser import Parser

from generator import Generator


parser = Parser(target='./items-0.xml')

example_id = -1 # 1045310980

if example_id in parser.auctions:

    print(parser.dumps(example_id), sep='\n')

generator = Generator(normalized_image_size=None)

for auction in parser.auctions.values():

    generator.register(auction)

