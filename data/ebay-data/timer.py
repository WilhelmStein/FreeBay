
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

        self.elapsed = int(time() - self.elapsed)

        minutes, seconds = self.elapsed // 60, self.elapsed % 60

        print("[Timer] Completed after {:02d} minutes and {:02d} seconds".format(minutes, seconds))

        if message:

            print("[Timer] %s" % message)

        self.elapsed = 0

