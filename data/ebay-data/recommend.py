
# Example usage: python3 recommend.py -q "$(cat example.vector)"

import numpy as np

from flask import Flask, json

from argparse import ArgumentParser

from loader import Loader


np.seterr(all='raise')

parser = ArgumentParser()

parser.add_argument("-t", "--top",       help="return the top TOP candidates", type=int, default=10)
parser.add_argument("-v", "--verbose",   help="explain what is being done",    action="store_true")
parser.add_argument("-o", "--overwrite", help="re-train the model",            action="store_true")

args = parser.parse_args()

model = Loader(verbose=args.verbose, overwrite=args.overwrite)


server = Flask(__name__)

@server.route('/python')
def index():

    return "Recommendation Server\n\n" + parser.format_help()


@server.route('/python/<user_id>')
def parse_request(user_id):
    try:

        response = {
            "data" : [
                {
                    "id": candidate[0],
                    "score": candidate[1]
                } for candidate in model.top(user_id, args.top)
            ],
            "error": False,
            "message": "OK"
        }

    except Exception as error:

        response = {
            "data": [],
            "error": True,
            "message": str(error)
        }

    return json.dumps(response)


if __name__ == '__main__':

    server.run(port=8000)

