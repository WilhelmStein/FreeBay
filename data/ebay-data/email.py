
import random

class Email:

    suffixes = [
        "hotmail.com",
        "yahoo.ca",
        "gmail.com",
        "att.net",
        "sbcglobal.net",
        "outlook.com",
        "comcast.net",
        "icloud.com",
        "live.com",
        "optonline.net",
        "mac.com",
        "msn.com",
        "me.com"
    ]

    def __init__(self, seed=123456789):

        random.seed(seed)

    def get(username):

        return username + "@" + random.choice(suffixes)

