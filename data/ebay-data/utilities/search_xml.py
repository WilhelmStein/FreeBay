
import os

import re


metrics = {
    "Minimum": min,
    "Maximum": max,
    "Matches": len
}


directory = os.pardir

# target = re.compile(r"Rating=\"([0-9]+)\"")
# modifier = int
target = re.compile(r"<Description>(.*)</Description>")
modifier = len

results = []

filenames = os.listdir(directory)
filenames = sorted(filenames, key=lambda filename: (len(filename), filename))
filenames = map(lambda filename: os.path.join(directory, filename), filenames)

for filename in filenames:

    if filename.endswith(".xml"):

        with open(filename) as file:

            for line in file.readlines():

                match = target.search(line, re.IGNORECASE)

                if match:

                    results.append(modifier(match.group(1)))


for metric, method in metrics.items():

    print(metric, ":", method(results))

