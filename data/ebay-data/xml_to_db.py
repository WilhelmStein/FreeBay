
import json

from os import path

from parser import Parser

from downloader import Downloader

from generator import Generator


parser = Parser(target='./items-0.xml')

example_id = -1 # 1045310980

if example_id in parser.auctions:

    print(parser.dumps(example_id), sep='\n')

# downloader = Downloader()

generator = Generator()

for auction in parser.auctions.values():

    generator.register(auction)

