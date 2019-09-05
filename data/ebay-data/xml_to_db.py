
import json

from os import path

from timer import Timer

from parser import Parser

from downloader import Downloader

from generator import Generator

from cache import Cache


total_timer, partial_timer = Timer(), Timer()

total_timer.start()

partial_timer.start("Initializing the 'Parser'...")

parser = Parser()

example_id = -1 # 1045310980

if example_id in parser.auctions:

    print(parser.dumps(example_id), sep='\n')

partial_timer.stop("The 'Parser' has been initialized")


# partial_timer.start("Initializing the 'Downloader'...")

# downloader = Downloader(no_download=True)

# partial_timer.stop("The 'Downloader' has been initialized")


partial_timer.start("Initializing the 'Cache'...")

cache = Cache()

partial_timer.stop("The 'Cache' has been initialized")


partial_timer.start("Initializing the 'Generator'...")

generator = Generator(cache)

partial_timer.stop("The 'Generator' has been initialized")


for auction in parser.auctions.values():

    generator.register(auction)

total_timer.stop("Done")

