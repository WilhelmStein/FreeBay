
import os

import re

directory = os.path.curdir

rating_regex = re.compile(r"Rating=\"([0-9]+)\"")

ratings = []

for filename in sorted(os.listdir(directory), key=lambda filename: (len(filename), filename)):

    if filename.endswith(".xml"):

        with open(filename) as file:

            for line in file.readlines():

                match = rating_regex.search(line, re.IGNORECASE)

                if match:

                    ratings.append(int(match.group(1)))


print("Directory '" + directory + "' reporting:")
print("Matches:", len(ratings))
print("Minimum:", min(ratings))
print("Maximum:", max(ratings))

