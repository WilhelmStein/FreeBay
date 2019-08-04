
import json

from os import path

from parser import Parser

from manager import Manager


# Process every .XML file in the given directory and store its contents
# in a shared-between-files dictionary of auctions hashed by their unique 'ItemID's

parser = Parser(directory=path.curdir, verbose=False)

auctions = parser.parse()

example_id = 1043749860

if example_id in auctions:

    print(json.dumps(
        auctions[example_id],
        sort_keys=True,
        indent=4,
        separators=(",", ": "),
        default=lambda d: d.strftime("%Y-%m-%d %H:%M:%S")),
        sep='\n'
    )

manager = Manager()

for auction in auctions:

    entry, table = None, None

    manager.register(entry, table)

