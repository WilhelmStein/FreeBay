
from google_images_download import google_images_download

from PIL import Image

from os.path import relpath

from random import randrange


class Downloader:

    def __init__(
        self,
        no_download=False,
        format="jpg",
        min_limit=0, max_limit=3,
        size=">400*300",
        aspect_ratio="panoramic",
        output_directory="auction_images",
        max_size=(640, 640)):

        self.min_limit, self.max_limit = min_limit, max_limit

        self.parameters = {
            "no_download": no_download,
            "print_paths": True,
            "format": format,
            "size": size,
            "aspect_ratio": aspect_ratio,
            "output_directory": output_directory,
            "silent_mode": True,
            "delay": 0
        }

        self.underlying = google_images_download.googleimagesdownload()

        self.max_size = None if no_download else max_size


    def download(self, keywords):

        try:

            limit = randrange(self.min_limit, self.max_limit) if self.min_limit < self.max_limit else self.max_limit

            print("[Downloader] Limit set to %d" % limit)

            paths = []

            if limit > 0:

                search_args = {
                    **self.parameters,
                    "keywords": keywords,
                    "limit": limit
                }

                paths = list(self.underlying.download(search_args)[0].values())[0]

            if self.max_size:

                for path in paths:

                    print("[Downloader] Resizing '{}' to {}".format(relpath(path), self.max_size))

                    image = Image.open(path)

                    image.thumbnail(self.max_size, Image.ANTIALIAS)

                    image.save(path)

            return paths

        except FileNotFoundError:

            pass

