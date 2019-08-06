
import json

from os import path

from parser import Parser

from generator import Generator


# Process every .XML file in the given directory and store its contents
# in a shared-between-files dictionary of auctions hashed by their unique 'ItemID's

try:

    parser = Parser()

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

    generator = Generator()

    for auction in auctions:

        entry, table = None, None

        generator.register(entry, table)

except Exception as exception:

    print("\n[ERROR]:", exception)

