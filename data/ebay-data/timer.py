
from time import time

from datetime import date

from logger import Logger


class Timer:

    def __init__(self, logger=Logger("Timer")):

        self.elapsed, self.logger = 0, logger


    def start(self, message=None):

        self.elapsed = time()

        if message:

            self.logger.log("%s" % message)


    def stop(self, message=None):

        self.elapsed = int(time() - self.elapsed)

        minutes, seconds = self.elapsed // 60, self.elapsed % 60

        self.logger.log("Completed after {:02d} minutes and {:02d} seconds".format(minutes, seconds))

        if message:

            self.logger.log("%s" % message)

        self.elapsed = 0

