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

const PENINSULA_1_BASE = "packages/peninsula-tour-1";
const PENINSULA_2_BASE = "packages/peninsula-tour-2";
const STELLENBOSCH_WINE_BASE = "packages/stellenbosch-wine-farms";

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

export const tours = [
  {
    id: 1,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Shark Cage Diving",
    slug: "shark-cage-diving",
    canonicalPath: "/tours/shark-cage-diving",

    seo: {
      title: "Shark Cage Diving from Cape Town | Cape Frontier Tours",
      description:
        "Book a guided shark cage diving experience near Gansbaai with pickup options, a safety briefing, ocean scenery, and a full Cape Frontier trip request flow.",
      keywords: [
        "shark cage diving Cape Town",
        "Gansbaai shark cage diving",
        "Cape Town ocean adventure",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/shark-cage-diving"),
    images: getTourImages("adrenaline/shark-cage-diving", 3),

    location: "Gansbaai, South Africa",
    duration: "4 - 5 hours",

    priceBase: 1200,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.7,
    stars: 4,
    mainReviewerName: "Olivia Red",
    mainReviewerCountry: "AU",
    reviewYear: 2025,
    otherReviews: 32,
    mainReview:
      "An exhilarating experience that combines safety and excitement. The expert instructors made me feel comfortable throughout.",

    description:
      "Embark on a thrilling half-day adventure from Cape Town to Gansbaai, the Great White Shark capital. Experience the ocean from a close-up perspective with expert crew, a clear safety briefing, and memorable coastal scenery.",

    highlights: [
      { text: "Close-up marine wildlife experience" },
      { text: "Guided by experienced safety crew" },
      { text: "Unforgettable ocean photography moments" },
    ],

    included: [
      { text: "Safety briefing and equipment" },
      { text: "Light refreshments" },
      { text: "Selected pickup options available" },
    ],

    excluded: [
      { text: "Personal swimwear and towels" },
      { text: "Professional photo or video package unless arranged" },
      { text: "Meals not specifically confirmed in the booking" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Pickup / Meeting Point",
        time: "06:30",
        duration: "30 min",
        note: "Selected Cape Town pickup areas or custom pickup by request",
        description:
          "Start the morning from your selected pickup area before travelling towards the Gansbaai coast.",
        exactLocation: mapLocation({
          label: "Cape Town CBD Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "gansbaai",
        name: "Gansbaai",
        time: "09:00",
        duration: "4 - 5 hours",
        note: "Main shark cage diving departure area",
        description:
          "Arrive at the coastal departure area for the safety briefing, equipment preparation, and ocean-based shark cage diving experience.",
        exactLocation: mapLocation({
          label: "Gansbaai Harbour Area",
          address: "Gansbaai, Western Cape, South Africa",
          query: "Gansbaai Harbour Western Cape",
        }),
        images: getTourImages("adrenaline/shark-cage-diving", 3),
        touristComments: [
          {
            name: "Olivia",
            country: "AU",
            text: "The crew made everything feel safe, clear, and exciting from the moment we arrived.",
          },
          {
            name: "Daniel",
            country: "UK",
            text: "The ocean views and guided setup made the day feel unforgettable.",
          },
        ],
      },
      {
        id: "return",
        name: "Return to Cape Town",
        time: "14:30",
        duration: "2 hours",
        note: "Return transfer after the activity",
        description:
          "After the experience, return towards Cape Town with drop-off at the selected area.",
        exactLocation: mapLocation({
          label: "Cape Town Drop-off Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
    ],

    groupDiscount: {
      enabled: true,
      icon: "/icons/savemore.png",
      rules: [
        { minPeople: 4, discountPercent: 10 },
        { minPeople: 8, discountPercent: 15 },
      ],
    },

    needToKnow: [
      { text: "Weather can affect departure times" },
      { text: "Bring warm clothing and a towel" },
      { text: "No diving experience required" },
      { text: "Final departure time is confirmed close to the date" },
    ],

    cancellationPolicy: {
      summary: "Weather-dependent activity. Final cancellation terms to be confirmed.",
      items: [
        { text: "Ocean conditions may affect timing or availability" },
        { text: "Rescheduling may be offered if conditions are unsuitable" },
        { text: "Refund rules must be confirmed with the operator" },
      ],
    },

    faqs: [
      {
        question: "Do I need diving experience?",
        answer: "No. The experience is guided and includes a safety briefing.",
      },
      {
        question: "Can the time change?",
        answer:
          "Yes. Ocean and weather conditions can affect the final departure time.",
      },
    ],

    tags: ["Adventure", "Wildlife", "Ocean", "Half Day"],
  },

  {
    id: 2,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Gun Range Experience",
    slug: "gun-range-experience",
    canonicalPath: "/tours/gun-range-experience",

    seo: {
      title: "Guided Range Experience in Cape Town | Cape Frontier Tours",
      description:
        "Request a professionally supervised Cape Town range experience with safety briefing, instructor support, and selected pickup options. Venue details are shared after confirmation.",
      keywords: [
        "Cape Town range experience",
        "guided range activity Cape Town",
        "adrenaline tours Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/gun-range"),
    images: getTourImages("adrenaline/gun-range", 3),

    location: "Cape Town, South Africa",
    duration: "2 - 3 hours",

    priceBase: 1450,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.8,
    stars: 5,
    mainReviewerName: "James Carter",
    mainReviewerCountry: "UK",
    reviewYear: 2025,
    otherReviews: 41,
    mainReview:
      "Very professional setup. The instructors explained everything clearly and made the experience feel safe and controlled.",

    description:
      "A controlled and professionally supervised range experience designed for eligible visitors, with instructor guidance, venue checks, and a full safety briefing.",

    highlights: [
      { text: "Professionally supervised activity" },
      { text: "Strict safety-controlled environment" },
      { text: "Instructor-led from start to finish" },
    ],

    included: [
      { text: "Safety briefing" },
      { text: "Guided range session" },
      { text: "Pickup available on request" },
    ],

    excluded: [
      { text: "Items not approved by the venue" },
      { text: "Personal expenses" },
      { text: "Extra activity upgrades unless confirmed" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Pickup / Meeting Point",
        time: "09:00",
        duration: "30 min",
        note: "Selected pickup area or confirmed meeting point",
        description:
          "Meet your guide or arrange selected pickup before travelling to the approved activity venue.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "activity-venue",
        name: "Approved Activity Venue",
        time: "10:00",
        duration: "2 - 3 hours",
        note: "Exact venue shared after confirmed booking and eligibility checks",
        description:
          "The guided activity takes place at an approved venue with professional supervision and strict safety controls.",
        exactLocation: {
          label: "Venue shared after confirmation",
          address: "Cape Town, South Africa",
          googleMapsUrl: null,
        },
        images: getTourImages("adrenaline/gun-range", 3),
        touristComments: [
          {
            name: "James",
            country: "UK",
            text: "The instructors were calm, professional, and clear about every safety step.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: true,
      icon: "/icons/savemore.png",
      rules: [
        { minPeople: 4, discountPercent: 8 },
        { minPeople: 6, discountPercent: 12 },
      ],
    },

    needToKnow: [
      { text: "Valid identification may be required" },
      { text: "All venue safety rules must be followed" },
      { text: "Eligibility and age rules may apply" },
      { text: "Exact venue details are shared after confirmation" },
    ],

    cancellationPolicy: {
      summary: "Eligibility, venue rules, and supplier availability apply.",
      items: [
        { text: "Late arrival may reduce activity time" },
        { text: "Participants must meet venue requirements" },
        { text: "Final cancellation rules must be confirmed with the supplier" },
      ],
    },

    faqs: [
      {
        question: "Is the venue shown publicly?",
        answer:
          "The exact approved venue is shared after booking confirmation and required checks.",
      },
      {
        question: "Are there safety rules?",
        answer:
          "Yes. All participants must follow the venue rules and instructor guidance throughout the activity.",
      },
    ],

    tags: ["Adrenaline", "Guided", "Controlled", "Half Day"],
  },

  {
    id: 3,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Paragliding",
    slug: "paragliding",
    canonicalPath: "/tours/paragliding",

    seo: {
      title: "Tandem Paragliding in Cape Town | Cape Frontier Tours",
      description:
        "Book a scenic tandem paragliding experience in Cape Town with views of Signal Hill, Lion’s Head, Sea Point, and the Atlantic coastline with expert pilots and selected pickup options.",
      keywords: [
        "paragliding Cape Town",
        "Signal Hill paragliding",
        "Cape Town tandem flight",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/paragliding"),
    images: getTourImages("adrenaline/paragliding", 3),

    location: "Signal Hill, Cape Town",
    duration: "1 - 2 hours",

    priceBase: 1800,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.9,
    stars: 5,
    mainReviewerName: "Mia Thompson",
    mainReviewerCountry: "US",
    reviewYear: 2025,
    otherReviews: 58,
    mainReview:
      "The views over Cape Town were unreal. The take-off felt smooth and the pilot made me feel completely at ease.",

    description:
      "Enjoy a scenic tandem paragliding experience above Cape Town with views of the Atlantic coastline, Table Mountain, Lion’s Head, and the city below. This activity is guided by experienced pilots and includes a safety briefing, with selected pickup options available.",

    highlights: [
      { text: "Launch near Signal Hill or Lion’s Head" },
      { text: "Beautiful aerial views of Cape Town" },
      { text: "Tandem flight with experienced pilot" },
    ],

    included: [
      { text: "Safety briefing" },
      { text: "Tandem paragliding flight" },
      { text: "Experienced pilot" },
    ],

    excluded: [
      { text: "Photos or videos unless arranged" },
      { text: "Transport unless selected" },
      { text: "Personal expenses" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Sea Point",
      "Camps Bay",
      "Meet at launch point",
      "Custom pickup on request",
    ],

    stops: [
      {
        id: "launch-point",
        name: "Signal Hill Launch Area",
        time: "Flexible",
        duration: "30 min briefing",
        note: "Common launch location depending on conditions",
        description:
          "Meet at the confirmed launch point for a weather check, safety briefing, and preparation with the tandem pilot.",
        exactLocation: mapLocation({
          label: "Signal Hill Viewpoint",
          address: "Signal Hill, Cape Town, South Africa",
          query: "Signal Hill Viewpoint Cape Town",
        }),
        images: getTourImages("adrenaline/paragliding", 2),
        touristComments: [
          {
            name: "Mia",
            country: "US",
            text: "Seeing the city from above was the best Cape Town memory of my trip.",
          },
        ],
      },
      {
        id: "landing-area",
        name: "Sea Point Landing Area",
        time: "After flight",
        duration: "15 min",
        note: "Common landing area depending on wind",
        description:
          "Land near the coast and enjoy the final views over Sea Point and the Atlantic edge.",
        exactLocation: mapLocation({
          label: "Sea Point Promenade",
          address: "Sea Point, Cape Town, South Africa",
          query: "Sea Point Promenade Cape Town",
        }),
        images: [],
        touristComments: [],
      },
    ],

    groupDiscount: {
      enabled: false,
      icon: "/icons/savemore.png",
      rules: [],
    },

    needToKnow: [
      { text: "Weather and wind dependent" },
      { text: "Wear comfortable clothes and closed shoes" },
      { text: "Flight time may vary by conditions" },
      { text: "Final launch point is confirmed on the day" },
    ],

    cancellationPolicy: {
      summary: "Wind and weather conditions can affect availability.",
      items: [
        { text: "Flight time may be adjusted for safe conditions" },
        { text: "Rescheduling may be offered if conditions are unsuitable" },
        { text: "Final supplier cancellation rules must be confirmed" },
      ],
    },

    faqs: [
      {
        question: "Is paragliding weather dependent?",
        answer:
          "Yes. Wind and weather conditions decide the final launch time and location.",
      },
      {
        question: "Where does the flight start?",
        answer:
          "Signal Hill is a common launch area, but the final launch point is confirmed according to conditions.",
      },
    ],

    tags: ["Adventure", "Scenic", "Air", "Half Day"],
  },

  {
    id: 4,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Snorkelling",
    slug: "snorkelling",
    canonicalPath: "/tours/snorkelling",

    seo: {
      title: "Guided Snorkelling in Cape Town | Cape Frontier Tours",
      description:
        "Request a guided Cape Town snorkelling experience with beginner-friendly support, coastal scenery, and selected pickup options.",
      keywords: [
        "snorkelling Cape Town",
        "guided snorkelling Cape Town",
        "Cape Town ocean tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/snorkelling"),
    images: getTourImages("adrenaline/snorkelling", 3),

    location: "Cape Town Coastline",
    duration: "2 - 3 hours",

    priceBase: 950,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.6,
    stars: 4,
    mainReviewerName: "Sophie Martin",
    mainReviewerCountry: "FR",
    reviewYear: 2025,
    otherReviews: 27,
    mainReview:
      "A calm but exciting ocean experience. The guide was patient and the water life was beautiful to see up close.",

    description:
      "Explore Cape Town’s coastal waters with a guided snorkelling experience. Ideal for ocean lovers who want a relaxed but memorable marine activity.",

    highlights: [
      { text: "Guided coastal snorkelling" },
      { text: "Marine life viewing" },
      { text: "Beginner-friendly guidance" },
    ],

    included: [
      { text: "Safety briefing" },
      { text: "Snorkelling equipment" },
      { text: "Guided ocean session" },
    ],

    excluded: [
      { text: "Swimwear and towel" },
      { text: "Transport unless selected" },
      { text: "Meals unless confirmed" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Sea Point",
      "Camps Bay",
      "Meet at activity point",
      "Custom pickup on request",
    ],

    stops: [
      {
        id: "coastline",
        name: "Cape Town Coastline",
        time: "Flexible",
        duration: "2 - 3 hours",
        note: "Final location depends on ocean conditions",
        description:
          "The guide selects a suitable coastal area according to weather, visibility, and ocean conditions.",
        exactLocation: mapLocation({
          label: "Cape Town Coastline",
          address: "Cape Town, South Africa",
          query: "Cape Town coastline snorkelling",
        }),
        images: getTourImages("adrenaline/snorkelling", 3),
        touristComments: [
          {
            name: "Sophie",
            country: "FR",
            text: "It was relaxed, beautiful, and beginner-friendly from start to finish.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: true,
      icon: "/icons/savemore.png",
      rules: [{ minPeople: 5, discountPercent: 10 }],
    },

    needToKnow: [
      { text: "Ocean conditions may affect availability" },
      { text: "Bring swimwear and a towel" },
      { text: "Basic swimming ability recommended" },
      { text: "Final location depends on visibility and conditions" },
    ],

    cancellationPolicy: {
      summary: "Ocean visibility and weather can affect the tour.",
      items: [
        { text: "Location may be adjusted based on conditions" },
        { text: "Unsafe ocean conditions may require rescheduling" },
        { text: "Final cancellation rules must be confirmed with the operator" },
      ],
    },

    faqs: [
      {
        question: "Is the snorkelling location fixed?",
        answer:
          "The final spot can change depending on ocean conditions and visibility.",
      },
      {
        question: "Do I need to be experienced?",
        answer:
          "No advanced experience is required, but basic swimming ability is recommended.",
      },
    ],

    tags: ["Ocean", "Wildlife", "Beginner Friendly", "Half Day"],
  },

  {
    id: 5,
    type: TOUR_TYPES.HIKING,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Lion’s Head Hike",
    slug: "lions-head-hike",
    canonicalPath: "/tours/lions-head-hike",

    seo: {
      title: "Lion’s Head Guided Hike in Cape Town | Cape Frontier Tours",
      description:
        "Book a guided Lion’s Head hike with scenic viewpoints, sunrise or sunset options, and local route guidance in Cape Town.",
      keywords: [
        "Lion's Head hike Cape Town",
        "guided hike Cape Town",
        "Cape Town hiking tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("hiking/lions-head"),
    images: getTourImages("hiking/lions-head", 3),

    location: "Lion’s Head, Cape Town",
    duration: "3 - 4 hours",

    priceBase: 850,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.8,
    stars: 5,
    mainReviewerName: "Daniel Green",
    mainReviewerCountry: "ZA",
    reviewYear: 2025,
    otherReviews: 46,
    mainReview:
      "The hike was perfectly paced and the guide knew all the best photo spots. The views were worth every step.",

    description:
      "A guided hike up one of Cape Town’s most iconic mountains. Lion’s Head offers panoramic views of the city, Table Mountain, Camps Bay, and the Atlantic Ocean.",

    highlights: [
      { text: "Iconic Cape Town hiking route" },
      { text: "Panoramic photo stops" },
      { text: "Sunrise or sunset options available" },
    ],

    included: [
      { text: "Guided hiking route" },
      { text: "Local hiking guide" },
      { text: "Water break stops" },
    ],

    excluded: [
      { text: "Personal hiking gear" },
      { text: "Meals unless confirmed" },
      { text: "Transport unless selected" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Sea Point",
      "Camps Bay",
      "Meet at Lion’s Head parking area",
      "Custom pickup on request",
    ],

    stops: [
      {
        id: "trail-start",
        name: "Lion’s Head Trail Start",
        time: "07:00",
        duration: "20 min",
        note: "Meet at the parking area and prepare for the route",
        description:
          "Meet your guide at the base area, confirm the route conditions, and begin the hike at a steady pace.",
        exactLocation: mapLocation({
          label: "Lion’s Head Hike Parking Area",
          address: "Signal Hill Road, Cape Town, South Africa",
          query: "Lion's Head Hike Parking Area Cape Town",
        }),
        images: getTourImages("hiking/lions-head", 1),
        touristComments: [],
      },
      {
        id: "summit-viewpoint",
        name: "Summit Viewpoint",
        time: "08:30",
        duration: "30 - 45 min",
        note: "Panoramic city and ocean views",
        description:
          "Reach the summit viewpoint for photos over Table Mountain, Camps Bay, the city bowl, and the Atlantic coastline.",
        exactLocation: mapLocation({
          label: "Lion’s Head Summit",
          address: "Lion’s Head, Cape Town, South Africa",
          query: "Lion's Head Summit Cape Town",
        }),
        images: getTourImages("hiking/lions-head", 3),
        touristComments: [
          {
            name: "Daniel",
            country: "ZA",
            text: "The guide kept the pace comfortable and knew exactly where to stop for photos.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: true,
      icon: "/icons/savemore.png",
      rules: [
        { minPeople: 4, discountPercent: 10 },
        { minPeople: 8, discountPercent: 15 },
      ],
    },

    needToKnow: [
      { text: "Wear comfortable hiking shoes" },
      { text: "Bring water" },
      { text: "Moderate fitness recommended" },
      { text: "Sunrise and sunset hikes depend on guide availability" },
    ],

    cancellationPolicy: {
      summary: "Mountain weather and route conditions can affect the hike.",
      items: [
        { text: "Unsafe weather may require rescheduling" },
        { text: "Late arrival may shorten the route" },
        { text: "Final cancellation rules must be confirmed with the guide" },
      ],
    },

    faqs: [
      {
        question: "Is Lion’s Head difficult?",
        answer:
          "It is a moderate hike. A reasonable fitness level and comfortable shoes are recommended.",
      },
      {
        question: "Can I request a sunrise or sunset hike?",
        answer:
          "Yes. Sunrise and sunset options can be requested depending on guide availability and conditions.",
      },
    ],

    tags: ["Hiking", "Scenic", "Mountain", "Half Day"],
  },

  {
    id: 6,
    type: TOUR_TYPES.HIKING,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Platteklip Gorge Hike",
    slug: "platteklip-gorge-hike",
    canonicalPath: "/tours/platteklip-gorge-hike",

    seo: {
      title: "Platteklip Gorge Guided Hike | Table Mountain Cape Town",
      description:
        "Request a guided Platteklip Gorge hike up Table Mountain with route support, scenic views, and mountain safety guidance.",
      keywords: [
        "Platteklip Gorge hike",
        "Table Mountain guided hike",
        "Cape Town hiking guide",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("hiking/platteklip"),
    images: getTourImages("hiking/platteklip", 3),

    location: "Table Mountain, Cape Town",
    duration: "4 - 5 hours",

    priceBase: 1100,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.7,
    stars: 4,
    mainReviewerName: "Emma Wilson",
    mainReviewerCountry: "CA",
    reviewYear: 2025,
    otherReviews: 35,
    mainReview:
      "A challenging but rewarding route. The guide kept the pace steady and the views at the top were incredible.",

    description:
      "A guided hike up Platteklip Gorge, one of the most direct routes to the top of Table Mountain. This route is steep, scenic, and rewarding for active travellers.",

    highlights: [
      { text: "Classic Table Mountain hiking route" },
      { text: "Steep and rewarding climb" },
      { text: "Views over Cape Town from the top" },
    ],

    included: [
      { text: "Guided route" },
      { text: "Experienced hiking guide" },
      { text: "Safety guidance along the trail" },
    ],

    excluded: [
      { text: "Cable car ticket if used" },
      { text: "Personal hiking gear" },
      { text: "Meals unless confirmed" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Sea Point",
      "Camps Bay",
      "Meet at Platteklip Gorge start point",
      "Custom pickup on request",
    ],

    stops: [
      {
        id: "trail-start",
        name: "Platteklip Gorge Trail Start",
        time: "07:00",
        duration: "20 min",
        note: "Main hiking route start",
        description:
          "Meet at the Platteklip Gorge start point, confirm conditions, and begin the direct ascent up Table Mountain.",
        exactLocation: mapLocation({
          label: "Platteklip Gorge Trail Start",
          address: "Table Mountain, Cape Town, South Africa",
          query: "Platteklip Gorge Trail Start Cape Town",
        }),
        images: getTourImages("hiking/platteklip", 1),
        touristComments: [],
      },
      {
        id: "summit",
        name: "Table Mountain Summit",
        time: "09:30",
        duration: "30 - 45 min",
        note: "Top viewpoint, weather permitting",
        description:
          "Arrive near the summit area and take in views over Cape Town, the mountain range, and the Atlantic coastline.",
        exactLocation: mapLocation({
          label: "Table Mountain Summit",
          address: "Table Mountain, Cape Town, South Africa",
          query: "Table Mountain Summit Cape Town",
        }),
        images: getTourImages("hiking/platteklip", 3),
        touristComments: [
          {
            name: "Emma",
            country: "CA",
            text: "The climb was tough, but the guide made the route feel manageable and safe.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: true,
      icon: "/icons/savemore.png",
      rules: [{ minPeople: 4, discountPercent: 10 }],
    },

    needToKnow: [
      { text: "Good fitness recommended" },
      { text: "Wear proper hiking shoes" },
      { text: "Weather can change quickly on the mountain" },
      { text: "Cable car use must be confirmed separately" },
    ],

    cancellationPolicy: {
      summary: "Mountain weather and cableway availability may affect the plan.",
      items: [
        { text: "Route may be adjusted for safety" },
        { text: "Cable car use is subject to availability if selected" },
        { text: "Final cancellation rules must be confirmed with the guide" },
      ],
    },

    faqs: [
      {
        question: "Is Platteklip Gorge harder than Lion’s Head?",
        answer:
          "Yes. Platteklip Gorge is steeper and more physically demanding than Lion’s Head.",
      },
      {
        question: "Can weather affect the route?",
        answer:
          "Yes. Mountain weather can change quickly, so the guide may adjust timing or plans for safety.",
      },
    ],

    tags: ["Hiking", "Table Mountain", "Scenic", "Active"],
  },

  {
    id: 7,
    type: TOUR_TYPES.HISTORICAL,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Langa Township Tour",
    slug: "langa-township-tour",
    canonicalPath: "/tours/langa-township-tour",

    seo: {
      title: "Langa Township Tour | Cape Town Cultural Experience",
      description:
        "Request a guided Langa Township tour focused on Cape Town history, culture, community context, and respectful local insight.",
      keywords: [
        "Langa township tour",
        "Cape Town cultural tour",
        "Cape Town historical township tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/langa"),
    images: getTourImages("historical/langa", 3),

    location: "Langa, Cape Town",
    duration: "3 - 4 hours",

    priceBase: 950,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.7,
    stars: 4,
    mainReviewerName: "Amina Clarke",
    mainReviewerCountry: "UK",
    reviewYear: 2025,
    otherReviews: 29,
    mainReview:
      "A meaningful and insightful experience. The guide gave context with care and respect.",

    description:
      "A guided cultural and historical tour through Langa, one of Cape Town’s oldest townships, focused on local stories, community context, and respectful cultural insight.",

    highlights: [
      { text: "Guided cultural experience" },
      { text: "Local history and community context" },
      { text: "Respectful township visit" },
    ],

    included: [
      { text: "Local guide" },
      { text: "Guided route" },
      { text: "Selected pickup options available" },
    ],

    excluded: [
      { text: "Meals unless arranged" },
      { text: "Personal purchases" },
      { text: "Community donations unless voluntarily offered" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Pickup / Meeting Point",
        time: "09:00",
        duration: "30 min",
        note: "Selected pickup area or meeting point",
        description:
          "Start with pickup or meet your guide before travelling to Langa for the cultural route.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "langa",
        name: "Langa",
        time: "10:00",
        duration: "2 - 3 hours",
        note: "Cultural and historical guided route",
        description:
          "Explore Langa with a guide who provides context around local history, community life, and the area’s significance in Cape Town.",
        exactLocation: mapLocation({
          label: "Langa",
          address: "Langa, Cape Town, South Africa",
          query: "Langa Cape Town",
        }),
        images: getTourImages("historical/langa", 3),
        touristComments: [
          {
            name: "Amina",
            country: "UK",
            text: "The guide shared stories with care and gave us a deeper understanding of Cape Town.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: true,
      icon: "/icons/savemore.png",
      rules: [{ minPeople: 4, discountPercent: 10 }],
    },

    needToKnow: [
      { text: "Respectful photography rules may apply" },
      { text: "Route may adjust according to local availability" },
      { text: "Comfortable walking shoes recommended" },
      { text: "Ask the guide before photographing people or private spaces" },
    ],

    cancellationPolicy: {
      summary: "Community route and local availability may affect the final plan.",
      items: [
        { text: "Route may change depending on local conditions" },
        { text: "Late arrival may reduce route time" },
        { text: "Final cancellation rules must be confirmed with the guide" },
      ],
    },

    faqs: [
      {
        question: "Is this a guided tour?",
        answer:
          "Yes. The experience should be guided to provide proper cultural and historical context.",
      },
      {
        question: "Can I take photos?",
        answer:
          "Photography rules should be confirmed with the guide, especially around people and private spaces.",
      },
    ],

    tags: ["Historical", "Culture", "Community", "Half Day"],
  },

  {
    id: 8,
    type: TOUR_TYPES.HISTORICAL,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Robben Island Tour",
    slug: "robben-island-tour",
    canonicalPath: "/tours/robben-island-tour",

    seo: {
      title: "Robben Island Tour | Cape Town Historical Experience",
      description:
        "Request a Robben Island historical tour with ferry planning, museum context, pickup options, and Cape Frontier trip support.",
      keywords: [
        "Robben Island tour",
        "Cape Town historical tour",
        "Robben Island ferry tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/robben-island"),
    images: getTourImages("historical/robben-island", 3),

    location: "Robben Island, Cape Town",
    duration: "Half Day",

    priceBase: 1200,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.8,
    stars: 5,
    mainReviewerName: "Thomas Reed",
    mainReviewerCountry: "US",
    reviewYear: 2025,
    otherReviews: 52,
    mainReview:
      "Powerful, emotional and educational. A must-do historical experience in Cape Town.",

    description:
      "A historical tour focused on Robben Island, its prison history, South Africa’s struggle history, and its significance as one of Cape Town’s most important heritage experiences.",

    highlights: [
      { text: "Important South African heritage site" },
      { text: "Museum and prison history" },
      { text: "Ferry-based island experience" },
    ],

    included: [
      { text: "Trip planning support" },
      { text: "Selected pickup options available" },
      { text: "Guided historical experience" },
    ],

    excluded: [
      { text: "Ferry ticket unless confirmed" },
      { text: "Meals and personal expenses" },
      { text: "Optional extras not listed in the booking" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Sea Point",
      "Camps Bay",
      "V&A Waterfront",
      "Meet at ferry departure point",
      "Custom pickup on request",
    ],

    stops: [
      {
        id: "waterfront",
        name: "V&A Waterfront Ferry Area",
        time: "Flexible",
        duration: "30 min",
        note: "Ferry departure point",
        description:
          "Meet near the ferry departure area or arrange pickup before the Robben Island experience.",
        exactLocation: mapLocation({
          label: "Nelson Mandela Gateway",
          address: "V&A Waterfront, Cape Town, South Africa",
          query: "Nelson Mandela Gateway V&A Waterfront Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "robben-island",
        name: "Robben Island",
        time: "Ferry dependent",
        duration: "3 - 4 hours",
        note: "Museum and historical island experience",
        description:
          "Visit Robben Island for a powerful historical experience focused on South African heritage and the island’s prison history.",
        exactLocation: mapLocation({
          label: "Robben Island",
          address: "Robben Island, Cape Town, South Africa",
          query: "Robben Island Cape Town",
        }),
        images: getTourImages("historical/robben-island", 3),
        touristComments: [
          {
            name: "Thomas",
            country: "US",
            text: "It was emotional, educational, and one of the most important parts of our Cape Town visit.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: false,
      icon: "/icons/savemore.png",
      rules: [],
    },

    needToKnow: [
      { text: "Ferry schedule and weather may affect availability" },
      { text: "Advance booking is recommended" },
      { text: "Ticket inclusion must be confirmed with the client" },
      { text: "Bring identification if required for booking" },
    ],

    cancellationPolicy: {
      summary: "Ferry schedules and weather can affect the tour.",
      items: [
        { text: "Ferry cancellation may require rescheduling" },
        { text: "Advance booking is strongly recommended" },
        { text: "Ticket refund rules depend on the supplier" },
      ],
    },

    faqs: [
      {
        question: "Is the ferry ticket included?",
        answer:
          "This must be confirmed with the client/operator before final publishing.",
      },
      {
        question: "Can weather affect the tour?",
        answer:
          "Yes. Ferry-based tours can be affected by weather and sea conditions.",
      },
    ],

    tags: ["Historical", "Heritage", "Museum", "Half Day"],
  },

  {
    id: 9,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Cape Peninsula Tour",
    slug: "peninsula-tour-1",
    canonicalPath: "/tours/peninsula-tour-1",

    seo: {
      title: "Cape Peninsula Tour 1 | Full-Day Cape Town Package",
      description:
        "Explore Boulders Beach, Cape Point, Hout Bay, Maiden’s Cove, Muizenberg, Noordhoek, Ostrich Farm, and Simon’s Town on a full-day Cape Peninsula package.",
      keywords: [
        "Cape Peninsula tour",
        "Cape Point tour Cape Town",
        "Boulders Beach tour",
        "full day Cape Town tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage(`${PENINSULA_1_BASE}/cape-point`),
    images: packageGallery(PENINSULA_1_BASE, PENINSULA_1_DESTINATIONS, 3),
    destinationGalleries: packageDestinationGalleries(
      PENINSULA_1_BASE,
      PENINSULA_1_DESTINATIONS,
      3
    ),

    location: "Cape Peninsula, Cape Town",
    duration: "Full Day",

    priceBase: 5600,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.9,
    stars: 5,
    mainReviewerName: "Lucas Brown",
    mainReviewerCountry: "NZ",
    reviewYear: 2025,
    otherReviews: 77,
    mainReview:
      "A full day packed with beautiful stops. Everything was well timed and the guide made the route feel relaxed, not rushed.",

    description:
      "A scenic Cape Peninsula package tour covering beaches, viewpoints, coastal roads, wildlife stops, and iconic Cape Town landmarks. Ideal for travellers who want a full-day sightseeing route with multiple stops.",

    highlights: [
      { text: "Multiple Cape Peninsula stops" },
      { text: "Scenic photo opportunities" },
      { text: "Comfortable guided full-day route" },
    ],

    included: [
      { text: "Transport between stops" },
      { text: "Local guide" },
      { text: "Planned full-day route" },
    ],

    excluded: [
      { text: "Entrance fees unless confirmed" },
      { text: "Lunch unless arranged" },
      { text: "Optional activities such as boat trips unless selected" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Pickup / Meeting Point",
        time: "08:00",
        duration: "30 min",
        note: "Selected pickup areas available",
        description:
          "Start the day from your selected pickup point before heading along the Atlantic coastline.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: PICKUP_IMAGES,
        touristComments: [],
      },
      {
        id: "maidens-cove",
        name: "Maiden’s Cove",
        time: "08:45",
        duration: "20 min",
        note: "Photo stop with Camps Bay and mountain views",
        description:
          "A scenic opening stop with views across Camps Bay, the Atlantic Ocean, and the Twelve Apostles mountain range.",
        exactLocation: mapLocation({
          label: "Maiden’s Cove",
          address: "Victoria Road, Camps Bay, Cape Town",
          query: "Maiden's Cove Camps Bay Cape Town",
        }),
        images: getTourImages(`${PENINSULA_1_BASE}/maidens-cove`, 3),
        touristComments: [
          {
            name: "Lucas",
            country: "NZ",
            text: "The first viewpoint set the tone for the whole day. Great photos right away.",
          },
        ],
      },
      {
        id: "hout-bay",
        name: "Hout Bay",
        time: "09:30",
        duration: "45 min",
        note: "Harbour and coastal stop",
        description:
          "Visit the harbour area and enjoy the coastal atmosphere before continuing along the Peninsula route.",
        exactLocation: mapLocation({
          label: "Hout Bay Harbour",
          address: "Harbour Road, Hout Bay, Cape Town",
          query: "Hout Bay Harbour Cape Town",
        }),
        images: getTourImages(`${PENINSULA_1_BASE}/hout-bay`, 3),
        touristComments: [],
      },
      {
        id: "noordhoek",
        name: "Noordhoek",
        time: "10:30",
        duration: "25 min",
        note: "Scenic beach viewpoint",
        description:
          "Pause for wide coastal views and a relaxed scenic stop near Noordhoek’s long beach.",
        exactLocation: mapLocation({
          label: "Noordhoek Beach",
          address: "Noordhoek, Cape Town, South Africa",
          query: "Noordhoek Beach Cape Town",
        }),
        images: getTourImages(`${PENINSULA_1_BASE}/noordhoek`, 3),
        touristComments: [],
      },
      {
        id: "cape-point",
        name: "Cape Point",
        time: "11:30",
        duration: "1 hr 30 min",
        note: "Scenic nature reserve visit",
        description:
          "Explore the dramatic coastal landscape around Cape Point with cliffs, ocean views, and nature reserve scenery.",
        exactLocation: mapLocation({
          label: "Cape Point",
          address: "Cape Point, Cape Peninsula, South Africa",
          query: "Cape Point Cape Town",
        }),
        images: getTourImages(`${PENINSULA_1_BASE}/cape-point`, 3),
        touristComments: [
          {
            name: "Aisha",
            country: "SA",
            text: "Cape Point was the highlight. The views were huge and the pacing felt relaxed.",
          },
        ],
      },
      {
        id: "ostrich-farm",
        name: "Ostrich Farm",
        time: "13:30",
        duration: "35 min",
        note: "Optional attraction stop",
        description:
          "A light attraction stop near the Peninsula route, depending on timing and guest preference.",
        exactLocation: mapLocation({
          label: "Cape Point Ostrich Farm",
          address: "Cape Point Road, Cape Peninsula, South Africa",
          query: "Cape Point Ostrich Farm",
        }),
        images: getTourImages(`${PENINSULA_1_BASE}/ostrich-farm`, 3),
        touristComments: [],
      },
      {
        id: "boulders-beach",
        name: "Boulders Beach",
        time: "14:30",
        duration: "45 min",
        note: "Penguin viewing stop",
        description:
          "Visit the famous penguin-viewing area and enjoy one of Cape Town’s most loved coastal wildlife stops.",
        exactLocation: mapLocation({
          label: "Boulders Beach Penguin Colony",
          address: "Kleintuin Road, Simon’s Town, Cape Town",
          query: "Boulders Beach Penguin Colony Cape Town",
        }),
        images: getTourImages(`${PENINSULA_1_BASE}/boulders-beach`, 3),
        touristComments: [
          {
            name: "Grace",
            country: "US",
            text: "The penguins were even better in person. Such a fun stop.",
          },
        ],
      },
      {
        id: "simons-town",
        name: "Simon’s Town",
        time: "15:30",
        duration: "30 min",
        note: "Historical naval town",
        description:
          "Move through Simon’s Town for coastal views, historical charm, and a relaxed town atmosphere.",
        exactLocation: mapLocation({
          label: "Simon’s Town",
          address: "Simon’s Town, Cape Town, South Africa",
          query: "Simon's Town Cape Town",
        }),
        images: getTourImages(`${PENINSULA_1_BASE}/simons-town`, 3),
        touristComments: [],
      },
      {
        id: "muizenberg",
        name: "Muizenberg",
        time: "16:30",
        duration: "25 min",
        note: "Colourful beach huts and coastline",
        description:
          "End the main route with Muizenberg’s colourful beach huts and False Bay coastline before returning to Cape Town.",
        exactLocation: mapLocation({
          label: "Muizenberg Beach Huts",
          address: "Muizenberg Beach, Cape Town, South Africa",
          query: "Muizenberg Beach Huts Cape Town",
        }),
        images: getTourImages(`${PENINSULA_1_BASE}/muizenberg`, 3),
        touristComments: [],
      },
    ],

    groupDiscount: {
      enabled: true,
      icon: "/icons/savemore.png",
      rules: [
        { minPeople: 4, discountPercent: 10 },
        { minPeople: 7, discountPercent: 15 },
      ],
    },

    needToKnow: [
      { text: "Start early to cover all major stops" },
      { text: "Some entrance fees may be separate" },
      { text: "Route may adjust due to weather or traffic" },
      { text: "Package galleries now pull multiple images per destination folder" },
    ],

    cancellationPolicy: {
      summary: "Route order can change due to timing, traffic, and weather.",
      items: [
        { text: "Some stops may be shortened if traffic delays occur" },
        { text: "Entrance fees must be confirmed before final publishing" },
        { text: "Final cancellation rules must be confirmed with the client" },
      ],
    },

    faqs: [
      {
        question: "Is this a full-day tour?",
        answer:
          "Yes. This package is planned as a full-day route with multiple scenic stops.",
      },
      {
        question: "Are entrance fees included?",
        answer:
          "Some entrance fees may be separate depending on the final route and selected attractions.",
      },
    ],

    tags: ["Package", "Full Day", "Scenic", "Cape Peninsula"],
  },

  {
    id: 10,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Mother City Tour",
    slug: "peninsula-tour-2",
    canonicalPath: "/tours/peninsula-tour-2",

    seo: {
      title: "Cape Peninsula Tour 2 | Premium Full-Day Cape Town Route",
      description:
        "A premium Cape Peninsula route featuring Sea Point, Camps Bay, Chapman’s Peak, Cape Point, Boulders Beach, and Simon’s Town.",
      keywords: [
        "premium Cape Peninsula tour",
        "Chapman's Peak tour",
        "Cape Point full day tour",
        "Cape Town coastal tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage(`${PENINSULA_2_BASE}/chapmans-peak`),
    images: packageGallery(PENINSULA_2_BASE, PENINSULA_2_DESTINATIONS, 3),
    destinationGalleries: packageDestinationGalleries(
      PENINSULA_2_BASE,
      PENINSULA_2_DESTINATIONS,
      3
    ),

    location: "Cape Peninsula, Cape Town",
    duration: "Full Day",

    priceBase: 3200,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.9,
    stars: 5,
    mainReviewerName: "Grace Miller",
    mainReviewerCountry: "US",
    reviewYear: 2025,
    otherReviews: 82,
    mainReview:
      "This was the highlight of our Cape Town trip. The route had beaches, penguins, mountains and amazing views.",

    description:
      "A premium Cape Peninsula sightseeing route featuring some of Cape Town’s best coastal, mountain, beach, and wildlife stops. A strong choice for first-time visitors.",

    highlights: [
      { text: "Coastal and mountain views" },
      { text: "High-value photo stops" },
      { text: "Beaches, penguins, and scenic drives" },
    ],

    included: [
      { text: "Transport between locations" },
      { text: "Local guide" },
      { text: "Curated full-day itinerary" },
    ],

    excluded: [
      { text: "Entrance fees unless confirmed" },
      { text: "Lunch unless arranged" },
      { text: "Optional experiences not listed in booking" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "sea-point",
        name: "Sea Point",
        time: "08:30",
        duration: "20 min",
        note: "Promenade and coastal drive",
        description:
          "Begin along the Atlantic coastline with Sea Point views and an easy coastal drive.",
        exactLocation: mapLocation({
          label: "Sea Point Promenade",
          address: "Sea Point, Cape Town, South Africa",
          query: "Sea Point Promenade Cape Town",
        }),
        images: getTourImages(`${PENINSULA_2_BASE}/sea-point`, 3),
        touristComments: [],
      },
      {
        id: "camps-bay",
        name: "Camps Bay",
        time: "09:00",
        duration: "25 min",
        note: "Beachfront scenic stop",
        description:
          "Stop near the Camps Bay beachfront for ocean views, mountain backdrops, and photos.",
        exactLocation: mapLocation({
          label: "Camps Bay Beach",
          address: "Camps Bay, Cape Town, South Africa",
          query: "Camps Bay Beach Cape Town",
        }),
        images: getTourImages(`${PENINSULA_2_BASE}/camps-bay`, 3),
        touristComments: [],
      },
      {
        id: "chapmans-peak",
        name: "Chapman’s Peak",
        time: "10:00",
        duration: "35 min",
        note: "Iconic scenic drive",
        description:
          "Travel along one of Cape Town’s most famous coastal roads with cliffside views over the Atlantic.",
        exactLocation: mapLocation({
          label: "Chapman’s Peak Drive",
          address: "Hout Bay / Noordhoek, Cape Town, South Africa",
          query: "Chapman's Peak Drive Cape Town",
        }),
        images: getTourImages(`${PENINSULA_2_BASE}/chapmans-peak`, 3),
        touristComments: [
          {
            name: "Grace",
            country: "US",
            text: "Chapman’s Peak was absolutely unreal. Every turn had another view.",
          },
        ],
      },
      {
        id: "cape-point",
        name: "Cape Point",
        time: "11:30",
        duration: "1 hr 30 min",
        note: "Nature reserve and coastal views",
        description:
          "Explore Cape Point’s dramatic cliffs, ocean views, and nature reserve scenery.",
        exactLocation: mapLocation({
          label: "Cape Point",
          address: "Cape Point, Cape Peninsula, South Africa",
          query: "Cape Point Cape Town",
        }),
        images: getTourImages(`${PENINSULA_2_BASE}/cape-point`, 3),
        touristComments: [],
      },
      {
        id: "boulders-beach",
        name: "Boulders Beach",
        time: "14:00",
        duration: "45 min",
        note: "Penguin viewing stop",
        description: "Visit the famous penguin-viewing area near Simon’s Town.",
        exactLocation: mapLocation({
          label: "Boulders Beach Penguin Colony",
          address: "Kleintuin Road, Simon’s Town, Cape Town",
          query: "Boulders Beach Penguin Colony Cape Town",
        }),
        images: getTourImages(`${PENINSULA_2_BASE}/boulders-beach`, 3),
        touristComments: [
          {
            name: "Noah",
            country: "DE",
            text: "The penguin stop made the tour feel extra special.",
          },
        ],
      },
      {
        id: "simons-town",
        name: "Simon’s Town",
        time: "15:00",
        duration: "25 min",
        note: "Historical coastal town",
        description:
          "Move through Simon’s Town for naval history, coastal charm, and relaxed town scenery.",
        exactLocation: mapLocation({
          label: "Simon’s Town",
          address: "Simon’s Town, Cape Town, South Africa",
          query: "Simon's Town Cape Town",
        }),
        images: getTourImages(`${PENINSULA_2_BASE}/simons-town`, 3),
        touristComments: [],
      },
    ],

    groupDiscount: {
      enabled: true,
      icon: "/icons/savemore.png",
      rules: [
        { minPeople: 4, discountPercent: 10 },
        { minPeople: 7, discountPercent: 15 },
      ],
    },

    needToKnow: [
      { text: "Some entrance fees may be separate" },
      { text: "Full-day availability required" },
      { text: "Route may adjust due to weather or traffic" },
      { text: "Package galleries now pull multiple images per destination folder" },
    ],

    cancellationPolicy: {
      summary: "Route order can change due to timing, traffic, and weather.",
      items: [
        { text: "Chapman’s Peak access may depend on road conditions" },
        { text: "Entrance fees must be confirmed before final publishing" },
        { text: "Final cancellation rules must be confirmed with the client" },
      ],
    },

    faqs: [
      {
        question: "What makes this route premium?",
        answer:
          "It combines coastal drives, Cape Point, penguin viewing, beaches, and scenic viewpoints into one full-day route.",
      },
      {
        question: "Can the route change?",
        answer:
          "Yes. The final route can adjust based on weather, traffic, guest preference, and attraction availability.",
      },
    ],

    tags: ["Package", "Full Day", "Premium Route", "Cape Peninsula"],
  },

  {
    id: 11,
    type: TOUR_TYPES.WINE_ROUTES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Stellenbosch Wine Farms",
    slug: "stellenbosch-wine-farms",
    canonicalPath: "/tours/stellenbosch-wine-farms",

    seo: {
      title: "Stellenbosch Wine Farms Tour | Cape Frontier Tours",
      description:
        "Request a full-day Stellenbosch wine farms experience featuring Delaire Graff, Rust en Vrede, Spier, Tokara, scenic vineyard views, and selected pickup options.",
      keywords: [
        "Stellenbosch wine farms tour",
        "Cape Town wine tour",
        "Delaire Graff wine tour",
        "Rust en Vrede wine tour",
        "Spier wine farm tour",
        "Tokara wine estate tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage(`${STELLENBOSCH_WINE_BASE}/delaire`),
    images: packageGallery(
      STELLENBOSCH_WINE_BASE,
      STELLENBOSCH_WINE_DESTINATIONS,
      3
    ),
    destinationGalleries: packageDestinationGalleries(
      STELLENBOSCH_WINE_BASE,
      STELLENBOSCH_WINE_DESTINATIONS,
      3
    ),

    location: "Stellenbosch, South Africa",
    duration: "Full Day",

    priceBase: 2600,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    rating: 4.9,
    stars: 5,
    mainReviewerName: "Isabella Rossi",
    mainReviewerCountry: "IT",
    reviewYear: 2025,
    otherReviews: 64,
    mainReview:
      "Elegant, scenic and relaxed. The estates were beautiful and the whole day felt premium from start to finish.",

    description:
      "A scenic full-day Stellenbosch wine farms experience covering selected premium estates, vineyard views, relaxed tasting stops, and beautiful Cape Winelands scenery. This package currently includes Delaire Graff, Rust en Vrede, Spier, and Tokara as available wine farm stops.",

    highlights: [
      { text: "Curated Stellenbosch wine farm route" },
      { text: "Premium vineyard and mountain views" },
      { text: "Optional lunch or food pairing stops" },
    ],

    included: [
      { text: "Transport from selected pickup points" },
      { text: "Guided wine route assistance" },
      { text: "Curated estate stops" },
    ],

    excluded: [
      { text: "Wine tasting fees unless confirmed" },
      { text: "Lunch unless arranged" },
      { text: "Personal purchases from estates" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "delaire",
        name: "Delaire Graff",
        time: "10:00",
        duration: "1 - 2 hours",
        note: "Premium wine estate and scenic views",
        description:
          "A refined Stellenbosch estate stop with vineyard views, mountain scenery, and a premium wine farm atmosphere.",
        exactLocation: mapLocation({
          label: "Delaire Graff Estate",
          address: "Helshoogte Road, Stellenbosch, South Africa",
          query: "Delaire Graff Estate Stellenbosch",
        }),
        images: getTourImages(`${STELLENBOSCH_WINE_BASE}/delaire`, 3),
        touristComments: [
          {
            name: "Isabella",
            country: "IT",
            text: "The estate felt elegant and relaxed, with some of the best views of the day.",
          },
        ],
      },
      {
        id: "rust-en-vrede",
        name: "Rust en Vrede",
        time: "12:00",
        duration: "1 - 2 hours",
        note: "Relaxed estate atmosphere",
        description:
          "A calm Stellenbosch wine farm stop known for a peaceful setting and premium wine route feel.",
        exactLocation: mapLocation({
          label: "Rust en Vrede Wine Estate",
          address: "Annandale Road, Stellenbosch, South Africa",
          query: "Rust en Vrede Wine Estate Stellenbosch",
        }),
        images: getTourImages(`${STELLENBOSCH_WINE_BASE}/rust-en-vrede`, 3),
        touristComments: [
          {
            name: "Oliver",
            country: "UK",
            text: "Peaceful setting, excellent wines, and a very easygoing day.",
          },
        ],
      },
      {
        id: "spier",
        name: "Spier",
        time: "14:00",
        duration: "1 - 2 hours",
        note: "Relaxed wine farm and spacious estate setting",
        description:
          "A relaxed wine farm stop with open estate scenery, tasting options, and optional food or picnic-style experiences.",
        exactLocation: mapLocation({
          label: "Spier Wine Farm",
          address: "R310 Baden Powell Drive, Stellenbosch, South Africa",
          query: "Spier Wine Farm Stellenbosch",
        }),
        images: getTourImages(`${STELLENBOSCH_WINE_BASE}/spier`, 3),
        touristComments: [
          {
            name: "Chloe",
            country: "AU",
            text: "It was relaxed, spacious, and a great break from the city.",
          },
        ],
      },
      {
        id: "tokara",
        name: "Tokara",
        time: "15:30",
        duration: "1 - 2 hours",
        note: "Elevated views and refined estate atmosphere",
        description:
          "A scenic Stellenbosch estate stop with elevated views, refined surroundings, and a polished wine farm atmosphere.",
        exactLocation: mapLocation({
          label: "Tokara Wine Estate",
          address: "Helshoogte Road, Stellenbosch, South Africa",
          query: "Tokara Wine Estate Stellenbosch",
        }),
        images: getTourImages(`${STELLENBOSCH_WINE_BASE}/tokara`, 3),
        touristComments: [
          {
            name: "Liam",
            country: "IE",
            text: "The views were incredible and the whole estate felt polished without being too formal.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: true,
      icon: "/icons/savemore.png",
      rules: [
        { minPeople: 4, discountPercent: 10 },
        { minPeople: 8, discountPercent: 15 },
      ],
    },

    needToKnow: [
      { text: "Guests must be of legal drinking age" },
      { text: "Wine tasting fees may be separate unless confirmed" },
      { text: "Estate availability may affect the final route" },
      { text: "Lunch or food pairings should be requested in advance" },
    ],

    cancellationPolicy: {
      summary: "Estate availability and booking times can affect the route.",
      items: [
        { text: "Wine farm stops may change depending on availability" },
        { text: "Food bookings may require advance confirmation" },
        { text: "Final cancellation rules must be confirmed with the client" },
      ],
    },

    faqs: [
      {
        question: "Are the wine farms separate tours?",
        answer:
          "Based on the current structure, they are grouped as one Stellenbosch Wine Farms package.",
      },
      {
        question: "Are tasting fees included?",
        answer:
          "This must be confirmed with the client before final publishing.",
      },
      {
        question: "Can the route change?",
        answer:
          "Yes. The route can change depending on estate availability, bookings, weather, and guest preference.",
      },
    ],

    tags: ["Wine", "Stellenbosch", "Full Day", "Cape Winelands"],
  },
];

export const getAllTourGalleryImages = (tour) => {
  if (!tour) return [];

  return [
    tour.image,
    ...(tour.images || []),
    ...(tour.destinationGalleries || []).flatMap(
      (destination) => destination.images || []
    ),
    ...(tour.stops || []).flatMap((stop) => stop.images || []),
  ].filter(Boolean).filter((src, index, array) => array.indexOf(src) === index);
};

export const getTourBySlug = (slug) =>
  tours.find((tour) => tour.slug === slug || tour.canonicalPath === slug);

export const getToursByType = (type) =>
  tours.filter((tour) => tour.type === type);

export const getToursByCategory = (category) =>
  tours.filter((tour) => tour.category === category);

export default tours;