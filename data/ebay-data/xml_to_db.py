
from argparse import ArgumentParser

from os import path

from parser import Parser

from downloader import Downloader

from generator import Generator

from cache import Cache


argparser = ArgumentParser()

argparser.add_argument("-t", "--targets",  help="specify any target files",   nargs='+')
argparser.add_argument("-c", "--crawl",    help="enable image crawling",      action="store_true")
argparser.add_argument("-d", "--download", help="enable image downloading",   action="store_true")
argparser.add_argument("-v", "--views",    help="enable generation of views", action="store_true")

args = argparser.parse_args()

parser = Parser(args.targets) if args.targets else Parser()

if args.crawl:

    downloader = Downloader()

elif args.download:

    downloader = Downloader(max_path_len=None)

else:

    downloader = None

cache = Cache()

categories = [
    ("Health & Fitness",       "Your body is your temple. Respect it as you should."),
    ("Clothing",               "Be fashionable, be alluring."),
    ("Home",                   "Home sweet home."),
    ("CDs & Vinyl",            "Kick back and relax to the sound of music."),
    ("Digital Music",          "All the newest tracks are here."),
    ("Computer & Accessories", "The best computers money can buy."),
    ("Jewellery",              "Treat yourself to something glamorous and exquisite."),
    ("Garden & Outdoors",      "Take a breath of fresh air."),
    ("Kitchen",                "Cooking has never been easier!"),
    ( "Pet Supplies",          "Because your small furry friend deserves only the best."),
    ( "Sports",                "Live life to the fullest!"),
    ( "Toys & Games",          "From miniatures to videogames."),
    ( "Electronics",           "For all your electronics needs.")
]

generator = Generator(cache, categories, downloader)

for auction in parser.auctions.values():

    generator.register(auction)

if args.views:

    generator.generate_views()

