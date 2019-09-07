
from google_images_download import google_images_download

from PIL import Image

from os.path import relpath

from random import randrange

from logger import Logger


class Downloader:

    def __init__(
        self,
        verbose=True,
        logger=Logger("Downloader"),
        max_path_len=256,
        format="jpg",
        min_limit=0, max_limit=3,
        size=">400*300",
        aspect_ratio="panoramic",
        output_directory="auction_images",
        max_size=(640, 640)
    ):

        self.verbose, self.logger = verbose, logger

        self.max_path_len = max_path_len

        self.min_limit, self.max_limit = min_limit, max_limit

        self.parameters = {
            "no_download": self.max_path_len is not None,
            "print_paths": True,
            "format": format,
            "size": size,
            "aspect_ratio": aspect_ratio,
            "output_directory": output_directory,
            "silent_mode": True,
            "delay": 0
        }

        self.underlying = google_images_download.googleimagesdownload()

        self.max_size = None if self.max_path_len is not None else max_size


    def download(self, keywords):

        try:

            limit = randrange(self.min_limit, self.max_limit) if self.min_limit < self.max_limit else self.max_limit

            if self.verbose:

                self.logger.log("Limit set to %d" % limit)


            paths = []

            if limit > 0:

                search_args = {
                    **self.parameters,
                    "keywords": keywords,
                    "limit": limit
                }

                paths = list(self.underlying.download(search_args)[0].values())[0]

                if self.max_path_len:

                    accepted = list(filter(lambda path: len(path) <= self.max_path_len, paths))

                    if self.verbose:

                        rejected = set(paths).difference(set(accepted))

                        if rejected:

                            self.logger.log(*[(len(path), path) for path in rejected], sep='\n')

                    paths = accepted

            if self.max_size:

                for path in paths:

                    if self.verbose:

                        self.logger.log("Resizing '{}' to {}".format(relpath(path), self.max_size))

                    image = Image.open(path)

                    image.thumbnail(self.max_size, Image.ANTIALIAS)

                    image.save(path)

            return paths

        except FileNotFoundError:

            pass

