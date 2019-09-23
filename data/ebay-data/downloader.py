
from google_images_download import google_images_download

from PIL import Image

from os import remove
from os.path import relpath, join

from random import randrange

from logger import Logger


class Downloader:

    def __init__(
        self,
        verbose=True,
        logger=Logger("Downloader"),
        max_path_len=256,
        max_size=(640, 640),
        fmt="jpg",
        min_limit=0, max_limit=3,
        size=">400*300",
        aspect_ratio="panoramic",
        output_directory="images"
    ):

        self.verbose, self.logger = verbose, logger

        self.max_path_len, self.max_size = max_path_len, max_size

        if self.max_path_len is None and self.max_size is None:

            raise ValueError("Downloading images requires 'max_size' to be non 'None'")

        self.min_limit, self.max_limit = min_limit, max_limit

        self.parameters = {
            "no_directory": True,
            "no_download": self.max_path_len is not None,
            "print_paths": True,
            "format": fmt,
            "size": size,
            "aspect_ratio": aspect_ratio,
            "output_directory": output_directory,
            "silent_mode": True,
            "delay": 0
        }

        self.underlying = google_images_download.googleimagesdownload()


    def download(self, id, keywords):

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

                else:

                    for index, path in enumerate(paths):

                        if self.verbose:

                            self.logger.log("Resizing '{}' to {}".format(relpath(path), self.max_size))

                        image = Image.open(path)

                        image.thumbnail(self.max_size, Image.ANTIALIAS)

                        filename = "{}_{}.{}".format(id, index, self.parameters["format"])

                        image.save(join(self.parameters["output_directory"], filename))

                        remove(path)

            return paths

        except FileNotFoundError:

            pass

