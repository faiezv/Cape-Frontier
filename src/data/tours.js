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

    priceBase: 4900,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 4900,
        note: "Minimum two participants."
      },
      {
        category: "Children under 12.",
        pricePerPerson: 2400,
        note: "",
      },
      {
        category: "Children under 5.",
        pricePerPerson: 0,
        note: "Free for children under 5 years old. Must be accompanied by an adult.",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 6,
          maxPeople: 10,
          perPeson: 4750,
          label: "6-10 Guests",
          note: "Private vehicle • All-inclusive",
        },
      ],
    },

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
      { text: "Close-up marine wildlife experience with Marine Dynamics." },
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
        duration: "35 min",
        note: "Selected Cape Town pickup areas or custom pickup by request",
        description:
          "Start the morning from your selected pickup area before travelling towards the Gansbaai coast.",
        exactLocation: mapLocation({
          label: "Cape Town CBD Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: getTourImages("shared/pickup", 1),
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
        question: "Who is Marine Dynamics?",
        answer: "Marine Dynamics is a reputable tour operator specializing in marine adventures and wildlife experiences.",
      },
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

    priceBase: 3000,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 3000,
      },
      {
        category: "Children",
        pricePerPerson: null,
        note: "Not suitable for children. Age and eligibility rules apply.",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 1,
          maxPeople: 2,
          perPerson: 3000, 
          label: "3-6 Guests",
          note: "Private vehicle • All-inclusive",
        },
        {
          minPeople: 3,
          maxPeople: 6,
          perPerson: 2900, 
          label: "3-6 Guests",
          note: "Private vehicle • All-inclusive",
        },
      ],
    },


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

    priceBase: 3400,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 3400,
      },
      {
        category: "Children",
        pricePerPerson: null,
        note: "This tour is not suitable for children under the age of 18. Age and eligibility rules apply.",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 2,
          perPerson: 3100,
          label: '', note: '',
        }
      ]
    },

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

  // {
  //   id: 4,
  //   type: TOUR_TYPES.ADRENALINE,
  //   category: TOUR_MODIFIERS.HALF_DAY,
  //
  //   title: "Snorkelling",
  //   slug: "snorkelling",
  //   canonicalPath: "/tours/snorkelling",
  //
  //   seo: {
  //     title: "Guided Snorkelling in Cape Town | Cape Frontier Tours",
  //     description:
  //       "Request a guided Cape Town snorkelling experience with beginner-friendly support, coastal scenery, and selected pickup options.",
  //     keywords: [
  //       "snorkelling Cape Town",
  //       "guided snorkelling Cape Town",
  //       "Cape Town ocean tour",
  //     ],
  //   },
  //
  //   workflow: defaultWorkflow,
  //
  //   image: getCoverImage("adrenaline/snorkelling"),
  //   images: getTourImages("adrenaline/snorkelling", 3),
  //
  //   location: "Cape Town Coastline",
  //   duration: "2 - 3 hours",
  //
  //   priceBase: 950,
  //   minPeople: 1,
  //   baseCurrency: "ZAR",
  //   supportedCurrencies: SUPPORTED_CURRENCIES,
  //
  //   pricing: [
  //     {
  //       category: "Adults",
  //       pricePerPerson: 3290,
  //     },
  //     {
  //       category: "Children",
  //       pricePerPerson: null,
  //     },
  //   ],
  //
  //   groupDiscount: {
  //     enabled: true,
  //     icon: "/icons/savemore.png",
  //     rules: [{ minPeople: 5, discountPercent: 10 }],
  //   },
  //
  //   rating: 4.6,
  //   stars: 4,
  //   mainReviewerName: "Sophie Martin",
  //   mainReviewerCountry: "FR",
  //   reviewYear: 2025,
  //   otherReviews: 27,
  //   mainReview:
  //     "A calm but exciting ocean experience. The guide was patient and the water life was beautiful to see up close.",
  //
  //   description:
  //     "Explore Cape Town’s coastal waters with a guided snorkelling experience. Ideal for ocean lovers who want a relaxed but memorable marine activity.",
  //
  //   highlights: [
  //     { text: "Guided coastal snorkelling" },
  //     { text: "Marine life viewing" },
  //     { text: "Beginner-friendly guidance" },
  //   ],
  //
  //   included: [
  //     { text: "Safety briefing" },
  //     { text: "Snorkelling equipment" },
  //     { text: "Guided ocean session" },
  //   ],
  //
  //   excluded: [
  //     { text: "Swimwear and towel" },
  //     { text: "Transport unless selected" },
  //     { text: "Meals unless confirmed" },
  //   ],
  //
  //   pickupOptions: [
  //     "Cape Town CBD",
  //     "Sea Point",
  //     "Camps Bay",
  //     "Meet at activity point",
  //     "Custom pickup on request",
  //   ],
  //
  //   stops: [
  //     {
  //       id: "coastline",
  //       name: "Cape Town Coastline",
  //       time: "Flexible",
  //       duration: "2 - 3 hours",
  //       note: "Final location depends on ocean conditions",
  //       description:
  //         "The guide selects a suitable coastal area according to weather, visibility, and ocean conditions.",
  //       exactLocation: mapLocation({
  //         label: "Cape Town Coastline",
  //         address: "Cape Town, South Africa",
  //         query: "Cape Town coastline snorkelling",
  //       }),
  //       images: getTourImages("adrenaline/snorkelling", 3),
  //       touristComments: [
  //         {
  //           name: "Sophie",
  //           country: "FR",
  //           text: "It was relaxed, beautiful, and beginner-friendly from start to finish.",
  //         },
  //       ],
  //     },
  //   ],
  //
  //
  //   needToKnow: [
  //     { text: "Ocean conditions may affect availability" },
  //     { text: "Bring swimwear and a towel" },
  //     { text: "Basic swimming ability recommended" },
  //     { text: "Final location depends on visibility and conditions" },
  //   ],
  //
  //   cancellationPolicy: {
  //     summary: "Ocean visibility and weather can affect the tour.",
  //     items: [
  //       { text: "Location may be adjusted based on conditions" },
  //       { text: "Unsafe ocean conditions may require rescheduling" },
  //       { text: "Final cancellation rules must be confirmed with the operator" },
  //     ],
  //   },
  //
  //   faqs: [
  //     {
  //       question: "Is the snorkelling location fixed?",
  //       answer:
  //         "The final spot can change depending on ocean conditions and visibility.",
  //     },
  //     {
  //       question: "Do I need to be experienced?",
  //       answer:
  //         "No advanced experience is required, but basic swimming ability is recommended.",
  //     },
  //   ],
  //
  //   tags: ["Ocean", "Wildlife", "Beginner Friendly", "Half Day"],
  // },

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

    priceBase: 1900,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 1900,
      },
      {
        category: "Children (5–17 years)",
        pricePerPerson: null,
        note: "No discounts for children. Age and eligibility rules apply.",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 4,
          perPerson: 0,  // no discount confirmed yet. 
          label: "4+ Guests",
          note: "Private vehicle • All-inclusive",
        },
      ],
    },

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
      { text: "Bottle water included." },
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

    priceBase: 1900,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 1900,
      },
      // {
      //   category: "Children",
      //   pricePerPerson: 0,
      // },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 4,
          perPerson: 0,  // no discount confirmed yet.
          label: "4+ Guests",
          note: "Private vehicle • All-inclusive",
        },
      ],
    },

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
      { text: "Headlamps for early sunrise walkers!" },
      { text: "Experienced hiking guide" },
      { text: "Safety guidance along the trail" },
    ],

    excluded: [
      // { text: "Cable car ticket if used" },
      { text: "Personal hiking gear" },
      { text: "Meals/snacks" },
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

    title: "Langa Township Cultural Experience",
    slug: "langa-township-cultural-experience",
    canonicalPath: "/tours/langa-township-cultural-experience",

    seo: {
      title: "Langa Township Cultural Experience | Cape Frontier Tours",
      description:
        "Experience Cape Town's oldest township with local community guides, cultural storytelling, Guga S'thebe, craft markets, hotel transfers, and authentic local experiences.",
      keywords: [
        "Langa Township Tour",
        "Langa Cultural Experience",
        "Cape Town Township Tour",
        "Langa Community Tour",
        "Cape Town Cultural Tour",
        "Guga S'thebe",
        "Township Experience Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/langa"),
    images: getTourImages("historical/langa", 3),

    location: "Langa, Cape Town, South Africa",
    duration: "3 - 4 Hours",

    basePrice: 1300,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 1300,
      },
      {
        category: "Children under 5", 
        pricePerPerson: 0, // no discount confirmed 
      },
    ],

    groupPricing: {
      enabled: false,
      icon: "/icons/savemore.png",
      tiers: [
        {
          // minPeople: 2,
          // maxPeople: 4,
          // totalPrice: 9560,
          // label: "2–4 Guests",
          // note: "Private vehicle • All-inclusive",
        },
      ],
    },

    rating: 4.9,
    stars: 5,
    mainReviewerName: "Amina Clarke",
    mainReviewerCountry: "UK",
    reviewYear: 2026,
    otherReviews: 46,
    mainReview:
      "An authentic and eye-opening experience. Our local guide shared incredible stories and made us feel truly welcome.",

    description:
      "Discover the heart of Cape Town's oldest township on an immersive cultural experience led by local community guides. Langa, established in 1927, played an important role in South Africa's history and remains a vibrant community rich in culture, resilience, music, art, and entrepreneurship. Visit local landmarks, meet residents, explore Guga S'thebe Arts & Culture Centre, and experience authentic township life through meaningful storytelling and genuine local connections.",




    highlights: [
      { text: "Cape Town's oldest township" },
      { text: "Local community guide" },
      { text: "Guga S'thebe Arts & Culture Centre" },
      { text: "Cultural walking tour" },
      { text: "Craft market visit" },
      { text: "Authentic local storytelling" },
    ],

    included: [
      { text: "Hotel pickup & drop-off" },
      { text: "Professional driver-guide" },
      { text: "Local Langa community guide" },
      { text: "Guga S'thebe visit" },
      { text: "Guided cultural walk" },
      { text: "Craft market stop" },
      { text: "Bottled water" },
      { text: "All entrance fees" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Personal purchases" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Green Point",
      "Sea Point",
    ],

    stops: [
      {
        id: "pickup",
        name: "Hotel Pickup",
        time: "Flexible",
        duration: "30 minutes",
        note: "Air-conditioned transfer",
        description:
          "Enjoy convenient hotel pickup from Cape Town CBD, Green Point, or Sea Point before travelling to Langa Township.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          query: "Cape Town",
        }),
        images: [],
        touristComments: [],
      },

      {
        id: "guga-sthebe",
        name: "Guga S'thebe Arts & Culture Centre",
        time: "09:30",
        duration: "45 minutes",
        note: "Community arts centre",
        description:
          "Visit one of Langa's best-known cultural landmarks, showcasing local artists, crafts, performances, and community initiatives.",
        exactLocation: mapLocation({
          label: "Guga S'thebe Arts & Culture Centre",
          query: "Guga Sthebe Langa",
        }),
        images: getTourImages("historical/langa", 3),
        touristComments: [
          {
            name: "David",
            country: "AU",
            text: "The artwork and community stories were inspiring.",
          },
        ],
      },

      {
        id: "langa-walk",
        name: "Langa Cultural Walk",
        time: "10:30",
        duration: "1.5 - 2 hours",
        note: "Guided community experience",
        description:
          "Walk through Langa with a local guide, learning about its history, daily life, community projects, and its important role during South Africa's anti-apartheid struggle.",
        exactLocation: mapLocation({
          label: "Langa Township",
          address: "Langa, Cape Town, South Africa",
          query: "Langa Township",
        }),
        images: getTourImages("historical/langa", 3),
        touristComments: [
          {
            name: "Amina",
            country: "UK",
            text: "A respectful and unforgettable experience that gave us genuine insight into the community.",
          },
        ],
      },

      {
        id: "craft-market",
        name: "Local Craft Market",
        time: "12:00",
        duration: "30 minutes",
        note: "Support local artisans",
        description:
          "Browse locally made arts and crafts while supporting small businesses and talented community artisans.",
        exactLocation: mapLocation({
          label: "Langa Craft Market",
          query: "Langa Craft Market",
        }),
        images: getTourImages("historical/langa", 3),
        touristComments: [
          {
            name: "Emma",
            country: "CA",
            text: "Beautiful handmade crafts and friendly local artists.",
          },
        ],
      },
    ],


    needToKnow: [
      { text: "Tours are conducted with experienced local community guides." },
      { text: "Langa is considered one of the safer townships when visited with local guides." },
      { text: "Please ask permission before photographing residents." },
      { text: "Comfortable walking shoes are recommended." },
      { text: "Respectful behaviour towards the local community is expected." },
    ],

    cancellationPolicy: {
      summary:
        "Tour routes may vary depending on community events and local conditions.",
      items: [
        { text: "Private bookings require advance confirmation." },
        { text: "Route adjustments may occur when necessary." },
        { text: "Final cancellation policy is confirmed upon booking." },
      ],
    },

    faqs: [
      {
        question: "Is Langa safe to visit?",
        answer:
          "Yes. Langa is considered one of Cape Town's safer townships to visit, especially when touring with experienced local community guides.",
      },
      {
        question: "Who leads the tour?",
        answer:
          "The experience is led by a professional driver-guide together with a knowledgeable local community guide from Langa.",
      },
      {
        question: "Are entrance fees included?",
        answer:
          "Yes. All entry fees, transport, guides, and bottled water are included.",
      },
      {
        question: "Is lunch included?",
        answer:
          "No. Lunch and personal purchases are excluded from the tour price.",
      },
    ],

    tags: [
      "Langa",
      "Township",
      "Culture",
      "History",
      "Community",
      "Guga S'thebe",
      "Cape Town",
      "Half Day",
    ],
  },

  {
    id: 8,
    type: TOUR_TYPES.HISTORICAL,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Robben Island Half-Day Tour",
    slug: "robben-island-tour",
    canonicalPath: "/tours/robben-island-tour",

    seo: {
      title: "Robben Island Half-Day Tour | Cape Frontier Tours",
      description:
        "Discover the history of Robben Island with hotel pickup, return ferry tickets, a guided prison tour, Nelson Mandela's cell, and an island bus tour.",
      keywords: [
        "Robben Island tour",
        "Robben Island ferry",
        "Nelson Mandela prison tour",
        "Cape Town historical tour",
        "UNESCO World Heritage Site",
        "Robben Island Museum",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/robben-island"),
    images: getTourImages("historical/robben-island", 3),

    location: "Robben Island, Cape Town, South Africa",
    duration: "4 - 5 Hours",

    priceBase: 1990,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 1990,
      },
      {
        category: "Children under 12. ",
        pricePerPerson: 995,
      },
      {
        category: "Children under 5. ",
        pricePerPerson: 0,
      },
    ],


    groupPricing: {
      enabled: false,
      icon: "/icons/savemore.png",
      tiers: [
        {
          // minPeople: 2,
          // maxPeople: 4,
          // totalPrice: 9560,
          // label: "2–4 Guests",
          // note: "Private vehicle • All-inclusive",
        },
      ],
    },
    rating: 4.9,
    stars: 5,
    mainReviewerName: "Thomas Reed",
    mainReviewerCountry: "US",
    reviewYear: 2026,
    otherReviews: 91,
    mainReview:
      "One of the most meaningful experiences in Cape Town. Learning the history from former inmates made the visit unforgettable.",

    description:
      "Robben Island is a UNESCO World Heritage Site located approximately 7 km off the coast of Cape Town. Best known for imprisoning Nelson Mandela for 18 of his 27 years in captivity, the island has become a powerful symbol of freedom, resilience, and reconciliation. During this half-day experience, enjoy return ferry transport, a guided prison tour, Nelson Mandela's former cell, an island bus tour, and insights into South Africa's struggle for democracy from knowledgeable guides, including former political prisoners when available.",

    highlights: [
      { text: "Return ferry ticket included" },
      { text: "Guided prison tour" },
      { text: "Visit Nelson Mandela's prison cell" },
      { text: "Island bus tour" },
      { text: "UNESCO World Heritage Site" },
      { text: "Hotel pickup & drop-off" },
    ],

    included: [
      { text: "Return ferry ticket" },
      { text: "Guided Robben Island tour" },
      {
        text: "Hotel pickup & drop-off (Cape Town CBD, Green Point & Sea Point)",
      },
      { text: "Air-conditioned vehicle" },
      { text: "Professional driver-guide" },
      { text: "Bottled water" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Personal purchases" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Green Point",
      "Sea Point",
    ],

    stops: [
      {
        id: "gateway",
        name: "Nelson Mandela Gateway",
        time: "Departure dependent",
        duration: "30 minutes",
        note: "Ferry departure terminal",
        description:
          "Begin your experience from the Nelson Mandela Gateway at the V&A Waterfront before boarding the ferry to Robben Island.",
        exactLocation: mapLocation({
          label: "Nelson Mandela Gateway",
          address: "V&A Waterfront, Cape Town",
          query: "Nelson Mandela Gateway V&A Waterfront",
        }),
        images: [],
        touristComments: [],
      },

      {
        id: "robben-island",
        name: "Robben Island Museum",
        time: "Ferry dependent",
        duration: "3 - 4 hours",
        note: "UNESCO World Heritage Site",
        description:
          "Explore the former maximum-security prison, visit Nelson Mandela's prison cell, enjoy an island bus tour, and learn about South Africa's history from expert guides and former political prisoners where available.",
        exactLocation: mapLocation({
          label: "Robben Island Museum",
          address: "Robben Island, Cape Town",
          query: "Robben Island Museum",
        }),
        images: getTourImages("historical/robben-island", 3),
        touristComments: [
          {
            name: "Thomas",
            country: "US",
            text: "Hearing the history from a former inmate made this one of the most moving experiences of our trip.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: false,
      icon: "/icons/savemore.png",
      rules: [],
    },

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 1990,
      },
      {
        category: "Children (5–17 years)",
        pricePerPerson: 995,
      },
      {
        category: "Children (0–4 years)",
        pricePerPerson: 0,
      },
    ],

    needToKnow: [
      { text: "Morning and afternoon departures are available." },
      { text: "Ferry departures are weather dependent." },
      { text: "Advance booking is highly recommended." },
      { text: "Please carry identification if required for ferry boarding." },
      { text: "Comfortable walking shoes are recommended." },
    ],

    cancellationPolicy: {
      summary:
        "Ferry operations are subject to weather and sea conditions.",
      items: [
        { text: "Weather may result in ferry delays or cancellations." },
        { text: "Cancelled departures may be rescheduled where possible." },
        { text: "Cancellation terms are confirmed upon booking." },
      ],
    },

    faqs: [
      {
        question: "Is the ferry ticket included?",
        answer:
          "Yes. Return ferry tickets are included in the tour price.",
      },
      {
        question: "Is hotel pickup included?",
        answer:
          "Yes. Pickup and drop-off are included for Cape Town CBD, Green Point, and Sea Point.",
      },
      {
        question: "How long is the tour?",
        answer:
          "The complete experience lasts approximately 4–5 hours, depending on ferry schedules.",
      },
      {
        question: "Can weather affect the tour?",
        answer:
          "Yes. Ferry departures depend on weather and sea conditions and may occasionally be delayed or cancelled.",
      },
    ],

    tags: [
      "Robben Island",
      "Historical",
      "UNESCO",
      "Nelson Mandela",
      "Museum",
      "Half Day",
      "Cape Town",
      "Heritage",
    ],
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

    image: getCoverImage(`${PENINSULA_PACKAGE_ONE_BASE}/cape-point`),
    images: packageGallery(PENINSULA_PACKAGE_ONE_BASE, PENINSULA_1_DESTINATIONS, 3),
    destinationGalleries: packageDestinationGalleries(
      PENINSULA_PACKAGE_ONE_BASE,
      PENINSULA_1_DESTINATIONS,
      3
    ),

    location: "Cape Peninsula, Cape Town",
    duration: "Full Day",

    priceBase: 4000,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 4000,
      },
      // {
      //   category: "Children (5–17 years)",
      //   pricePerPerson: 2295,
      //   note: "Robben Island child fare + Langa Township tour",
      // },
      // {
      //   category: "Children (0–4 years)",
      //   pricePerPerson: 1300,
      //   note: "Robben Island free • Langa Township applies",
      // }, // no group pricing
    ],

    groupPricing: {
      enabled: false,
      icon: "/icons/savemore.png",
      tiers: [
        {
          // minPeople: 2,
          // maxPeople: 4,
          // totalPrice: 9560,
          // label: "2–4 Guests",
          // note: "Private vehicle • All-inclusive",
        },
      ],
    },


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
      { text: "All entry fees and bottle water." },
      { text: "Experiecend local guide" },
      { text: "Planned full-day route" },
    ],

    excluded: [
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
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/maidens-cove`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/hout-bay`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/noordhoek`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/cape-point`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/ostrich-farm`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/boulders-beach`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/simons-town`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/muizenberg`, 3),
        touristComments: [],
      },
    ],


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

    image: getCoverImage(`${PENINSULA_PACKAGE_TWO_BASE}/chapmans-peak`),
    images: packageGallery(PENINSULA_PACKAGE_TWO_BASE, PENINSULA_2_DESTINATIONS, 3),
    destinationGalleries: packageDestinationGalleries(
      PENINSULA_PACKAGE_TWO_BASE,
      PENINSULA_2_DESTINATIONS,
      3
    ),

    location: "Cape Peninsula, Cape Town",
    duration: "Full Day",

    priceBase: 3200,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 3200,
      },
      // {
      //   category: "Children (5–17 years)",
      //   pricePerPerson: 2295,
      //   note: "Robben Island child fare + Langa Township tour",
      // },
      // {
      //   category: "Children (0–4 years)",
      //   pricePerPerson: 1300,
      //   note: "Robben Island free • Langa Township applies",
      // }, // no group/childrens pricing
    ],

    groupPricing: {
      enabled: false,
      icon: "/icons/savemore.png",
      tiers: [
        {
          // minPeople: 2,
          // maxPeople: 4,
          // totalPrice: 9560,
          // label: "2–4 Guests",
          // note: "Private vehicle • All-inclusive",
        },
      ],
    },

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
        images: getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/sea-point`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/camps-bay`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/chapmans-peak`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/cape-point`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/boulders-beach`, 3),
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
        images: getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/simons-town`, 3),
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
    type: TOUR_TYPES.PACKAGES,
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

    priceBase: 3500,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 3500,
      },
      // {
      //   category: "Children (5–17 years)",
      //   pricePerPerson: 2295,
      //   note: "Robben Island child fare + Langa Township tour",
      // },
      // {
      //   category: "Children (0–4 years)",
      //   pricePerPerson: 1300,
      //   note: "Robben Island free • Langa Township applies",
      // }, no group/childrens pricing
    ],

    groupPricing: {
      enabled: false,
      icon: "/icons/savemore.png",
      tiers: [
        {
          // minPeople: 2,
          // maxPeople: 4,
          // totalPrice: 9560,
          // label: "2–4 Guests",
          // note: "Private vehicle • All-inclusive",
        },
      ],
    },

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
      { text: "Admission fees to all estates." },
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

  {
    id: 12,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Gun Range + Cape Point",
    slug: "gun-range-cape-point",
    canonicalPath: "/tours/gun-range-cape-point",

    seo: {
      title: "Gun Range & Cape Point Full-Day Tour | Cape Frontier Tours",
      description:
        "Experience an adrenaline-filled private Cape Town tour combining a supervised shooting range session with Boulders Penguin Colony, Cape Point, Cape of Good Hope, and Chapman's Peak Drive.",
      keywords: [
        "Gun Range Cape Town",
        "Cape Point Tour",
        "Cape of Good Hope Tour",
        "Boulders Penguins Tour",
        "Private Cape Peninsula Tour",
        "Cape Town Shooting Experience",
        "Cape Town Adventure Tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage(`${ADRENALINE_BASE}/gun-range`),

    images: [
      ...getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
      ...getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/boulders`, 2),
      ...getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/cape-point`, 2),
    ],

    destinationGalleries: {
      "gun-range": getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
      boulders: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/boulders`, 3),
      "cape-point": getTourImages(
        `${PENINSULA_PACKAGE_ONE_BASE}/cape-point`,
        3
      ),
    },

    location: "Cape Town, South Africa",
    duration: "8 - 9 Hours",

    priceBase: 9560,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,
    
    pricing: [
      {
        category: "Adults",
        pricePerPerson: null, // not confirmed yet
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 2,
          maxPeople: 4,
          perPerson: 2390, // not confirmed yet
          totalPrice: 9560,
          label: "2–4 Guests",
          note: "Private vehicle • All-inclusive",
        },
        {
          minPeople: 5,
          maxPeople: 7,
          perPerson: 2470, // not confirmed yet
          totalPrice: 17280,
          label: "5–7 Guests",
          note: "Private vehicle • All-inclusive",
        },
      ],
    },

    rating: 5.0,
    stars: 5,
    mainReviewerName: "Daniel Brooks",
    mainReviewerCountry: "US",
    reviewYear: 2026,
    otherReviews: 29,
    mainReview:
      "A unique combination of adventure and sightseeing. The shooting experience was professional and Cape Point was unforgettable.",

    description:
      "Experience the perfect blend of adrenaline and iconic Cape Peninsula scenery. Start your day with a fully supervised shooting experience at an accredited gun range, then explore the world‑famous Boulders Penguins, Cape Point, and the Cape of Good Hope.",

    highlights: [
      { text: "Fully supervised accredited shooting experience" },
      { text: "Visit Boulders Penguin Colony" },
      { text: "Cape Point & Cape of Good Hope" },
      { text: "Scenic Chapman's Peak Drive" },
      { text: "Private vehicle and flexible itinerary" },
    ],

    included: [
      { text: "Private vehicle with driver-guide" },
      { text: "Hotel pickup & drop-off" },
      { text: "Accredited gun range experience" },
      { text: "Professional firearms instructor" },
      { text: "Safety briefing" },
      { text: "Handgun or rifle shooting package" },
      { text: "Boulders Penguin Colony entry" },
      { text: "Cape Point Nature Reserve entry" },
      { text: "Bottled water" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Cape Point Flying Dutchman Funicular (optional)" },
      { text: "Personal purchases" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "gun-range",
        name: "Gun Range",
        time: "09:00",
        duration: "1.5 - 2 hours",
        note: "Fully supervised accredited shooting experience",
        description:
          "Start your adventure with a professionally supervised shooting session. Receive a complete safety briefing before enjoying a handgun or rifle experience suitable for both beginners and experienced shooters.",
        exactLocation: mapLocation({
          label: "Gun Range",
          query: "Cape Town Gun Range",
        }),
        images: getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
        touristComments: [
          {
            name: "Daniel",
            country: "US",
            text: "The instructors made the experience safe, professional, and incredibly enjoyable.",
          },
        ],
      },

      {
        id: "boulders",
        name: "Boulders Penguin Colony",
        time: "12:00",
        duration: "1 hour",
        note: "African Penguin Colony",
        description:
          "Walk along the boardwalks to observe the famous African penguins in their natural habitat while enjoying one of Cape Town's most photographed coastal attractions.",
        exactLocation: mapLocation({
          label: "Boulders Penguin Colony",
          address: "Kleintuin Road, Simon's Town",
          query: "Boulders Penguin Colony",
        }),
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/boulders`, 3),
        touristComments: [
          {
            name: "Emma",
            country: "UK",
            text: "Seeing the penguins so close was an unforgettable experience.",
          },
        ],
      },

      {
        id: "cape-point",
        name: "Cape Point & Cape of Good Hope",
        time: "14:00",
        duration: "2.5 - 3 hours",
        note: "Cape Peninsula Nature Reserve",
        description:
          "Discover the dramatic cliffs, iconic lighthouse, breathtaking ocean views, and the famous Cape of Good Hope while spotting local wildlife including baboons, ostriches, and antelope.",
        exactLocation: mapLocation({
          label: "Cape Point",
          address: "Cape Point Nature Reserve",
          query: "Cape Point",
        }),
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/cape-point`, 3),
        touristComments: [
          {
            name: "Sophie",
            country: "DE",
            text: "Cape Point exceeded every expectation. The scenery was incredible.",
          },
        ],
      },

      {
        id: "chapmans-peak",
        name: "Chapman's Peak Drive",
        time: "17:00",
        duration: "30 minutes",
        note: "Scenic coastal drive",
        description:
          "Finish the day with one of the world's most spectacular coastal drives featuring panoramic Atlantic Ocean views.",
        exactLocation: mapLocation({
          label: "Chapman's Peak Drive",
          query: "Chapman's Peak Drive",
        }),
        images: getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/chapmans-peak`, 3),
        touristComments: [
          {
            name: "Mark",
            country: "CA",
            text: "The drive alone was worth the trip. Absolutely stunning.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: false,
    },

    needToKnow: [
      { text: "Participants must follow all firearm safety instructions." },
      { text: "Valid identification may be required at the shooting range." },
      { text: "Children may accompany the sightseeing portion only where permitted." },
      { text: "Comfortable walking shoes are recommended." },
      { text: "Wildlife sightings cannot be guaranteed." },
    ],

    cancellationPolicy: {
      summary:
        "Shooting range bookings and park access are subject to availability.",
      items: [
        { text: "Private tour bookings require advance confirmation." },
        { text: "Weather may affect the itinerary." },
        { text: "Final cancellation policy is confirmed upon booking." },
      ],
    },

    faqs: [
      {
        question: "Is the shooting experience suitable for beginners?",
        answer:
          "Yes. Professional instructors provide a complete safety briefing and supervise the entire session.",
      },
      {
        question: "Are all entrance fees included?",
        answer:
          "Yes. The shooting range, Boulders Penguin Colony, and Cape Point Nature Reserve entrance fees are included.",
      },
      {
        question: "Is this a private tour?",
        answer:
          "Yes. The tour includes a private vehicle with your own driver-guide and a flexible itinerary.",
      },
      {
        question: "Is lunch included?",
        answer:
          "No. Lunch is excluded, allowing guests to choose where they'd like to dine.",
      },
    ],



    tags: [
      "Gun Range",
      "Cape Point",
      "Cape of Good Hope",
      "Penguins",
      "Private Tour",
      "Adventure",
      "Cape Town",
      "Full Day",
    ],
  },

  {
    id: 13,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Gun Range + Cape Town City Tour",
    slug: "gun-range-cape-town-city-tour",
    canonicalPath: "/tours/gun-range-cape-town-city-tour",

    seo: {
      title: "Gun Range & Cape Town City Tour | Cape Frontier Tours",
      description:
        "Combine an exciting supervised shooting experience with a private Cape Town city tour featuring Bo-Kaap, Signal Hill, Camps Bay, and the V&A Waterfront.",
      keywords: [
        "Gun Range Cape Town",
        "Cape Town City Tour",
        "Bo-Kaap Tour",
        "Signal Hill Tour",
        "Camps Bay Tour",
        "V&A Waterfront Tour",
        "Private Cape Town Tour",
        "Cape Town Adventure Tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage(`adrenaline/gun-range`),

    images: [
      ...getTourImages(`adrenaline/gun-range`, 3),
      ...getTourImages(`packages/gun-range+city-tour/bo-kaap`, 2),
      ...getTourImages(`packages/gun-range+city-tour/signal-hill`, 2),
      ...getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/camps-bay`, 2),
      ...getTourImages(`packages/gun-range+city-tour/va-waterfront`, 2),
    ],

    destinationGalleries: {
      "gun-range": getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
      "bo-kaap": getTourImages(`packages/gun-range+city-tour/bo-kaap`, 3),
      "signal-hill": getTourImages(`packages/gun-range+city-tour/signal-hill`, 3),
      "camps-bay": getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/camps-bay`, 3),
      waterfront: getTourImages(`packages/gun-range+city-tour/va-waterfront`, 3),
    },

    location: "Cape Town, South Africa",
    duration: "6 - 7 Hours",

    priceBase: 7200,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,
 
    pricing: [
      {
        category: "Adults",
        pricePerPerson: 3290,
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 2,
          maxPeople: 4,
          perPerson: 1800, // not confirmed yet
          totalPrice: 7200,
          label: "2–4 Guests",
          note: "Private vehicle",
        },
        {
          minPeople: 5,
          maxPeople: 7,
          perPerson: 1428, // not confirmed yet
          totalPrice: 10000,
          label: "5–7 Guests",
          note: "Private vehicle",
        },
      ],
    },

    rating: 5.0,
    stars: 5,
    mainReviewerName: "Michael Carter",
    mainReviewerCountry: "US",
    reviewYear: 2026,
    otherReviews: 22,
    mainReview:
      "A fantastic mix of adrenaline and sightseeing. The shooting experience was professional and the city highlights were spectacular.",

    description:
      "Perfect for travellers looking to combine adventure with Cape Town's most iconic landmarks. Begin with a professionally supervised shooting experience before discovering colourful Bo-Kaap, panoramic Signal Hill, beautiful Camps Bay, and the vibrant V&A Waterfront.",

    highlights: [
      { text: "Fully supervised accredited shooting experience" },
      { text: "Explore colourful Bo-Kaap" },
      { text: "Panoramic views from Signal Hill" },
      { text: "Relax at Camps Bay" },
      { text: "Visit the V&A Waterfront" },
      { text: "Private vehicle with flexible itinerary" },
    ],

    included: [
      { text: "Private vehicle with driver-guide" },
      { text: "Hotel pickup & drop-off" },
      { text: "Accredited shooting range session" },
      { text: "Professional firearms instructor" },
      { text: "Safety briefing" },
      { text: "Bottled water" },
    ],

    excluded: [
      { text: "Meals" },
      { text: "Optional museum entry fees" },
      { text: "Personal purchases" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "gun-range",
        name: "Gun Range",
        time: "09:00",
        duration: "1.5 - 2 hours",
        note: "Fully supervised shooting experience",
        description:
          "Begin your day with an exciting shooting session led by experienced instructors. Suitable for beginners and experienced shooters alike.",
        exactLocation: mapLocation({
          label: "Gun Range",
          query: "Cape Town Gun Range",
        }),
        images: getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
        touristComments: [
          {
            name: "Michael",
            country: "US",
            text: "Professional, safe, and one of the highlights of our trip.",
          },
        ],
      },

      {
        id: "bo-kaap",
        name: "Bo-Kaap",
        time: "11:30",
        duration: "45 minutes",
        note: "Historic Cape Malay neighbourhood",
        description:
          "Explore Cape Town's colourful Bo-Kaap with its cobbled streets, vibrant houses, and rich cultural heritage.",
        exactLocation: mapLocation({
          label: "Bo-Kaap",
          query: "Bo-Kaap Cape Town",
        }),
        images: getTourImages(`gun-range+city-tour/bo-kaap`, 3),
        touristComments: [
          {
            name: "Emma",
            country: "AU",
            text: "The colourful streets made for incredible photographs.",
          },
        ],
      },

      {
        id: "signal-hill",
        name: "Signal Hill",
        time: "12:30",
        duration: "30 minutes",
        note: "Panoramic city viewpoint",
        description:
          "Take in sweeping views of Cape Town, Table Mountain, the Atlantic coastline, and Robben Island.",
        exactLocation: mapLocation({
          label: "Signal Hill",
          query: "Signal Hill Cape Town",
        }),
        images: getTourImages(`${CITY_TOUR_BASE}/signal-hill`, 3),
        touristComments: [
          {
            name: "David",
            country: "UK",
            text: "The views across the city were absolutely breathtaking.",
          },
        ],
      },

      {
        id: "camps-bay",
        name: "Camps Bay",
        time: "13:30",
        duration: "1 hour",
        note: "Scenic beachfront",
        description:
          "Enjoy one of Cape Town's most famous beaches, lined with palm trees, cafés, and spectacular ocean views.",
        exactLocation: mapLocation({
          label: "Camps Bay",
          query: "Camps Bay Beach",
        }),
        images: getTourImages(`${CITY_TOUR_BASE}/camps-bay`, 3),
        touristComments: [
          {
            name: "Claire",
            country: "FR",
            text: "Beautiful beach with an amazing mountain backdrop.",
          },
        ],
      },

      {
        id: "waterfront",
        name: "V&A Waterfront",
        time: "15:00",
        duration: "1.5 hours",
        note: "Shopping, dining and harbour",
        description:
          "Finish your tour exploring the lively V&A Waterfront, one of South Africa's most popular attractions for shopping, dining, and harbour views.",
        exactLocation: mapLocation({
          label: "V&A Waterfront",
          query: "V&A Waterfront Cape Town",
        }),
        images: getTourImages(`${CITY_TOUR_BASE}/va-waterfront`, 3),
        touristComments: [
          {
            name: "Sarah",
            country: "CA",
            text: "A great place to end the day with plenty to see and do.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: false,
    },

    needToKnow: [
      { text: "Participants must follow all firearm safety instructions." },
      { text: "Valid identification may be required at the shooting range." },
      { text: "Comfortable walking shoes are recommended." },
      { text: "Museum visits are optional and paid separately." },
    ],

    cancellationPolicy: {
      summary:
        "Tour itinerary may vary depending on weather and attraction operating hours.",
      items: [
        { text: "Private tour bookings require advance confirmation." },
        { text: "Final cancellation policy is confirmed upon booking." },
      ],
    },

    faqs: [
      {
        question: "Is the shooting experience suitable for beginners?",
        answer:
          "Yes. Professional instructors provide a full safety briefing and supervise the entire experience.",
      },
      {
        question: "Is this a private tour?",
        answer:
          "Yes. The tour includes a private vehicle with your own driver-guide and a flexible itinerary.",
      },
      {
        question: "Are meals included?",
        answer:
          "No. Meals are excluded, allowing guests to choose where they'd like to eat.",
      },
      {
        question: "Are museum entries included?",
        answer:
          "Optional museum entrance fees are excluded unless otherwise arranged.",
      },
    ],


    tags: [
      "Gun Range",
      "Cape Town",
      "City Tour",
      "Bo-Kaap",
      "Signal Hill",
      "Camps Bay",
      "V&A Waterfront",
      "Private Tour",
      "Adventure",
    ],
  },

  {
    id: 14,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Gun Range + Horse Riding",
    slug: "gun-range-horse-riding",
    canonicalPath: "/tours/gun-range-horse-riding",

    seo: {
      title: "Gun Range & Noordhoek Beach Horse Riding Tour | Cape Frontier Tours",
      description:
        "Enjoy a private full-day adventure combining a supervised shooting range experience with a scenic horse ride along Noordhoek Beach via the spectacular Chapman's Peak Drive.",
      keywords: [
        "Gun Range Cape Town",
        "Horse Riding Noordhoek Beach",
        "Noordhoek Horse Riding",
        "Chapman's Peak Tour",
        "Private Adventure Tour",
        "Cape Town Horse Riding",
        "Cape Town Shooting Experience",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage(`adrenaline/horse-riding-dunes`),

    images: [
      ...getTourImages(`adrenaline/gun-range`, 3),
      ...getTourImages(`adrenaline/horse-riding-dunes`, 3),
      ...getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/chapmans-peak`, 2),
    ],

    destinationGalleries: {
      "gun-range": getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
      "horse-riding": getTourImages(
        `${HIKING_BASE}/noordhoek-beach-horse-riding`,
        3
      ),
      "chapmans-peak": getTourImages(
        `${PENINSULA_PACKAGE_TWO_BASE}/chapmans-peak`,
        3
      ),
    },

    location: "Cape Town, South Africa",
    duration: "4 - 5 Hours",

    priceBase: 10260,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,
 
    pricing: [
      {
        category: "Adults",
        pricePerPerson: 2890, // not confirmed yet
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 2,
          maxPeople: 4,
          perPerson: 5780, // not confirmed yet
          totalPrice: 10260,
          label: "2–4 Guests",
          note: "Private vehicle",
        },
        {
          minPeople: 5,
          maxPeople: 7,
          perPerson: 2030, // not confirmed yet
          totalPrice: 14200,
          label: "5–7 Guests",
          note: "Private vehicle",
        },
      ],
    },

    rating: 5.0,
    stars: 5,
    mainReviewerName: "Emily Foster",
    mainReviewerCountry: "UK",
    reviewYear: 2026,
    otherReviews: 18,
    mainReview:
      "The perfect combination of adventure and relaxation. The horse ride on Noordhoek Beach was unforgettable.",

    description:
      "Experience the perfect balance of adrenaline and natural beauty. Begin your day with a professionally supervised shooting session before travelling along the breathtaking Chapman's Peak Drive to enjoy a peaceful 1–2 hour horse ride on Noordhoek Beach.",

    highlights: [
      { text: "Accredited supervised shooting experience" },
      { text: "Scenic Chapman's Peak Drive" },
      { text: "1–2 hour Noordhoek Beach horse ride" },
      { text: "Private transport throughout" },
      { text: "Flexible private itinerary" },
    ],

    included: [
      { text: "Private vehicle with driver-guide" },
      { text: "Hotel pickup & drop-off" },
      { text: "Accredited shooting range session" },
      { text: "Professional firearms instructor" },
      { text: "Horse riding experience" },
      { text: "Horse riding safety equipment" },
      { text: "Bottled water" },
    ],

    excluded: [
      { text: "Meals" },
      { text: "Personal purchases" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "gun-range",
        name: "Gun Range",
        time: "09:00",
        duration: "1.5 - 2 hours",
        note: "Professional supervised shooting experience",
        description:
          "Enjoy a safe and exciting shooting session with experienced instructors. Suitable for both beginners and experienced shooters.",
        exactLocation: mapLocation({
          label: "Gun Range",
          query: "Cape Town Gun Range",
        }),
        images: getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
        touristComments: [
          {
            name: "Emily",
            country: "UK",
            text: "Very professional instructors and an unforgettable experience.",
          },
        ],
      },

      {
        id: "chapmans-peak",
        name: "Chapman's Peak Drive",
        time: "11:30",
        duration: "45 minutes",
        note: "Scenic coastal drive",
        description:
          "Travel one of the world's most spectacular coastal roads while enjoying panoramic Atlantic Ocean views.",
        exactLocation: mapLocation({
          label: "Chapman's Peak Drive",
          query: "Chapman's Peak Drive",
        }),
        images: getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/chapmans-peak`, 3),
        touristComments: [
          {
            name: "Ryan",
            country: "US",
            text: "Every corner offered another incredible view.",
          },
        ],
      },

      {
        id: "horse-riding",
        name: "Noordhoek Beach Horse Riding",
        time: "13:00",
        duration: "1 - 2 hours",
        note: "Beach horseback riding experience",
        description:
          "Enjoy a peaceful guided horseback ride along the expansive white sands of Noordhoek Beach surrounded by mountains and ocean views.",
        exactLocation: mapLocation({
          label: "Noordhoek Beach",
          query: "Noordhoek Beach Horse Riding",
        }),
        images: getTourImages(
          `${HIKING_BASE}/noordhoek-beach-horse-riding`,
          3
        ),
        touristComments: [
          {
            name: "Olivia",
            country: "AU",
            text: "Riding along the beach was one of the highlights of our South Africa trip.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: false,
    },

    needToKnow: [
      { text: "Participants must follow all firearm safety instructions." },
      { text: "Horse riding is suitable for beginners unless otherwise advised." },
      { text: "Comfortable clothing and closed shoes are recommended." },
      { text: "Horse riding is subject to weather conditions." },
    ],

    cancellationPolicy: {
      summary:
        "Horse riding and shooting range bookings are subject to availability and weather.",
      items: [
        { text: "Private bookings require advance confirmation." },
        { text: "Weather may affect horse riding operations." },
        { text: "Final cancellation policy is confirmed upon booking." },
      ],
    },

    faqs: [
      {
        question: "Do I need horse riding experience?",
        answer:
          "No. The experience is suitable for beginners and includes guidance from experienced staff.",
      },
      {
        question: "Is the shooting experience suitable for beginners?",
        answer:
          "Yes. Professional instructors provide a complete safety briefing before the session begins.",
      },
      {
        question: "Is this a private tour?",
        answer:
          "Yes. The tour is operated as a private experience with your own driver-guide.",
      },
      {
        question: "Are meals included?",
        answer:
          "No. Meals are excluded, allowing guests to choose their preferred dining option.",
      },
    ],



    tags: [
      "Gun Range",
      "Horse Riding",
      "Noordhoek Beach",
      "Chapman's Peak",
      "Private Tour",
      "Adventure",
      "Cape Town",
      "Full Day",
    ],
  },

  {
    id: 15,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Gun Range + Quad Biking Adventure",
    slug: "gun-range-quad-biking-adventure",
    canonicalPath: "/tours/gun-range-quad-biking-adventure",

    seo: {
      title: "Gun Range & Atlantis Dunes Quad Biking Tour | Cape Frontier Tours",
      description:
        "Experience the ultimate Cape Town adrenaline adventure with a supervised shooting range session followed by an exciting quad biking experience at the Atlantis Dunes.",
      keywords: [
        "Gun Range Cape Town",
        "Atlantis Dunes Quad Biking",
        "Quad Bike Cape Town",
        "Cape Town Adventure Tour",
        "Private Quad Biking Tour",
        "Cape Town Shooting Experience",
        "Adventure Activities Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage(`packages/gun-range+quad-biking`),

    images: [
      ...getTourImages(`adrenaline/gun-range`, 3),
      ...getTourImages(`packages/gun-range+quad-biking`, 3),
    ],

    destinationGalleries: {
      "gun-range": getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
      "quad-biking": getTourImages(`${ADRENALINE_BASE}/quad-biking`, 3),
    },

    location: "Cape Town, South Africa",
    duration: "7 - 8 Hours",

    priceBase: 9800,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 3290,
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 2,
          maxPeople: 4,
          perPerson: 2450, // not confirmed yet
          totalPrice: 9800,
          label: "2–4 Guests",
          note: "Private vehicle",
        },
        {
          minPeople: 5,
          maxPeople: 7,
          perPerson: 1920, // not confirmed yet
          totalPrice: 13400,
          label: "5–7 Guests",
          note: "Private vehicle",
        },
      ],
    },

    rating: 5.0,
    stars: 5,
    mainReviewerName: "Jake Harrison",
    mainReviewerCountry: "US",
    reviewYear: 2026,
    otherReviews: 24,
    mainReview:
      "The perfect adrenaline day. The shooting session and Atlantis Dunes quad biking were both unforgettable.",

    description:
      "Designed for thrill-seekers, bachelor groups, and adventure travellers, this private experience combines a professionally supervised shooting session with an exhilarating one-hour quad biking adventure across the spectacular Atlantis Dunes.",

    highlights: [
      { text: "Fully supervised accredited shooting experience" },
      { text: "Handgun or rifle shooting package" },
      { text: "1-hour Atlantis Dunes quad biking adventure" },
      { text: "Private transport throughout" },
      { text: "Ideal for adventure groups and bachelor parties" },
    ],

    included: [
      { text: "Private vehicle with driver-guide" },
      { text: "Hotel pickup & drop-off" },
      { text: "Accredited shooting instructor" },
      { text: "Firearm safety briefing" },
      { text: "Handgun or rifle shooting package" },
      { text: "Quad bike rental" },
      { text: "Quad biking safety equipment" },
      { text: "Bottled water" },
    ],

    excluded: [
      { text: "Meals" },
      { text: "Optional photo and video packages" },
      { text: "Personal purchases" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "gun-range",
        name: "Gun Range",
        time: "09:00",
        duration: "1.5 - 2 hours",
        note: "Professional supervised shooting experience",
        description:
          "Begin your adventure with a professionally supervised shooting session, complete with a firearm safety briefing and handgun or rifle package.",
        exactLocation: mapLocation({
          label: "Gun Range",
          query: "Cape Town Gun Range",
        }),
        images: getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
        touristComments: [
          {
            name: "Jake",
            country: "US",
            text: "The instructors made the experience exciting while keeping everything safe.",
          },
        ],
      },

      {
        id: "quad-biking",
        name: "Atlantis Dunes Quad Biking",
        time: "12:30",
        duration: "1 hour",
        note: "Guided dune adventure",
        description:
          "Ride powerful quad bikes across the spectacular white sand dunes of Atlantis on an exciting guided adventure suitable for beginners and experienced riders.",
        exactLocation: mapLocation({
          label: "Atlantis Dunes",
          query: "Atlantis Dunes Quad Biking",
        }),
        images: getTourImages(`${ADRENALINE_BASE}/quad-biking`, 3),
        touristComments: [
          {
            name: "Megan",
            country: "IE",
            text: "An incredible ride through the dunes and easily one of the most exciting things we've done.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: false,
    },

    needToKnow: [
      { text: "Participants must follow all firearm safety instructions." },
      { text: "Valid identification may be required at the shooting range." },
      { text: "Quad biking is subject to weather conditions." },
      { text: "Closed shoes and comfortable clothing are recommended." },
    ],

    cancellationPolicy: {
      summary:
        "Quad biking and shooting sessions are subject to weather and operator availability.",
      items: [
        { text: "Private bookings require advance confirmation." },
        { text: "Weather may affect quad biking operations." },
        { text: "Final cancellation policy is confirmed upon booking." },
      ],
    },

    faqs: [
      {
        question: "Is quad biking suitable for beginners?",
        answer:
          "Yes. Experienced guides provide a full safety briefing before the ride begins.",
      },
      {
        question: "Is the shooting experience suitable for beginners?",
        answer:
          "Yes. Professional instructors supervise the entire session and provide comprehensive safety instruction.",
      },
      {
        question: "Is this a private tour?",
        answer:
          "Yes. The tour includes a private vehicle with your own driver-guide throughout the day.",
      },
      {
        question: "Are meals included?",
        answer:
          "No. Meals are excluded from the tour price.",
      },
    ],



    tags: [
      "Gun Range",
      "Quad Biking",
      "Atlantis Dunes",
      "Adventure",
      "Private Tour",
      "Cape Town",
      "Full Day",
      "Bachelor Groups",
    ],
  },

  {
    id: 16,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Gun Range + Wine Tasting",
    slug: "gun-range-wine-tasting",
    canonicalPath: "/tours/gun-range-wine-tasting",

    seo: {
      title: "Gun Range & Wine Tasting Tour | Cape Frontier Tours",
      description:
        "Enjoy a premium private experience combining a supervised shooting session with wine tasting at selected estates in Constantia or Stellenbosch.",
      keywords: [
        "Gun Range Cape Town",
        "Wine Tasting Tour",
        "Constantia Wine Tour",
        "Stellenbosch Wine Tour",
        "Cape Town Wine Experience",
        "Private Wine Tour",
        "Cape Town Shooting Experience",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage(`adrenaline/gun-range`),

    images: [
      ...getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
      ...getTourImages(`${STELLENBOSCH_WINE_BASE}/delaire`, 2),
      ...getTourImages(`${STELLENBOSCH_WINE_BASE}/tokara`, 2),
    ],

    destinationGalleries: {
      "gun-range": getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
      "wine-estates": [
        ...getTourImages(`${STELLENBOSCH_WINE_BASE}/delaire`, 3),
        ...getTourImages(`${STELLENBOSCH_WINE_BASE}/tokara`, 3),
      ],
    },

    location: "Cape Town, South Africa",
    duration: "7 - 8 Hours",

    priceBase: 7680,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 3290,
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 2,
          maxPeople: 4,
          perPerson: 0, // not confirmed yet
          totalPrice: 7680,
          label: "2–4 Guests",
          note: "Private vehicle",
        },
        {
          minPeople: 5,
          maxPeople: 7,
          perPerson: 0, // not confirmed yet
          totalPrice: 10600,
          label: "5–7 Guests",
          note: "Private vehicle",
        },
      ],
    },

    rating: 5.0,
    stars: 5,
    mainReviewerName: "Sophia Bennett",
    mainReviewerCountry: "UK",
    reviewYear: 2026,
    otherReviews: 17,
    mainReview:
      "An excellent adults-only experience with the perfect balance of excitement and relaxation.",

    description:
      "Experience an unforgettable private day combining an exciting supervised shooting session with visits to two carefully selected wine estates in either Constantia or Stellenbosch. Enhance your experience with optional wine tastings and cheese pairings while enjoying the beautiful Cape Winelands.",

    highlights: [
      { text: "Accredited supervised shooting experience" },
      { text: "Visit two premium wine estates" },
      { text: "Choice of Constantia or Stellenbosch route" },
      { text: "Optional wine tasting and cheese pairing" },
      { text: "Private transport throughout" },
    ],

    included: [
      { text: "Private vehicle with driver-guide" },
      { text: "Hotel pickup & drop-off" },
      { text: "Accredited shooting range session" },
      { text: "Professional firearms instructor" },
      { text: "Private wine estate visits" },
      { text: "Bottled water" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Wine tasting fees (optional add-on)" },
      { text: "Optional cheese pairings" },
      { text: "Personal purchases" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "gun-range",
        name: "Gun Range",
        time: "09:00",
        duration: "1.5 - 2 hours",
        note: "Professional supervised shooting experience",
        description:
          "Start your day with a professionally supervised shooting session, including a complete firearm safety briefing suitable for beginners and experienced shooters.",
        exactLocation: mapLocation({
          label: "Gun Range",
          query: "Cape Town Gun Range",
        }),
        images: getTourImages(`${ADRENALINE_BASE}/gun-range`, 3),
        touristComments: [
          {
            name: "Sophia",
            country: "UK",
            text: "Safe, exciting and professionally organised from start to finish.",
          },
        ],
      },

      {
        id: "wine-estate-1",
        name: "Wine Estate",
        time: "12:00",
        duration: "1.5 hours",
        note: "Premium estate visit",
        description:
          "Visit one of the Cape's renowned wine estates in Constantia or Stellenbosch for optional wine tastings and spectacular vineyard scenery.",
        exactLocation: mapLocation({
          label: "Wine Estate",
          query: "Constantia Wine Estates",
        }),
        images: getTourImages(`${STELLENBOSCH_WINE_BASE}/delaire`, 3),
        touristComments: [
          {
            name: "Oliver",
            country: "DE",
            text: "Excellent wines and beautiful mountain views.",
          },
        ],
      },

      {
        id: "wine-estate-2",
        name: "Second Wine Estate",
        time: "14:30",
        duration: "1.5 hours",
        note: "Optional cheese pairing",
        description:
          "Continue to a second premium estate to relax with additional wine tastings or optional cheese pairings while enjoying the Cape Winelands.",
        exactLocation: mapLocation({
          label: "Wine Estate",
          query: "Stellenbosch Wine Estates",
        }),
        images: getTourImages(`${STELLENBOSCH_WINE_BASE}/tokara`, 3),
        touristComments: [
          {
            name: "Claire",
            country: "FR",
            text: "A perfect afternoon with fantastic wines and incredible scenery.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: false,
    },

    needToKnow: [
      { text: "This experience is intended for adults of legal drinking age." },
      { text: "Participants must follow all firearm safety instructions." },
      { text: "Wine estate selection depends on availability." },
      { text: "Wine tastings and cheese pairings are optional add-ons." },
    ],

    cancellationPolicy: {
      summary:
        "Wine estate availability and shooting bookings are subject to confirmation.",
      items: [
        { text: "Private bookings require advance confirmation." },
        { text: "Estate availability may affect the final itinerary." },
        { text: "Final cancellation policy is confirmed upon booking." },
      ],
    },

    faqs: [
      {
        question: "Which wine estates will we visit?",
        answer:
          "The tour visits two selected estates in either Constantia or Stellenbosch, depending on availability and guest preference.",
      },
      {
        question: "Are wine tastings included?",
        answer:
          "Wine tastings are available as an optional add-on and can be arranged during booking.",
      },
      {
        question: "Is this a private tour?",
        answer:
          "Yes. The experience includes a private vehicle with your own driver-guide.",
      },
      {
        question: "Is the shooting experience suitable for beginners?",
        answer:
          "Yes. Professional instructors supervise the entire session and provide a full safety briefing.",
      },
    ],


    tags: [
      "Gun Range",
      "Wine Tasting",
      "Constantia",
      "Stellenbosch",
      "Private Tour",
      "Adult Experience",
      "Cape Town",
      "Full Day",
    ],
  },

  {
    id: 17,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Horse Riding, Penguins & Cape Point",
    slug: "horse-riding-penguins-cape-point",
    canonicalPath: "/tours/horse-riding-penguins-cape-point",

    seo: {
      title:
        "Horse Riding, Penguins & Cape Point Full-Day Tour | Cape Frontier Tours",
      description:
        "Experience a private full-day Cape Peninsula adventure featuring Noordhoek Beach horse riding, Boulders Beach Penguins, Cape Point, the Cape of Good Hope, and Chapman's Peak Drive.",
      keywords: [
        "Cape Point Tour",
        "Horse Riding Cape Town",
        "Noordhoek Beach Horse Riding",
        "Boulders Beach Penguins",
        "Cape of Good Hope Tour",
        "Chapman's Peak Drive",
        "Cape Peninsula Tour",
        "Private Cape Town Tour",
      ],
    },

    workflow: defaultWorkflow,

    // image: getCoverImage(`${PENINSULA_PACKAGE_ONE_BASE}/noordhoek`),
    image: getCoverImage(`adrenaline/horse-riding-dunes`),

    images: [
      ...getTourImages(`adrenaline/horse-riding-dunes`, 3),
      ...getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/noordhoek`, 3),
      ...getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/chapmans-peak`, 2),
      ...getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/boulders-beach`, 2),
      ...getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/cape-point`, 2),
    ],

    destinationGalleries: {
      "horse-riding": getTourImages(
        `${HIKING_BASE}/noordhoek-beach-horse-riding`,
        3
      ),
      "chapmans-peak": getTourImages(
        `${PENINSULA_PACKAGE_TWO_BASE}/chapmans-peak`,
        3
      ),
      boulders: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/boulders`, 3),
      "cape-point": getTourImages(
        `${PENINSULA_PACKAGE_ONE_BASE}/cape-point`,
        3
      ),
    },

    location: "Cape Town, South Africa",
    duration: "8 - 9 Hours",

    priceBase: 11560,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 3290,
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
          {
            minPeople: 1,
            maxPeople: 4,
            perPerson: 0, // not confirmed yet
            totalPrice: 11560,
            label: "1–4 Guests",
            note: "Private vehicle • All-inclusive",
          },
          {
            minPeople: 5,
            maxPeople: 7,
            perPerson: 0, // not confirmed yet
            totalPrice: 17300,
            label: "5–7 Guests",
            note: "Private vehicle • All-inclusive",
          },
      ],

    },
    
    rating: 5.0,
    stars: 5,
    mainReviewerName: "Emily Carter",
    mainReviewerCountry: "UK",
    reviewYear: 2026,
    otherReviews: 41,
    mainReview:
      "An unforgettable day combining horseback riding, wildlife, and Cape Point. Every stop was spectacular.",

    description:
      "Experience the ultimate Cape Peninsula adventure combining scenic beach horse riding, African penguins, and the world-famous Cape Point Nature Reserve. This private full-day tour blends adventure, wildlife, and breathtaking scenery, making it perfect for couples, families, and nature lovers.",

    highlights: [
      { text: "Chapman's Peak Drive" },
      { text: "1–2 hour Noordhoek Beach horse riding" },
      { text: "Visit Boulders Beach Penguin Colony" },
      { text: "Cape Point & Cape of Good Hope" },
      { text: "Private transport with driver-guide" },
      { text: "Flexible itinerary" },
    ],

    included: [
      { text: "Private vehicle with professional driver-guide" },
      { text: "Hotel pickup & drop-off" },
      { text: "Chapman's Peak toll fees" },
      { text: "1–2 hour horse riding experience" },
      { text: "Horse riding fees" },
      { text: "Boulders Beach entry fee" },
      { text: "Cape Point Nature Reserve entry fee" },
      { text: "Bottled water" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Cape Point Flying Dutchman Funicular (optional)" },
      { text: "Personal purchases" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "chapmans-peak",
        name: "Chapman's Peak Drive",
        time: "09:00",
        duration: "45 minutes",
        note: "One of the world's most scenic coastal drives",
        description:
          "Begin your adventure with breathtaking views along the famous Chapman's Peak Drive before arriving at Noordhoek.",
        exactLocation: mapLocation({
          label: "Chapman's Peak Drive",
          query: "Chapman's Peak Drive",
        }),
        images: getTourImages(`${PENINSULA_PACKAGE_TWO_BASE}/chapmans-peak`, 3),
        touristComments: [
          {
            name: "James",
            country: "US",
            text: "Every viewpoint along the drive was breathtaking.",
          },
        ],
      },

      {
        id: "horse-riding",
        name: "Noordhoek Beach Horse Riding",
        time: "10:00",
        duration: "1 - 2 hours",
        note: "Beach horseback riding",
        description:
          "Enjoy a guided horseback ride along Noordhoek Beach, surrounded by mountains, rolling dunes, and one of Cape Town's most beautiful coastlines. Suitable for beginners and experienced riders alike.",
        exactLocation: mapLocation({
          label: "Noordhoek Beach",
          query: "Noordhoek Beach Horse Riding",
        }),
        images: getTourImages(
          `${HIKING_BASE}/noordhoek-beach-horse-riding`,
          3
        ),
        touristComments: [
          {
            name: "Emily",
            country: "UK",
            text: "The beach ride was peaceful, scenic, and unforgettable.",
          },
        ],
      },

      {
        id: "boulders",
        name: "Boulders Beach Penguin Colony",
        time: "13:00",
        duration: "1 hour",
        note: "African Penguin Colony",
        description:
          "Walk the boardwalks for close-up views of the endangered African penguins while enjoying the crystal-clear waters and giant granite boulders.",
        exactLocation: mapLocation({
          label: "Boulders Beach",
          query: "Boulders Beach",
        }),
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/boulders`, 3),
        touristComments: [
          {
            name: "Olivia",
            country: "AU",
            text: "Seeing the penguins in their natural habitat was amazing.",
          },
        ],
      },

      {
        id: "cape-point",
        name: "Cape Point & Cape of Good Hope",
        time: "15:00",
        duration: "2.5 - 3 hours",
        note: "Cape Point Nature Reserve",
        description:
          "Explore Cape Point Nature Reserve, visit the Cape of Good Hope, admire spectacular ocean views, and optionally ride the Flying Dutchman Funicular to the historic lighthouse while watching for baboons, ostriches, and antelope.",
        exactLocation: mapLocation({
          label: "Cape Point",
          query: "Cape Point",
        }),
        images: getTourImages(`${PENINSULA_PACKAGE_ONE_BASE}/cape-point`, 3),
        touristComments: [
          {
            name: "Daniel",
            country: "CA",
            text: "Cape Point is one of the most beautiful places we've ever visited.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: false,
    },

    needToKnow: [
      { text: "Horse riding is suitable for beginners and experienced riders." },
      { text: "Comfortable clothing and closed shoes are recommended." },
      { text: "Wildlife sightings cannot be guaranteed." },
      { text: "Horse riding is subject to weather conditions." },
      { text: "The funicular ride is optional and not included." },
    ],

    cancellationPolicy: {
      summary:
        "Horse riding and park access are subject to weather and operator availability.",
      items: [
        { text: "Private bookings require advance confirmation." },
        { text: "Weather may affect horse riding operations." },
        { text: "Final cancellation policy is confirmed upon booking." },
      ],
    },

    faqs: [
      {
        question: "Do I need horse riding experience?",
        answer:
          "No. Calm, well-trained horses and experienced guides make this suitable for beginners.",
      },
      {
        question: "Are entrance fees included?",
        answer:
          "Yes. Horse riding, Boulders Beach, Cape Point Nature Reserve, and Chapman's Peak toll fees are included.",
      },
      {
        question: "Is this a private tour?",
        answer:
          "Yes. The experience includes a private vehicle with your own professional driver-guide.",
      },
      {
        question: "Is lunch included?",
        answer:
          "No. Lunch is excluded, allowing guests to choose where they'd like to dine.",
      },
    ],

   
    tags: [
      "Horse Riding",
      "Noordhoek Beach",
      "Chapman's Peak",
      "Boulders Beach",
      "Penguins",
      "Cape Point",
      "Cape of Good Hope",
      "Private Tour",
      "Adventure",
      "Cape Town",
      "Full Day",
    ],
  },

  {
    id: 18,
    type: TOUR_TYPES.HISTORICAL,
    category: TOUR_MODIFIERS.PACKAGE | TOUR_MODIFIERS.FULL_DAY,

    title: "Robben Island + Langa Township Tour",
    slug: "robben-island-langa-township-tour",
    canonicalPath: "/tours/robben-island-langa-township-tour",

    seo: {
      title:
        "Robben Island & Langa Township Full-Day Tour | Cape Frontier Tours",
      description:
        "Experience two of Cape Town's most important historical and cultural attractions with a full-day tour including Robben Island, Langa Township, hotel transfers, ferry tickets, guides, and all entry fees.",
      keywords: [
        "Robben Island Tour",
        "Langa Township Tour",
        "Cape Town Historical Tour",
        "Cape Town Cultural Experience",
        "Nelson Mandela Tour",
        "Robben Island Ferry",
        "Langa Cultural Tour",
        "Cape Town Heritage Tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/robben-island"),

    images: [
      ...getTourImages("historical/robben-island", 3),
      ...getTourImages("historical/langa", 3),
    ],

    destinationGalleries: {
      "robben-island": getTourImages("historical/robben-island", 3),
      langa: getTourImages("historical/langa", 3),
    },

    location: "Cape Town, South Africa",
    duration: "6 - 7 Hours",

    priceBase: 3290,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 3290,
      },
      // {
      //   category: "Children under 12.",
      //   pricePerPerson: 2400,
      //   note: "",
      // },
      // {
      //   category: "Children under 5.",
      //   pricePerPerson: 0,
      //   note: "",
      // },
    ],

    groupPricing: {
      enabled: false,
      icon: "/icons/savemore.png",
      tiers: [
        // {
        //   minPeople: 2,
        //   maxPeople: 4,
        //   totalPrice: 7680,
        //   label: "2–4 Guests",
        //   note: "Private vehicle",
        // },
        // {
        //   minPeople: 5,
        //   maxPeople: 7,
        //   totalPrice: 10600,
        //   label: "5–7 Guests",
        //   note: "Private vehicle",
        // },
      ],
    },

    rating: 5.0,
    stars: 5,
    mainReviewerName: "Sarah Mitchell",
    mainReviewerCountry: "AU",
    reviewYear: 2026,
    otherReviews: 37,
    mainReview:
      "A moving and unforgettable journey through South Africa's history and culture. Highly recommended.",

    description:
      "This powerful full-day experience combines two of Cape Town's most meaningful cultural and historical attractions. Visit Robben Island, where Nelson Mandela spent 18 years of his imprisonment, before discovering the vibrant community, history, art, and culture of Langa Township with experienced local guides.",

    highlights: [
      { text: "Return Robben Island ferry ticket" },
      { text: "Maximum-security prison tour" },
      { text: "Visit Nelson Mandela's prison cell" },
      { text: "Robben Island bus tour" },
      { text: "Langa Township cultural experience" },
      { text: "Guga S'thebe Arts & Culture Centre" },
      { text: "Local community guide" },
      { text: "Hotel pickup & drop-off" },
    ],

    included: [
      { text: "Return Robben Island ferry ticket" },
      { text: "Guided Robben Island tour" },
      { text: "Professional driver-guide" },
      { text: "Local Langa community guide" },
      { text: "Guga S'thebe visit" },
      { text: "Guided cultural walk" },
      { text: "Hotel pickup & drop-off" },
      { text: "Air-conditioned vehicle" },
      { text: "Bottled water" },
      { text: "All entrance fees" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Personal purchases" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Green Point",
      "Sea Point",
    ],

    stops: [
      {
        id: "gateway",
        name: "Nelson Mandela Gateway",
        time: "08:00",
        duration: "30 minutes",
        note: "Ferry departure",
        description:
          "Board the ferry at the V&A Waterfront for your journey across Table Bay to Robben Island.",
        exactLocation: mapLocation({
          label: "Nelson Mandela Gateway",
          address: "V&A Waterfront, Cape Town",
          query: "Nelson Mandela Gateway V&A Waterfront",
        }),
        images: [],
        touristComments: [],
      },

      {
        id: "robben-island",
        name: "Robben Island",
        time: "09:00",
        duration: "3 - 4 hours",
        note: "UNESCO World Heritage Site",
        description:
          "Experience the ferry crossing, island bus tour, Robert Sobukwe House, Lime Quarry, WWII bunkers, Leper Church, Maximum Security Prison, and Nelson Mandela's prison cell while hearing firsthand stories from former political prisoners where available.",
        exactLocation: mapLocation({
          label: "Robben Island Museum",
          query: "Robben Island Museum",
        }),
        images: getTourImages("historical/robben-island", 3),
        touristComments: [
          {
            name: "Sarah",
            country: "AU",
            text: "One of the most powerful historical experiences we've ever had.",
          },
        ],
      },

      {
        id: "guga-sthebe",
        name: "Guga S'thebe Arts & Culture Centre",
        time: "14:00",
        duration: "45 minutes",
        note: "Arts & community centre",
        description:
          "Discover local art studios, ceramic workshops, community projects, music spaces, and cultural exhibitions.",
        exactLocation: mapLocation({
          label: "Guga S'thebe",
          query: "Guga Sthebe Langa",
        }),
        images: getTourImages("historical/langa", 3),
        touristComments: [
          {
            name: "Emma",
            country: "UK",
            text: "The creativity and community spirit were inspiring.",
          },
        ],
      },

      {
        id: "langa",
        name: "Langa Township Cultural Walk",
        time: "15:00",
        duration: "1.5 hours",
        note: "Community experience",
        description:
          "Walk through Cape Town's oldest township with a local guide while learning about its history, entrepreneurship, community upliftment projects, and vibrant daily life before visiting local craft markets.",
        exactLocation: mapLocation({
          label: "Langa Township",
          query: "Langa Township",
        }),
        images: getTourImages("historical/langa", 3),
        touristComments: [
          {
            name: "David",
            country: "CA",
            text: "An authentic experience that gave us a deeper appreciation of South Africa.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: false,
    },

    needToKnow: [
      { text: "Morning departures are recommended." },
      { text: "Ferry departures depend on weather conditions." },
      { text: "Comfortable walking shoes are recommended." },
      { text: "Please ask permission before photographing local residents." },
      { text: "Advance booking is highly recommended." },
    ],

    cancellationPolicy: {
      summary:
        "Ferry schedules and community activities may affect the itinerary.",
      items: [
        { text: "Robben Island departures are weather dependent." },
        { text: "Tour order may change depending on ferry schedules." },
        { text: "Final cancellation policy is confirmed upon booking." },
      ],
    },

    faqs: [
      {
        question: "Are ferry tickets included?",
        answer:
          "Yes. Return ferry tickets and all entrance fees are included.",
      },
      {
        question: "Is hotel pickup included?",
        answer:
          "Yes. Pickup and drop-off are included for Cape Town CBD, Green Point, and Sea Point.",
      },
      {
        question: "How long is the tour?",
        answer:
          "The complete experience lasts approximately 6–7 hours depending on ferry schedules.",
      },
      {
        question: "Is lunch included?",
        answer:
          "No. Lunch and personal purchases are excluded.",
      },
    ],



    tags: [
      "Robben Island",
      "Langa",
      "Historical",
      "Cultural",
      "UNESCO",
      "Nelson Mandela",
      "Township",
      "Cape Town",
      "Full Day",
    ],
  },

  {
    id: 19,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Horse Riding – The Dunes",
    slug: "horse-riding-the-dunes",
    canonicalPath: "/tours/horse-riding-the-dunes",

    seo: {
      title: "Horse Riding – The Dunes | Cape Frontier Tours",
      description:
        "Enjoy a scenic dune horse riding experience with bottled water included. A relaxed single-adventure ride through Cape Town’s coastal dune landscapes.",
      keywords: [
        "Horse riding Cape Town",
        "Dune horse riding",
        "Noordhoek horse riding",
        "Cape Town horse riding experience",
        "Beach and dune horse ride",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/horse-riding-dunes"),
    images: getTourImages("adrenaline/horse-riding-dunes", 3),

    destinationGalleries: {
      dunes: getTourImages("adrenaline-adventure/horse-riding-dunes", 3),
    },

    location: "Cape Town, South Africa",
    duration: "1.5 - 2 Hours",

    priceBase: 2250,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    
    pricing: [
      {
        category: "Adults",
        pricePerPerson: 2250,
      },
      // {
      //   category: "Children under 12.",
      //   pricePerPerson: 2400,
      //   note: "",
      // },
      // {
      //   category: "Children under 5.",
      //   pricePerPerson: 0,
      //   note: "",
      // }, // no group/childrens pricing
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 2,
          perPerson: 2250,
          label: "2+ Guests",
          note: "Private vehicle",
        },
      ],
    },


    rating: 4.8,
    stars: 5,
    mainReviewerName: "Daniel Brooks",
    mainReviewerCountry: "UK",
    reviewYear: 2026,
    otherReviews: 18,
    mainReview:
      "A peaceful yet exciting ride through the dunes with incredible scenery and well-trained horses.",

    description:
      "Experience a guided horse riding adventure through Cape Town’s scenic dune landscapes. This relaxed ride is suitable for beginners and experienced riders alike, offering open spaces, coastal air, and beautiful natural surroundings.",

    highlights: [
      { text: "Guided dune horse riding experience" },
      { text: "Suitable for beginners and experienced riders" },
      { text: "Scenic coastal dune landscapes" },
      { text: "Well-trained horses and safety briefing" },
      { text: "Bottled water included" },
    ],

    included: [
      { text: "Horse riding experience" },
      { text: "Professional guide/instructor" },
      { text: "Safety equipment briefing" },
      { text: "Bottled water" },
    ],

    excluded: [
      { text: "Transport (at location meeting point)" },
      { text: "Meals" },
      { text: "Personal purchases" },
    ],

    pickupOptions: [
      "At location only",
    ],

    stops: [
      {
        id: "dunes-ride",
        name: "Dune Horse Riding Route",
        time: "Flexible",
        duration: "1.5 - 2 hours",
        note: "Guided dune riding experience",
        description:
          "Ride through wide-open dune landscapes with professional guidance, calm horses, and scenic coastal views ideal for photography and relaxation.",
        exactLocation: mapLocation({
          label: "Horse Riding Dunes",
          query: "Noordhoek dunes horse riding",
        }),
        images: getTourImages("adrenaline-adventure/horse-riding-dunes", 3),
        touristComments: [
          {
            name: "Mia",
            country: "NL",
            text: "Peaceful, scenic, and very well organized. Perfect introduction to horse riding.",
          },
        ],
      },
    ],

    groupDiscount: {
      enabled: false,
    },

    needToKnow: [
      { text: "Minimum 2 guests required" },
      { text: "Suitable for beginners and experienced riders" },
      { text: "Comfortable clothing and closed shoes recommended" },
      { text: "Subject to weather conditions" },
    ],

    cancellationPolicy: {
      summary: "Weather conditions may affect dune riding availability.",
      items: [
        { text: "Cancellations due to weather may be rescheduled" },
        { text: "Advance booking recommended" },
        { text: "Final policy confirmed on booking" },
      ],
    },

    faqs: [
      {
        question: "Do I need horse riding experience?",
        answer:
          "No. The experience is suitable for beginners with full guidance provided.",
      },
      {
        question: "Is transport included?",
        answer:
          "No. This is an at-location activity unless otherwise arranged.",
      },
      {
        question: "What should I wear?",
        answer:
          "Comfortable clothing and closed shoes are recommended for safety.",
      },
    ],

    tags: [
      "Horse Riding",
      "Dunes",
      "Adventure",
      "Cape Town",
      "Outdoor",
      "Single Activity",
    ],
  }

];


export const getAllTourGalleryImages = (tour) => {
  if (!tour) return [];

  // Defensive: ensure these are arrays
  const images = Array.isArray(tour.images) ? tour.images : [];
  const destinationGalleries = Array.isArray(tour.destinationGalleries) 
    ? tour.destinationGalleries 
    : [];
  const stops = Array.isArray(tour.stops) ? tour.stops : [];

  return [
    tour.image,
    ...images,
    // Safely flatMap destinationGalleries
    ...destinationGalleries.flatMap(
      (destination) => Array.isArray(destination?.images) ? destination.images : []
    ),
    // Exclude pickup and return stops
    ...stops
      .filter(stop => stop?.id !== 'pickup' && stop?.id !== 'return')
      .flatMap((stop) => Array.isArray(stop?.images) ? stop.images : []),
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

export default tours;
