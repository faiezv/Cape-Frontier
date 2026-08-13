export const TOUR_TYPES = {
  ADRENALINE: "adrenaline",
  HIKING: "hiking",
  PACKAGES: "packages",
  HISTORICAL: "historical",
  WINE_ROUTES: "wine-routes",
};

export const TOUR_MODIFIERS = {
  HALF_DAY: "half-day",
  FULL_DAY: "full-day",
  PRIVATE: "private",
  PACKAGE: "package",
  CUSTOM: "custom",
};

export const TOUR_CATEGORIES_ICON = {
  adrenaline: "/icons/adrenaline.svg",
  hiking: "/icons/hiking.svg",
  packages: "/icons/packages.svg",
  historical: "/icons/historical.svg",
  wineRoutes: "/icons/wine-routes.svg",
};

export const SUPPORTED_CURRENCIES = ["ZAR", "USD", "EUR", "GBP"];

export const FX_RATES = {
  ZAR: 1,
  USD: 0.054,
  EUR: 0.05,
  GBP: 0.043,
};

export const DEFAULT_PICKUP_OPTIONS = [
  "Cape Town CBD",
  "Sea Point",
  "Camps Bay",
  "V&A Waterfront",
  "Custom pickup on request",
];

export const CTA_LABELS = {
  preview: "Preview Tour",
  fullDetails: "See Full Itinerary & Booking",
  requestTrip: "Request Trip",
  bookingForm: "Complete Trip Request",
};


const normalizeImageIndexes = (imageIndexes = 3) => {
  if (Array.isArray(imageIndexes)) return imageIndexes;

  return Array.from({ length: imageIndexes }, (_, index) => index + 1);
};


const getTourImages = (folder, imageIndexes = 3) =>
  normalizeImageIndexes(imageIndexes).map(
    (imageNumber) => `/images/tours/${folder}/${imageNumber}.webp`
  );

const PICKUP_IMAGES = getTourImages("shared/pickup", 3);
const getCoverImage = (folder) => `/images/tours/${folder}/1.webp`;


const getDestinationImages = (baseFolder, destinationFolder, imageIndexes = 3) =>
  getTourImages(`${baseFolder}/${destinationFolder}`, imageIndexes);

const packageGallery = (baseFolder, stopFolders, imageIndexes = 3) =>
  stopFolders.flatMap((folder) =>
    getDestinationImages(baseFolder, folder, imageIndexes)
  );

const packageDestinationGalleries = (baseFolder, stopFolders, imageIndexes = 3) =>
  stopFolders.map((folder) => ({
    folder,
    cover: getCoverImage(`${baseFolder}/${folder}`),
    images: getDestinationImages(baseFolder, folder, imageIndexes),
  }));

const getGoogleMapsSearchUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;

const mapLocation = ({ label, address, query }) => ({
  label,
  address,
  googleMapsUrl: getGoogleMapsSearchUrl(query || `${label}, ${address}`),
});

const defaultWorkflow = {
  hasDedicatedPage: true,
  detailsPreviewLimit: true,
  detailsPreviewSections: ["description", "highlights", "images", "included"],
  fullPageSections: [
    "hero",
    "gallery",
    "description",
    "highlights",
    "included",
    "pickupOptions",
    "fullItinerary",
    "groupDiscount",
    "needToKnow",
    "reviews",
    "bookingForm",
    "faq",
  ],
  bookingFormPlacement: "bottom",
};

const ADRENALINE_BASE = "adrenaline";
const PENINSULA_PACKAGE_ONE_BASE = "packages/peninsula-tour-1";
const PENINSULA_PACKAGE_TWO_BASE = "packages/peninsula-tour-2";
const STELLENBOSCH_WINE_BASE = "packages/stellenbosch-wine-farms";
const CITY_TOUR_BASE = "packages/gun-range+city-tour";
const HIKING_BASE = "hiking";
const PENINSULA_1_DESTINATIONS = [
  "boulders-beach",
  "cape-point",
  "hout-bay",
  "maidens-cove",
  "muizenberg",
  "noordhoek",
  "ostrich-farm",
  "simons-town",
];

const PENINSULA_2_DESTINATIONS = [
  "boulders-beach",
  "camps-bay",
  "cape-point",
  "chapmans-peak",
  "sea-point",
  "simons-town",
];

const STELLENBOSCH_WINE_DESTINATIONS = [
  "delaire",
  "rust-en-vrede",
  "spier",
  "tokara",
];


export const getAllTourGalleryImages = (tour) => {
  if (!tour) return [];

  let destinationImages = [];

  if (Array.isArray(tour.destinationGalleries)) {
    destinationImages = tour.destinationGalleries.flatMap(
      (destination) => destination.images || []
    );
  } else if (
    tour.destinationGalleries &&
    typeof tour.destinationGalleries === "object"
  ) {
    destinationImages = Object.values(tour.destinationGalleries).flat();
  }

  return [
    tour.image,
    ...(tour.images || []),
    ...destinationImages,
    ...(tour.stops || [])
      .filter(
        (stop) => stop.id !== "pickup" && stop.id !== "return"
      )
      .flatMap((stop) => stop.images || []),
  ]
    .filter(Boolean)
    .filter((src, index, array) => array.indexOf(src) === index);
};

export const getTourBySlug = (slug) =>
  tours.find((tour) => tour.slug === slug || tour.canonicalPath === slug);

export const getToursByType = (type) =>
  tours.filter((tour) => tour.type === type);

export const getToursByCategory = (category) =>
  tours.filter((tour) => tour.category === category);


export const tours = [
  {
    id: 1,

  },
  {},

];


export default tours;













