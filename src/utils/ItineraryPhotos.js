/* ============================================================
   ITINERARY PHOTOS (folder convention)

   Put one photo per activity, named by the activity's position
   in the day (1 = first activity, 2 = second, ...):

   src/assets/images/tours/<tour.imageFolder>/ItineraryPhotos/d1/1.webp
   src/assets/images/tours/<tour.imageFolder>/ItineraryPhotos/d1/2.webp
   src/assets/images/tours/<tour.imageFolder>/ItineraryPhotos/d2/1.webp
   ...

   Optional: d1/stay.webp is used as the accommodation photo for
   that day when accommodation.image is not set.

   Lookups are case-insensitive, and .webp, .png, .jpg and .jpeg
   are all accepted.
============================================================ */

// Change this one value if you name the folder differently
// (lowercase, e.g. "iteniaryphotos").
export const ITINERARY_PHOTOS_FOLDER = "itineraryPhotos";

const ROOT = "/src/assets/images/tours";
const EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

const tourImageAssets = import.meta.glob(
  "/src/assets/images/tours/**/*.{webp,png,jpg,jpeg}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const assetsByPath = Object.fromEntries(
  Object.entries(tourImageAssets).map(([path, url]) => [
    path.toLowerCase(),
    url,
  ]),
);

export const isItineraryPhotoPath = (path = "") =>
  path.toLowerCase().includes(`/${ITINERARY_PHOTOS_FOLDER}/`);

/*
  getItineraryPhoto("packages/west-coast", 2, 3)
  -> URL of .../packages/west-coast/ItineraryPhotos/d2/3.webp, or null
*/
export const getItineraryPhoto = (imageFolder, dayNumber, name) => {
  if (!imageFolder || dayNumber == null || name == null) return null;

  const folder = String(imageFolder)
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  for (const ext of EXTENSIONS) {
    const url =
      assetsByPath[
        `${ROOT}/${folder}/${ITINERARY_PHOTOS_FOLDER}/d${dayNumber}/${name}.${ext}`
      ];

    if (url) return url;
  }

  return null;
};