
from google_images_download import google_images_download

from PIL import Image

import os


class Downloader:

    def __init__(self, format="jpg", limit=2, size=">400*300", aspect_ratio="panoramic", output_directory="auction_images", max_size=(640, 640)):

        self.parameters = {
            "format": format,
            "limit": limit,
            "size": size,
            "aspect_ratio": aspect_ratio,
            "output_directory": output_directory,
            "silent_mode": True,
            "delay": 0
        }

        self.underlying = google_images_download.googleimagesdownload()

        self.max_size = max_size


    def download(self, keywords):

        try:

            search_args = {
                **self.parameters,
                "keywords": keywords
            }

            paths = list(self.underlying.download(search_args)[0].values())[0]

            if self.max_size:

                for path in paths:

                    print("[Downloader] Resizing '{}' to {}".format(os.path.relpath(path), self.max_size))

                    image = Image.open(path)

                    image.thumbnail(self.max_size, Image.ANTIALIAS)

                    image.save(path)

            return paths

        except FileNotFoundError:

            pass

