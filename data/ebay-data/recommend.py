
# Example usage: python3 recommend.py -q "$(cat example.vector)"

import numpy as np

from json import dumps

from argparse import ArgumentParser

from loader import Loader

parser = ArgumentParser()

parser.add_argument("-q", "--query",     help="specify the query vector", nargs='+', required=True)
parser.add_argument("-v", "--verbose",   help="print useful debugging messages", action="store_true")
parser.add_argument("-o", "--overwrite", help="re-train the model and overwrite the previous one", action="store_true")

args = parser.parse_args()

query = args.query

model = Loader(verbose=args.verbose, overwrite=args.overwrite)

query = np.random.randint(2, size=model.dimension())
query = query / np.linalg.norm(query)

response = {
    "recommended" : [
        { "id": candidate[0], "score": candidate[1] } for candidate in model.top(query)
    ]
}

print(dumps(response, indent=4))

