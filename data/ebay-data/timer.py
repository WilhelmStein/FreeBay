
from time import time

from datetime import date


class Timer:

    def __init__(self):

        self.elapsed = 0


    def start(self, message=None):

        self.elapsed = time()

        if message:

            print("[Timer] %s" % message)


    def stop(self, message=None):

        self.elapsed = time() - self.elapsed

        print("[Timer] Completed after {:05.3g} minutes".format(self.elapsed / 60))

        if message:

            print("[Timer] %s" % message)

        self.elapsed = 0

