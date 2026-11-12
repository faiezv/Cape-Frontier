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

   Everything is matched case-insensitively (folder names, file
   names, extensions), so "ItineraryPhotos", "itineraryPhotos" and
   "itineraryphotos" all work. Spelling must still match exactly.
   .webp, .png, .jpg and .jpeg are all accepted.
============================================================ */

// Change this one value if you name the folder differently.
// Case does not matter, it is always lowercased before matching.
export const ITINERARY_PHOTOS_FOLDER = "ItineraryPhotos";

const PHOTOS_FOLDER_LC = ITINERARY_PHOTOS_FOLDER.toLowerCase();

const ROOT = "/src/assets/images/tours";
const EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

const tourImageAssets = import.meta.glob(
  "/src/assets/images/tours/**/*.{webp,png,jpg,jpeg,WEBP,PNG,JPG,JPEG}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

/* Every key lowercased once, so lookups are case-insensitive */
const assetsByPath = Object.fromEntries(
  Object.entries(tourImageAssets).map(([path, url]) => [
    path.toLowerCase(),
    url,
  ]),
);

/* ------------------------------------------------------------
   Is this glob key an itinerary photo?
   Used by the route-stop matcher to exclude them.
------------------------------------------------------------ */
export const isItineraryPhotoPath = (path = "") =>
  path.toLowerCase().includes(`/${PHOTOS_FOLDER_LC}/`);


const assetKeys = Object.keys(assetsByPath);

export const getItineraryPhoto = (imageFolder, dayNumber, name) => {
  if (!imageFolder || dayNumber == null || name == null) return null;

  const slug = String(imageFolder)
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase()
    .split("/")
    .pop(); // "5-day-garden-route-gondwana-big-5-safari"

  const file = String(name).toLowerCase();

  for (const ext of EXTENSIONS) {
    const tail = `/${slug}/${PHOTOS_FOLDER_LC}/d${dayNumber}/${file}.${ext}`;
    const hit = assetKeys.find((key) => key.endsWith(tail));

    if (hit) return assetsByPath[hit];
  }

  return null;
};

/* ------------------------------------------------------------
   DEV HELP: logs what the glob actually found for a tour, so a
   wrong folder name or file layout is obvious in the console.

   Usage (temporary, e.g. at the top of TourItinerary):
     debugItineraryPhotos(imageFolder);
------------------------------------------------------------ */
export const debugItineraryPhotos = (imageFolder) => {
  if (!import.meta.env?.DEV) return;

  const folder = String(imageFolder || "")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();

  const prefix = `${ROOT}/${folder}/${PHOTOS_FOLDER_LC}/`;
  const found = Object.keys(assetsByPath).filter((key) =>
    key.startsWith(prefix),
  );

  // eslint-disable-next-line no-console
  console.log(
    `[ItineraryPhotos] looking in: ${prefix}\nfound ${found.length} file(s):`,
    found,
  );
};

/* ============================================================
   ACCOMMODATION PHOTOS

   src/assets/images/accomodation/gondwana-game-reserve.webp

   getAccommodationPhoto("Gondwana Game Reserve")
   -> URL of .../accomodation/gondwana-game-reserve.webp
============================================================ */
const accommodationAssets = import.meta.glob(
  "/src/assets/images/accomodation/*.{webp,png,jpg,jpeg}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const accommodationBySlug = Object.fromEntries(
  Object.entries(accommodationAssets).map(([path, url]) => {
    const file = path.split("/").pop() || "";
    return [slugify(file.replace(/\.[^.]+$/, "")), url];
  }),
);

export const getAccommodationPhoto = (title) => {
  if (!title) return null;

  return accommodationBySlug[slugify(title)] || null;
};