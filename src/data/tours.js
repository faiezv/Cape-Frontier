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

    priceBase: 4900,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,


    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 4900 },
        { category: "Children under 12", pricePerPerson: 2400 },
        { category: "Children under 5", pricePerPerson: 0 },
      ],
      groupDiscount: {
        enabled: true,
        icon: "/icons/savemore.png",
        rules: [
          { minPeople: 6, discountPercent: 3.06 },
        ],
      },
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

    title: "Outdoor Gun Range Experience",
    slug: "outdoor-gun-range",
    canonicalPath: "/tours/outdoor-gun-range",

    seo: {
      title: "Outdoor Gun Range Experience Cape Town | Cape Frontier Tours",
      description:
        "All‑inclusive outdoor shooting experience near Cape Town. Meet at the range for a professionally supervised session with safety briefing, bottled water, and group discounts. No transport needed – just turn up and shoot.",
      keywords: [
        "outdoor gun range Cape Town",
        "shooting experience Cape Town",
        "gun range all inclusive",
        "Cape Town outdoor shooting",
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

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 3000 },
      ],
      groupDiscount: {
        enabled: true,
        icon: "/icons/savemore.png",
        rules: [
          { minPeople: 3, discountPercent: 3.33 },
        ],
      },
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
      "Take aim at Cape Town’s premier outdoor gun range. This all‑inclusive experience puts you on the firing line with expert supervision, a full safety briefing, and bottled water. No transport fuss – just meet at the range and enjoy a thrilling session suitable for beginners and experienced shooters alike.",

    highlights: [
      { text: "All‑inclusive outdoor shooting session" },
      { text: "Professional instructor & safety briefing" },
      { text: "Bottled water included" },
      { text: "1‑2 people: R3,000 pp | 3+ people: R2,900 pp" },
    ],

    included: [
      { text: "Safety briefing" },
      { text: "Guided range session" },
      { text: "Bottled water" },
      { text: "All necessary safety gear" },
    ],

    excluded: [
      { text: "Transport (meet at location)" },
      { text: "Personal expenses" },
      { text: "Ammunition beyond included package (if specified)" },
    ],

    pickupOptions: [
      "Meet at shooting range",
    ],

    stops: [
      {
        id: "meeting",
        name: "Meeting at Outdoor Range",
        time: "09:00",
        duration: "30 min",
        note: "Exact venue shared after booking",
        description:
          "Meet your instructor directly at the approved outdoor range. Complete registration and receive your safety briefing before handling firearms.",
        exactLocation: mapLocation({
          label: "Outdoor Shooting Range Cape Town",
          address: "Cape Town area, Western Cape, South Africa",
          query: "shooting range Cape Town outdoor",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "shooting-session",
        name: "Shooting Session",
        time: "09:30",
        duration: "1.5 - 2 hours",
        note: "Supervised live‑fire experience",
        description:
          "Under close supervision, experience a variety of targets and firearms in a controlled outdoor environment. Your instructor will guide you every step of the way.",
        exactLocation: mapLocation({
          label: "Outdoor Shooting Range Cape Town",
          address: "Cape Town area, Western Cape, South Africa",
          query: "shooting range Cape Town outdoor",
        }),
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
      { text: "Closed shoes and comfortable clothing are recommended" },
      { text: "Exact range location shared after booking confirmation" },
      { text: "No transport provided – meet directly at the venue" },
      { text: "Single person: R3,000 | 2 people: R3,000 pp | 3+ people: R2,900 pp" },
    ],

    cancellationPolicy: {
      summary: "Flexible cancellation up to 48 hours before the session.",
      items: [
        { text: "Free cancellation up to 48 hours before start time" },
        { text: "Changes subject to availability" },
        { text: "No refund for late cancellations or no‑shows" },
      ],
    },

    faqs: [
      {
        question: "Where exactly is the range?",
        answer: "The exact outdoor range location is shared after booking for security and operational reasons.",
      },
      {
        question: "Can I bring my own firearm?",
        answer: "No, only range‑provided firearms are used. All equipment is supplied.",
      },
      {
        question: "Is this suitable for first‑timers?",
        answer: "Absolutely – the safety briefing and instructor guidance make it perfect for beginners.",
      },
    ],

    tags: ["Adrenaline", "Guided", "Controlled", "Half Day"],
  },


  {
    id: 3,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Paragliding with Icarus",
    slug: "paragliding-icarus",
    canonicalPath: "/tours/paragliding-icarus",

    seo: {
      title: "Tandem Paragliding with Icarus Cape Town | Cape Frontier Tours",
      description:
        "Tandem paragliding with Icarus from Signal Hill, Lion’s Head or best wind site. All‑inclusive pricing from R3,100/person with bottled water. Expert pilots, safety briefing, and unbeatable coastal views.",
      keywords: [
        "paragliding Cape Town Icarus",
        "tandem paragliding Signal Hill",
        "Cape Town paragliding price",
        "paragliding with bottled water",
        "best paragliding operator Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/paragliding"),
    images: getTourImages("adrenaline/paragliding", 3),

    location: "Signal Hill / Lion’s Head, Cape Town",
    duration: "1 - 2 hours",

    priceBase: 3400,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 3400 },
      ],
      groupDiscount: {
        enabled: true,
        icon: "/icons/savemore.png",
        rules: [
          { minPeople: 2, discountPercent: 8.82 },
        ],
      },
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
      "Soar above the Mother City with Icarus, Cape Town’s trusted tandem paragliding operator. From launch sites on Signal Hill or Lion’s Head, you’ll enjoy breathtaking views of Table Mountain, the Atlantic coastline, and the city bowl. All‑inclusive pricing covers your flight, safety briefing, expert pilot, and bottled water.",

    highlights: [
      { text: "Tandem flight with Icarus expert pilot" },
      { text: "Stunning aerial views of Cape Town" },
      { text: "All‑inclusive pricing with bottled water" },
      { text: "Launch from Signal Hill or best wind site" },
    ],

    included: [
      { text: "Safety briefing" },
      { text: "Tandem paragliding flight" },
      { text: "Experienced Icarus pilot" },
      { text: "Bottled water" },
      { text: "All necessary equipment" },
    ],

    excluded: [
      { text: "Photos or video packages (optional add‑on)" },
      { text: "Transport (meet at launch point)" },
      { text: "Personal expenses" },
    ],

    pickupOptions: [
      "Meet at launch point",
    ],

    stops: [
      {
        id: "launch-point",
        name: "Launch Point (Signal Hill / Lion’s Head)",
        time: "Flexible",
        duration: "30 min briefing",
        note: "Exact location confirmed on the day based on wind",
        description:
          "Meet your Icarus pilot at the day’s optimal launch point. After a weather check and safety briefing, you’ll gear up and take to the skies.",
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
            text: "The team picked the perfect launch spot – the flight was smooth and the views stunning.",
          },
        ],
      },
      {
        id: "landing-area",
        name: "Sea Point Landing Area",
        time: "After flight",
        duration: "15 min",
        note: "Typical landing near the promenade",
        description:
          "Touch down gently near the Sea Point Promenade, with Table Mountain as your backdrop and the Atlantic breeze in your hair.",
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
      { text: "Weather and wind dependent – time may be adjusted" },
      { text: "Wear closed shoes and comfortable clothes" },
      { text: "Flight duration: approx. 10–20 minutes airborne" },
      { text: "Single person: R3,400 | 2+ people: R3,100 per person" },
      { text: "No transport included – meet at the launch point" },
    ],

    cancellationPolicy: {
      summary: "Flexible rescheduling if weather unsuitable. Cancellation terms subject to Icarus policy.",
      items: [
        { text: "Full refund or free reschedule if cancelled by operator due to weather" },
        { text: "Guest cancellations up to 48 hours before: full refund" },
        { text: "Late cancellations or no‑shows may be charged in full" },
      ],
    },

    faqs: [
      {
        question: "Where exactly do we meet?",
        answer:
          "You’ll receive a meeting point confirmation (Signal Hill or Lion’s Head) after booking, based on the day’s wind direction.",
      },
      {
        question: "What’s included in the price?",
        answer:
          "The flight, safety briefing, tandem pilot, all gear, and bottled water. No hidden costs.",
      },
      {
        question: "How many people can fly at once?",
        answer:
          "Flights are tandem – you fly one‑on‑one with an instructor. Groups of 2+ can fly consecutively and enjoy the discount.",
      },
    ],

    tags: ["Adventure", "Scenic", "Air", "Half Day"],
  },

  // { id: 4,
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
  //   baseCurrency: "ZAR",
  //   supportedCurrencies: SUPPORTED_CURRENCIES,
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
  //   groupDiscount: {
  //     enabled: true,
  //     icon: "/icons/savemore.png",
  //     rules: [{ minPeople: 5, discountPercent: 10 }],
  //   },
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
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 1900 },
      ],
      groupDiscount: {
        enabled: true,
        icon: "",
        rules:
          { minPeople: 4, discountPercent: 10 },
      },
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
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 1900 },
      ],
      groupDiscount: {
        enabled: true,
        icon: "",
        rules:
          { minPeople: 4, discountPercent: 10 },
      },
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
    slug: "langa-township-tour",
    canonicalPath: "/tours/langa-township-tour",

    seo: {
      title: "Langa Township Cultural Experience | Cape Town Township Tour",
      description:
        "Immerse yourself in Cape Town’s oldest township, Langa, on a guided cultural tour led by local community guides. Visit Guga S’thebe, walk the streets, meet artisans, and discover authentic township history and hospitality. Includes transport, all fees, and bottled water.",
      keywords: [
        "Langa township tour",
        "Cape Town cultural tour",
        "Langa cultural experience",
        "township tour Cape Town",
        "Guga S'thebe Langa",
        "half day township tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/langa"),
    images: getTourImages("historical/langa", 3),

    location: "Langa, Cape Town, South Africa",
    duration: "3 - 4 hours",

    priceBase: 1300,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 1300 },
        // { category: "kids under 12", pricePerPerson: 650 },
        // { category: "children under 5", pricePerPerson: 0 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "/icons/savemore.png",
        rules: [],
      },
    },

    rating: 4.7,
    stars: 4,
    mainReviewerName: "Amina Clarke",
    mainReviewerCountry: "UK",
    reviewYear: 2025,
    otherReviews: 29,
    mainReview:
      "A meaningful and insightful experience. The guide gave context with care and respect.",

    description:
      "Discover the heart of Cape Town’s oldest township, Langa, on an immersive cultural tour led by local community guides. Langa – meaning “sun” in isiXhosa – was established in 1927 and played a pivotal role in the anti-apartheid struggle. Today it offers authentic storytelling, vibrant art, history, and real connections with the people who call it home. Visit the Guga S’thebe Cultural Centre, walk the streets, meet local artisans, and experience the spirit of a community that shaped South Africa.",

    highlights: [
      { text: "Guided cultural walk with a local community guide" },
      { text: "Visit Guga S’thebe Cultural Centre" },
      { text: "Craft market stop – meet artisans & shop local" },
      { text: "Insight into Langa’s anti-apartheid history" },
      { text: "Hotel pick‑up & drop‑off in air‑conditioned comfort" },
    ],

    included: [
      { text: "Hotel pick‑up & drop‑off (CBD, Green Point, Sea Point)" },
      { text: "Professional driver‑guide" },
      { text: "Local Langa community guide" },
      { text: "Guga S’thebe Cultural Centre visit" },
      { text: "Cultural walking tour" },
      { text: "Craft market stop" },
      { text: "Bottled water" },
      { text: "All entry fees" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Personal purchases" },
      { text: "Gratuities" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Hotel Pickup",
        time: "09:00",
        duration: "30 min",
        note: "Pickup from Cape Town CBD, Green Point, or Sea Point",
        description:
          "Your driver‑guide collects you from your accommodation in a comfortable, air‑conditioned vehicle and heads towards Langa.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "guga-sthebe",
        name: "Guga S’thebe Cultural Centre",
        time: "09:30",
        duration: "1 hour",
        note: "Cultural centre and community introduction",
        description:
          "Begin your Langa experience at the vibrant Guga S’thebe Cultural Centre. Here you’ll meet your local community guide and get an introduction to the township’s history, art, and cultural life.",
        exactLocation: mapLocation({
          label: "Guga S’thebe Cultural Centre",
          address: "Washington Street, Langa, Cape Town, South Africa",
          query: "Guga S'thebe Langa",
        }),
        images: getTourImages("historical/langa", 1),
        touristComments: [
          {
            name: "Amina",
            country: "UK",
            text: "The cultural centre was a wonderful start – so much creativity and warmth.",
          },
        ],
      },
      {
        id: "cultural-walk",
        name: "Cultural Walk & Craft Market",
        time: "10:30",
        duration: "1.5 hours",
        note: "Walking tour with local guide",
        description:
          "Stroll through the streets of Langa with your community guide, meeting locals, learning about everyday life, and stopping at a craft market where you can see and purchase handmade goods. This immersive walk brings the township’s history and spirit to life.",
        exactLocation: mapLocation({
          label: "Langa Township",
          address: "Langa, Cape Town, South Africa",
          query: "Langa Cape Town",
        }),
        images: getTourImages("historical/langa", 2),
        touristComments: [
          {
            name: "Amina",
            country: "UK",
            text: "The walk was eye‑opening – the guide shared stories with care and gave us a deeper understanding of Cape Town.",
          },
          {
            name: "David",
            country: "US",
            text: "Meeting the local artisans at the craft market was a highlight. Real, genuine interaction.",
          },
        ],
      },
      {
        id: "return",
        name: "Return to Cape Town",
        time: "12:00",
        duration: "30 min",
        note: "Drop‑off at your hotel",
        description:
          "After a morning of rich cultural immersion, your driver‑guide returns you to your accommodation.",
        exactLocation: mapLocation({
          label: "Cape Town Drop‑off Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
    ],

    needToKnow: [
      { text: "A respectful dress code is encouraged – no overly revealing clothing" },
      { text: "Ask your guide before photographing people or private spaces" },
      { text: "Comfortable walking shoes recommended" },
      { text: "Route may adjust according to local conditions or events" },
      { text: "Langa is safe for visitors when exploring with a local guide" },
    ],

    cancellationPolicy: {
      summary: "Flexible community‑based tour with full refund up to 48 hours before start.",
      items: [
        { text: "Free cancellation up to 48 hours before tour start" },
        { text: "Changes subject to availability" },
        { text: "No refund for late cancellations or no-shows" },
      ],
    },

    faqs: [
      {
        question: "Is this tour safe?",
        answer: "Yes, Langa is considered safe for visitors, especially when exploring with a local guide. Your guide knows the area intimately.",
      },
      {
        question: "Can I take photos?",
        answer: "Yes, but always ask your guide before photographing people or private spaces to be respectful.",
      },
      {
        question: "What should I wear?",
        answer: "Modest, comfortable clothing and walking shoes are best. Avoid overly revealing outfits.",
      },
      {
        question: "Is the tour suitable for children?",
        answer: "Yes, the tour is family‑friendly and a great way for children to learn about South African culture.",
      },
    ],

    tags: ["Historical", "Culture", "Community", "Half Day", "Shared"],
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

    priceBase: 4000,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 4000 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
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

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 3200 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
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

    priceBase: 3500,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 2250 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
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
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Gun Range + Cape Point Full‑Day Tour",
    slug: "gun-range-cape-point",
    canonicalPath: "/tours/gun-range-cape-point",

    seo: {
      title: "Gun Range + Cape Point Full‑Day Tour from Cape Town | Cape Frontier Tours",
      description:
        "Private full-day adventure combining a supervised shooting experience with a Cape Peninsula tour. Visit Boulders Penguins, Cape Point, and drive Chapman's Peak. All entry fees and private transport included.",
      keywords: [
        "gun range Cape Town",
        "shooting experience Cape Town",
        "Cape Point tour",
        "Boulders Penguins tour",
        "private Cape Peninsula tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/gun-range-cape-point"),
    images: getTourImages("adrenaline/gun-range-cape-point", 4),

    location: "Cape Town, South Africa",
    duration: "8 - 9 hours",

    priceBase: 4780,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 4780 },
        { category: "kids under 12", pricePerPerson: 2390 },
        { category: "children under 5", pricePerPerson: 0 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
    },

    rating: 4.8,
    stars: 5,
    mainReviewerName: "James M.",
    mainReviewerCountry: "US",
    reviewYear: 2026,
    otherReviews: 28,
    mainReview:
      "A fantastic combination of adrenaline and sightseeing! The shooting range was well-organized and safe, while the penguins and Cape Point were unforgettable.",

    description:
      "Embark on a private full-day adventure that blends an adrenaline‑pumping shooting session with the iconic scenery of the Cape Peninsula. Start with a fully supervised experience at an accredited gun range, then explore Boulders Beach, Cape Point, and the Cape of Good Hope. A scenic drive along Chapman’s Peak completes the day.",

    highlights: [
      { text: "Supervised shooting session with professional instructor" },
      { text: "Visit the Boulders Beach Penguin Colony" },
      { text: "Explore Cape Point & Cape of Good Hope" },
      { text: "Scenic Chapman’s Peak Drive" },
    ],

    included: [
      { text: "Private vehicle & driver-guide" },
      { text: "Shooting range session with ammunition" },
      { text: "Boulders Penguins entry fee" },
      { text: "Cape Point entry fee" },
      { text: "Bottled water" },
      { text: "Hotel pickup & drop-off" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Funicular ride at Cape Point (optional)" },
      { text: "Personal expenses" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Pickup from Cape Town",
        time: "07:30",
        duration: "30 min",
        note: "Hotel or selected pickup point",
        description:
          "Your private driver-guide collects you from your accommodation or a central meeting point.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "gun-range",
        name: "Accredited Shooting Range",
        time: "08:00",
        duration: "1.5 hours",
        note: "Full safety briefing and supervised shoot",
        description:
          "Arrive at a professional shooting range for a safety briefing and a hands-on session with a handgun or rifle package, guided by an expert instructor.",
        exactLocation: mapLocation({
          label: "Shooting Range Cape Town",
          address: "Cape Town area, Western Cape, South Africa",
          query: "shooting range Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-cape-point", 2),
        touristComments: [
          {
            name: "James",
            country: "US",
            text: "The instructors were incredibly professional. Even as a beginner I felt completely safe and had a blast!",
          },
        ],
      },
      {
        id: "boulders",
        name: "Boulders Beach Penguin Colony",
        time: "10:00",
        duration: "1 hour",
        note: "African penguin viewing from boardwalks",
        description:
          "Walk the boardwalks at Boulders Beach in Simon’s Town and get close-up views of the endangered African penguin colony in their natural habitat.",
        exactLocation: mapLocation({
          label: "Boulders Beach",
          address: "Simon's Town, Western Cape, South Africa",
          query: "Boulders Beach Simon's Town",
        }),
        images: getTourImages("adrenaline/gun-range-cape-point", 1),
        touristComments: [
          {
            name: "Mia",
            country: "DE",
            text: "Seeing the penguins so close was a highlight. The boardwalks make it easy and family-friendly.",
          },
        ],
      },
      {
        id: "cape-point",
        name: "Cape Point & Cape of Good Hope",
        time: "11:30",
        duration: "2.5 hours",
        note: "Scenic cliffs, lighthouse, and wildlife",
        description:
          "Explore the dramatic landscapes of the Cape Point Nature Reserve. Visit the Cape of Good Hope, the lighthouse (optional funicular available), and keep an eye out for baboons, ostriches, and antelope.",
        exactLocation: mapLocation({
          label: "Cape Point Nature Reserve",
          address: "Cape Point, Cape Peninsula, South Africa",
          query: "Cape Point Cape of Good Hope",
        }),
        images: getTourImages("adrenaline/gun-range-cape-point", 4),
        touristComments: [
          {
            name: "Sarah",
            country: "UK",
            text: "The views from the lighthouse are absolutely breathtaking. Worth every minute of the drive.",
          },
        ],
      },
      {
        id: "return",
        name: "Return to Cape Town via Chapman's Peak",
        time: "14:30",
        duration: "2 hours",
        note: "Scenic drive with photo stops",
        description:
          "Wind your way back along the stunning Chapman's Peak Drive, one of the world's most beautiful coastal roads, before being dropped off at your hotel.",
        exactLocation: mapLocation({
          label: "Chapman's Peak Drive",
          address: "Hout Bay, Cape Town, South Africa",
          query: "Chapman's Peak Drive Cape Town",
        }),
        images: [],
        touristComments: [],
      },
    ],

    needToKnow: [
      { text: "Participants at the shooting range must be 18 years or older" },
      { text: "Wear closed-toe shoes and comfortable clothing" },
      { text: "Itinerary may be adjusted due to weather or traffic" },
      { text: "A valid ID may be required at the shooting range" },
      { text: "2–4 Guests: R9,560 total | 5–7 Guests: R17,280 total (all entry fees & gun range included)" },
    ],

    cancellationPolicy: {
      summary: "Flexible private tour. Cancellation and change terms to be confirmed at booking.",
      items: [
        { text: "Free cancellation up to 48 hours before tour start" },
        { text: "Changes subject to availability" },
        { text: "No refund for late cancellations or no-shows" },
      ],
    },

    faqs: [
      {
        question: "Is the shooting experience safe for beginners?",
        answer: "Yes, a professional instructor provides a full safety briefing and supervision throughout the session.",
      },
      {
        question: "Are entry fees to Boulders Beach and Cape Point included?",
        answer: "Yes, both entry fees are included in the tour price.",
      },
      {
        question: "Can we customize the itinerary?",
        answer: "As a private tour, the itinerary is flexible. Please discuss any changes with your driver-guide.",
      },
      {
        question: "How does the pricing work for larger groups?",
        answer: "The total price is R9,560 for 2–4 guests and R17,280 for 5–7 guests, including all listed inclusions.",
      },
    ],

    tags: ["Adventure", "Wildlife", "Sightseeing", "Full Day", "Private"],

  },

  {
    id: 13,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Gun Range + Cape Town City Tour",
    slug: "gun-range-cape-town-city-tour",
    canonicalPath: "/tours/gun-range-cape-town-city-tour",

    seo: {
      title: "Gun Range + Cape Town City Tour | Cape Frontier Tours",
      description:
        "Adrenaline and sightseeing combined: start with a supervised shooting experience, then explore Bo‑Kaap, Signal Hill, Camps Bay and the V&A Waterfront on this private half‑day tour.",
      keywords: [
        "gun range Cape Town",
        "shooting experience city tour",
        "Cape Town city tour",
        "Bo‑Kaap",
        "Signal Hill",
        "Camps Bay",
        "V&A Waterfront",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/gun-range-city-tour"),
    images: getTourImages("adrenaline/gun-range-city-tour", 4),

    location: "Cape Town, South Africa",
    duration: "5 - 6 hours",

    priceBase: 3600,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 3600 },
        { category: "kids under 12", pricePerPerson: 1800 },
        { category: "children under 5", pricePerPerson: 0 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
    },

    rating: 4.6,
    stars: 4,
    mainReviewerName: "Anna K.",
    mainReviewerCountry: "DE",
    reviewYear: 2026,
    otherReviews: 19,
    mainReview:
      "A brilliant way to spend a morning! The shooting was a real highlight, and the city tour showed us the best of Cape Town in just a few hours.",

    description:
      "Perfect for travellers who want action plus sightseeing. Start with an adrenaline‑packed shooting session at a professional range, then explore Cape Town’s most iconic viewpoints – from the colourful Bo‑Kaap to Signal Hill, Camps Bay beach, and the V&A Waterfront.",

    highlights: [
      { text: "Supervised shooting experience with instructor" },
      { text: "Walk through the colourful Bo‑Kaap neighbourhood" },
      { text: "Panoramic views from Signal Hill" },
      { text: "Scenic stop at Camps Bay beach" },
      { text: "Explore the V&A Waterfront" },
    ],

    included: [
      { text: "Private vehicle & driver‑guide" },
      { text: "Shooting range session with ammunition" },
      { text: "Bottled water" },
      { text: "Hotel pickup & drop‑off" },
    ],

    excluded: [
      { text: "Meals" },
      { text: "Optional museum entries" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Pickup from Cape Town",
        time: "08:00",
        duration: "30 min",
        note: "Hotel or selected pickup point",
        description:
          "Your private driver‑guide collects you and heads towards the shooting range.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "gun-range",
        name: "Accredited Shooting Range",
        time: "08:30",
        duration: "1.5 hours",
        note: "Safety briefing and supervised shoot",
        description:
          "Enjoy a fully supervised shooting session with handgun or rifle options, led by a professional instructor.",
        exactLocation: mapLocation({
          label: "Shooting Range Cape Town",
          address: "Cape Town area, Western Cape, South Africa",
          query: "shooting range Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-city-tour", 2),
        touristComments: [
          {
            name: "Anna",
            country: "DE",
            text: "Great fun! The instructor made us feel safe and the shooting was incredibly enjoyable.",
          },
        ],
      },
      {
        id: "bo-kaap",
        name: "Bo‑Kaap",
        time: "10:15",
        duration: "30 min",
        note: "Colourful houses and Cape Malay heritage",
        description:
          "Stroll through the vibrant streets of Bo‑Kaap, famous for its brightly coloured houses and rich history.",
        exactLocation: mapLocation({
          label: "Bo‑Kaap",
          address: "Bo‑Kaap, Cape Town, South Africa",
          query: "Bo‑Kaap Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-city-tour", 1),
        touristComments: [],
      },
      {
        id: "signal-hill",
        name: "Signal Hill",
        time: "10:55",
        duration: "30 min",
        note: "360‑degree views of the city and Table Mountain",
        description:
          "Take in panoramic views over Cape Town, Table Bay, and the Atlantic Ocean from one of the city’s most accessible viewpoints.",
        exactLocation: mapLocation({
          label: "Signal Hill",
          address: "Signal Hill, Cape Town, South Africa",
          query: "Signal Hill Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-city-tour", 1),
        touristComments: [
          {
            name: "David",
            country: "UK",
            text: "The views are just incredible, especially on a clear day. A perfect photo stop.",
          },
        ],
      },
      {
        id: "camps-bay",
        name: "Camps Bay",
        time: "11:35",
        duration: "30 min",
        note: "Beach and Twelve Apostles backdrop",
        description:
          "A quick stop at Camps Bay’s palm‑lined beach, with the majestic Twelve Apostles mountain range as a backdrop.",
        exactLocation: mapLocation({
          label: "Camps Bay Beach",
          address: "Camps Bay, Cape Town, South Africa",
          query: "Camps Bay Beach Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-city-tour", 1),
        touristComments: [],
      },
      {
        id: "va-waterfront",
        name: "V&A Waterfront",
        time: "12:15",
        duration: "1 hour",
        note: "Harbour, shops, and free time",
        description:
          "End the tour at the iconic V&A Waterfront. Enjoy free time to explore the shops, grab a bite, or simply soak up the harbour atmosphere before your return.",
        exactLocation: mapLocation({
          label: "V&A Waterfront",
          address: "V&A Waterfront, Cape Town, South Africa",
          query: "V&A Waterfront Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-city-tour", 1),
        touristComments: [
          {
            name: "Sophie",
            country: "FR",
            text: "Loved ending the tour here – there’s so much to see and do, and the driver was flexible with the return time.",
          },
        ],
      },
      {
        id: "return",
        name: "Return to Cape Town",
        time: "13:15",
        duration: "30 min",
        note: "Drop‑off at your hotel",
        description:
          "Relax on the drive back to your accommodation, with memories of an action‑packed morning and a city overview.",
        exactLocation: mapLocation({
          label: "Cape Town Drop‑off Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
    ],

    needToKnow: [
      { text: "Participants at the shooting range must be 18 years or older" },
      { text: "Wear closed‑toe shoes and comfortable clothing" },
      { text: "Itinerary can be tailored – talk to your guide" },
      { text: "2–4 Guests: R7,200 total | 5–7 Guests: R10,000 total (includes all listed inclusions)" },
    ],

    cancellationPolicy: {
      summary: "Private tour with flexible cancellation up to 48 hours before departure.",
      items: [
        { text: "Free cancellation up to 48 hours before tour start" },
        { text: "Changes subject to availability" },
        { text: "No refund for late cancellations or no-shows" },
      ],
    },

    faqs: [
      {
        question: "Do I need shooting experience?",
        answer: "No, a safety briefing and instructor supervision are included.",
      },
      {
        question: "Are museum entries included?",
        answer: "Optional museum entries (e.g., Iziko Museums) are not included in the tour price.",
      },
      {
        question: "Can we stay longer at the V&A Waterfront?",
        answer: "As a private tour, the itinerary is flexible – just speak to your guide on the day.",
      },
    ],

    tags: ["Adventure", "Sightseeing", "Half Day", "Private"],
  },

  {
    id: 14,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Gun Range + Horse Riding",
    slug: "gun-range-horse-riding",
    canonicalPath: "/tours/gun-range-horse-riding",

    seo: {
      title: "Gun Range + Horse Riding Tour from Cape Town | Cape Frontier Tours",
      description:
        "A balanced mix of adrenaline and scenic beauty: start with a shooting session, then enjoy a tranquil horse ride along Noordhoek Beach via Chapman's Peak drive.",
      keywords: [
        "gun range horse riding Cape Town",
        "shooting and horse riding tour",
        "Noordhoek Beach horse ride",
        "Cape Town adventure tour",
        "Chapman's Peak scenic drive",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/gun-range-horse-riding"),
    images: getTourImages("adrenaline/gun-range-horse-riding", 4),

    location: "Cape Town, South Africa",
    duration: "7 - 8 hours",

    priceBase: 5130,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 5130 },
        { category: "kids under 12", pricePerPerson: 2565 },
        { category: "children under 5", pricePerPerson: 0 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
    },

    rating: 4.7,
    stars: 5,
    mainReviewerName: "Emily R.",
    mainReviewerCountry: "UK",
    reviewYear: 2026,
    otherReviews: 22,
    mainReview:
      "An amazing combination! The shooting was thrilling and the beach ride was serene. Best of both worlds.",

    description:
      "Enjoy a balanced mix of adrenaline and scenic beauty. Start with a fully supervised shooting session at a certified range, then drive along the spectacular Chapman's Peak to Noordhoek Beach for a peaceful horse ride along the shoreline – all with private transport and expert guides.",

    highlights: [
      { text: "Supervised shooting session at certified range" },
      { text: "Scenic drive along Chapman's Peak" },
      { text: "1‑2 hour horse ride on Noordhoek Beach" },
      { text: "Stunning coastal and mountain scenery" },
    ],

    included: [
      { text: "Private transport & driver‑guide" },
      { text: "Shooting range session with ammunition" },
      { text: "Horse riding experience" },
      { text: "Safety equipment" },
      { text: "Bottled water on route" },
      { text: "Hotel pickup & drop‑off" },
    ],

    excluded: [
      { text: "Meals" },
      { text: "Gratuities" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Pickup from Cape Town",
        time: "08:00",
        duration: "30 min",
        note: "Hotel or selected pickup point",
        description:
          "Your private driver‑guide collects you and heads to the shooting range.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "gun-range",
        name: "Certified Shooting Range",
        time: "08:30",
        duration: "1.5 hours",
        note: "Safety briefing and session with instructor",
        description:
          "Experience a thrilling, fully supervised shooting session with a professional instructor. Handgun or rifle options available.",
        exactLocation: mapLocation({
          label: "Shooting Range Cape Town",
          address: "Cape Town area, Western Cape, South Africa",
          query: "shooting range Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-horse-riding", 2),
        touristComments: [
          {
            name: "Emily",
            country: "UK",
            text: "The range was incredibly professional and made the whole experience exciting yet safe.",
          },
        ],
      },
      {
        id: "chapmans-peak",
        name: "Chapman's Peak Drive",
        time: "10:15",
        duration: "45 min",
        note: "Scenic drive with photo stop",
        description:
          "Wind along one of the world's most beautiful coastal roads. A brief photo stop captures the breathtaking views over Hout Bay.",
        exactLocation: mapLocation({
          label: "Chapman's Peak Drive Lookout",
          address: "Chapman's Peak Drive, Hout Bay, Cape Town, South Africa",
          query: "Chapman's Peak Drive Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-horse-riding", 1),
        touristComments: [
          {
            name: "David",
            country: "US",
            text: "The views are even better in person. An unforgettable stretch of road.",
          },
        ],
      },
      {
        id: "horse-riding",
        name: "Noordhoek Beach Horse Ride",
        time: "11:15",
        duration: "1.5 - 2 hours",
        note: "Beginner‑friendly guided ride",
        description:
          "Saddle up for a peaceful horse ride along the vast, unspoilt sands of Noordhoek Beach. Suitable for all levels, with a guide leading the way.",
        exactLocation: mapLocation({
          label: "Noordhoek Beach",
          address: "Noordhoek, Cape Town, South Africa",
          query: "Noordhoek Beach Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-horse-riding", 3),
        touristComments: [
          {
            name: "Sophie",
            country: "DE",
            text: "Riding a horse on that endless beach was magical. The guides were lovely and patient with beginners.",
          },
        ],
      },
      {
        id: "return",
        name: "Return to Cape Town",
        time: "13:15",
        duration: "45 min",
        note: "Direct transfer back",
        description:
          "After a memorable day, sit back and relax on the drive back to your accommodation in Cape Town.",
        exactLocation: mapLocation({
          label: "Cape Town Drop‑off Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
    ],

    needToKnow: [
      { text: "Participants at the shooting range must be 18 years or older" },
      { text: "Maximum weight for horse riding is 95 kg" },
      { text: "Wear closed‑toe shoes and comfortable long trousers" },
      { text: "Itinerary may be adjusted due to weather or tide conditions" },
      { text: "2–4 Guests: R10,260 total | 5–7 Guests: R14,200 total (all inclusions covered)" },
    ],

    cancellationPolicy: {
      summary: "Private tour with flexible cancellation up to 48 hours before departure.",
      items: [
        { text: "Free cancellation up to 48 hours before tour start" },
        { text: "Changes subject to availability" },
        { text: "No refund for late cancellations or no-shows" },
      ],
    },

    faqs: [
      {
        question: "Do I need horse riding experience?",
        answer: "No, the ride is beginner‑friendly and guides will assist you throughout.",
      },
      {
        question: "What is the weight limit for the horse riding?",
        answer: "The maximum weight is 95 kg (about 15 stone) for the safety and comfort of the horses.",
      },
      {
        question: "What should I wear?",
        answer: "Closed‑toe shoes are essential, and long trousers are recommended for comfort while riding.",
      },
      {
        question: "How does the pricing work for different group sizes?",
        answer: "A flat total rate applies: R10,260 for 2–4 guests and R14,200 for 5–7 guests, including all listed activities and transport.",
      },
    ],

    tags: ["Adventure", "Outdoor", "Sightseeing", "Full Day", "Private"],
  },

  {
    id: 15,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Gun Range + Quad Biking Adventure",
    slug: "gun-range-quad-biking",
    canonicalPath: "/tours/gun-range-quad-biking",

    seo: {
      title: "Gun Range + Quad Biking Adventure from Cape Town | Cape Frontier Tours",
      description:
        "High‑adrenaline combo: start with a supervised shooting session at an accredited range, then tear up the Atlantis Dunes on a guided quad bike tour. Perfect for thrill‑seekers and groups.",
      keywords: [
        "gun range and quad biking Cape Town",
        "Atlantis Dunes quad biking",
        "adventure tour Cape Town",
        "shooting and quad bike combo",
        "bachelor group activity Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/gun-range-quad-biking"),
    images: getTourImages("adrenaline/gun-range-quad-biking", 4),

    location: "Cape Town & Atlantis Dunes, South Africa",
    duration: "8 - 9 hours",

    priceBase: 4900,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 4900 },
        { category: "kids under 12", pricePerPerson: 2450 },
        { category: "children under 5", pricePerPerson: 0 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
    },

    rating: 4.8,
    stars: 5,
    mainReviewerName: "Jake T.",
    mainReviewerCountry: "ZA",
    reviewYear: 2026,
    otherReviews: 24,
    mainReview:
      "The ultimate guy’s day out! Shooting was safe and controlled, and the quad biking in the dunes was an absolute blast. Highly recommended for a rush.",

    description:
      "A high‑adrenaline combo built for thrill‑seekers, bachelor groups, and adventure travellers. Begin with a fully supervised shooting session at an accredited gun range, then head to the otherworldly Atlantis Dunes for a guided quad biking adventure across massive sandscapes. Private transport, all gear, and bottled water included.",

    highlights: [
      { text: "Supervised handgun or rifle shooting experience" },
      { text: "1‑hour guided quad bike tour at Atlantis Dunes" },
      { text: "Thrilling off‑road dune riding" },
      { text: "Starkly beautiful sandscape scenery" },
    ],

    included: [
      { text: "Private transport & driver‑guide" },
      { text: "Accredited shooting instructor & safety briefing" },
      { text: "Shooting range session with ammunition" },
      { text: "Quad bike rental & safety gear" },
      { text: "Bottled water" },
      { text: "Hotel pickup & drop‑off" },
    ],

    excluded: [
      { text: "Meals" },
      { text: "Optional photo/video packages" },
      { text: "Gratuities" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Pickup from Cape Town",
        time: "08:00",
        duration: "30 min",
        note: "Hotel or central pickup point",
        description:
          "Your private driver‑guide meets you and heads straight to the shooting range.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "gun-range",
        name: "Accredited Shooting Range",
        time: "08:30",
        duration: "1.5 hours",
        note: "Safety briefing and supervised shoot",
        description:
          "Start the day with a comprehensive safety briefing and a hands‑on session with a handgun or rifle, guided by a professional instructor.",
        exactLocation: mapLocation({
          label: "Shooting Range Cape Town",
          address: "Cape Town area, Western Cape, South Africa",
          query: "shooting range Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-quad-biking", 2),
        touristComments: [
          {
            name: "Jake",
            country: "ZA",
            text: "Top‑notch instructors; they made us feel like pros even though we were beginners.",
          },
        ],
      },
      {
        id: "atlantis-dunes",
        name: "Atlantis Dunes Quad Biking",
        time: "10:30",
        duration: "2 hours",
        note: "Includes transfer and a 1‑hour quad ride",
        description:
          "After a scenic drive, arrive at the Atlantis Dunes. Gear up and follow your guide on an adrenaline‑charged quad bike trek over rolling sand dunes – a surreal desert experience just outside the city.",
        exactLocation: mapLocation({
          label: "Atlantis Dunes",
          address: "Atlantis, Western Cape, South Africa",
          query: "Atlantis Dunes Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-quad-biking", 4),
        touristComments: [
          {
            name: "Marcus",
            country: "UK",
            text: "The dunes were epic! The quad bike handled beautifully and the guide took us on an unforgettable route.",
          },
          {
            name: "Sarah",
            country: "US",
            text: "Such an adrenaline rush – it felt like we were in a movie, shredding across endless sand.",
          },
        ],
      },
      {
        id: "return",
        name: "Return to Cape Town",
        time: "13:30",
        duration: "45 min",
        note: "Drop‑off at your hotel",
        description:
          "Wind down on the drive back, arriving at your accommodation with plenty of time to relive the day’s adventures.",
        exactLocation: mapLocation({
          label: "Cape Town Drop‑off Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
    ],

    needToKnow: [
      { text: "Minimum age for shooting: 18 years" },
      { text: "Quad biking requires closed‑toe shoes and long trousers" },
      { text: "A moderate level of fitness is recommended for quad biking" },
      { text: "Itinerary may be adjusted for weather or dune conditions" },
      { text: "2–4 Guests: R9,800 total | 5–7 Guests: R13,400 total (all activities included)" },
    ],

    cancellationPolicy: {
      summary: "Private tour with flexible cancellation up to 48 hours before departure.",
      items: [
        { text: "Free cancellation up to 48 hours before tour start" },
        { text: "Changes subject to availability" },
        { text: "No refund for late cancellations or no-shows" },
      ],
    },

    faqs: [
      {
        question: "Is any experience needed for the shooting or quad biking?",
        answer: "No, both activities are fully guided and suitable for beginners.",
      },
      {
        question: "Are there weight or age restrictions?",
        answer: "Participants must be 18+ for the shooting range. For quad biking, a moderate fitness level is advised; children can ride as passengers with an adult if permitted by the operator.",
      },
      {
        question: "Can we split the activities across different days?",
        answer: "This tour is designed as a single‑day package, but customisation is possible on a private tour – please enquire.",
      },
      {
        question: "What’s included in the group pricing?",
        answer: "The total rate covers all activities, transport, and gear for 2–4 or 5–7 guests respectively.",
      },
    ],

    tags: ["Adventure", "Thrill", "Quad Biking", "Shooting", "Full Day", "Private"],
  },

  {
    id: 16,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Gun Range + Wine Tasting (Constantia/Stellenbosch)",
    slug: "gun-range-wine-tasting",
    canonicalPath: "/tours/gun-range-wine-tasting",

    seo: {
      title: "Gun Range + Wine Tasting Tour Constantia/Stellenbosch | Cape Frontier Tours",
      description:
        "A premium adult‑only experience: supervised shooting session followed by wine tasting at two top estates in Constantia or Stellenbosch. Optional cheese pairing, private transport, and all tasting fees included.",
      keywords: [
        "gun range and wine tasting Cape Town",
        "shooting and wine tour",
        "Constantia wine tasting",
        "Stellenbosch wine tour",
        "adult adventure tour Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/gun-range-wine-tasting"),
    images: getTourImages("adrenaline/gun-range-wine-tasting", 4),

    location: "Cape Town, Constantia / Stellenbosch, South Africa",
    duration: "7 - 8 hours",

    priceBase: 3840,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 3840 },
        { category: "kids under 12", pricePerPerson: 0 },
        { category: "children under 5", pricePerPerson: 0 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
    },

    rating: 4.6,
    stars: 4,
    mainReviewerName: "Charlotte V.",
    mainReviewerCountry: "FR",
    reviewYear: 2026,
    otherReviews: 18,
    mainReview:
      "A sophisticated day out! The shooting was a thrill, and the wine estates were stunning. Perfect for couples or a group of friends.",

    description:
      "A premium adult‑only experience blending adrenaline and refinement. Start with a fully supervised shooting session at an accredited range, then journey to the lush vineyards of Constantia or Stellenbosch for curated tastings at two top wine estates. An optional cheese pairing elevates the experience. All private transport and wine tasting fees are included.",

    highlights: [
      { text: "Supervised handgun or rifle shooting experience" },
      { text: "Tasting at two premium wine estates" },
      { text: "Choice of Constantia or Stellenbosch region" },
      { text: "Optional cheese pairing upgrade" },
      { text: "Stunning vineyard and mountain scenery" },
    ],

    included: [
      { text: "Private transport & driver‑guide" },
      { text: "Shooting range session with ammunition" },
      { text: "Wine tasting fees at both estates" },
      { text: "Bottled water on vehicle" },
      { text: "Hotel pickup & drop‑off" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Cheese pairing (optional add‑on)" },
      { text: "Additional wine purchases" },
      { text: "Gratuities" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Pickup from Cape Town",
        time: "08:00",
        duration: "30 min",
        note: "Hotel or central pickup point",
        description:
          "Your private driver‑guide collects you in comfort and heads to the shooting range.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "gun-range",
        name: "Accredited Shooting Range",
        time: "08:30",
        duration: "1.5 hours",
        note: "Safety briefing and session",
        description:
          "Enjoy a professional, fully supervised shooting session with a qualified instructor. All safety gear provided.",
        exactLocation: mapLocation({
          label: "Shooting Range Cape Town",
          address: "Cape Town area, Western Cape, South Africa",
          query: "shooting range Cape Town",
        }),
        images: getTourImages("adrenaline/gun-range-wine-tasting", 1),
        touristComments: [
          {
            name: "Charlotte",
            country: "FR",
            text: "The shooting was surprisingly elegant – a great start to a classy day.",
          },
        ],
      },
      {
        id: "wine-estates",
        name: "Wine Tasting at Two Estates",
        time: "10:30",
        duration: "2.5 hours",
        note: "Curated tastings in Constantia or Stellenbosch",
        description:
          "Travel to the winelands of your choice – historic Constantia or the vibrant Stellenbosch valley. Visit two handpicked estates for guided tastings of their signature wines. Optional cheese pairing available on request.",
        exactLocation: mapLocation({
          label: "Stellenbosch Wine Route",
          address: "Stellenbosch, Western Cape, South Africa",
          query: "Stellenbosch wine route",
        }),
        images: getTourImages("adrenaline/gun-range-wine-tasting", 3),
        touristComments: [
          {
            name: "Thomas",
            country: "UK",
            text: "Both estates were beautiful and the wines were superb. The cheese pairing made it extra special.",
          },
        ],
      },
      {
        id: "return",
        name: "Return to Cape Town",
        time: "13:30",
        duration: "45 min",
        note: "Drop‑off at your hotel",
        description:
          "Sit back and enjoy the scenic drive back, with memories of a perfectly balanced day.",
        exactLocation: mapLocation({
          label: "Cape Town Drop‑off Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
    ],

    needToKnow: [
      { text: "This tour is exclusively for adults 18 years and older" },
      { text: "A valid ID is required at the shooting range" },
      { text: "Wine estates may vary based on availability; Constantia or Stellenbosch confirmed at booking" },
      { text: "Cheese pairing is optional and can be added at time of booking" },
      { text: "2–4 Guests: R7,680 total | 5–7 Guests: R10,600 total (all shooting and tasting fees included)" },
    ],

    cancellationPolicy: {
      summary: "Flexible private tour with full refund up to 48 hours before start.",
      items: [
        { text: "Free cancellation up to 48 hours before tour start" },
        { text: "Changes subject to availability" },
        { text: "No refund for late cancellations or no-shows" },
      ],
    },

    faqs: [
      {
        question: "Is this tour suitable for children?",
        answer: "No, the tour is adult‑only (18+) due to the shooting activity.",
      },
      {
        question: "Can we choose between Constantia and Stellenbosch?",
        answer: "Yes, you can select your preferred wine region when booking, subject to estate availability.",
      },
      {
        question: "Is the cheese pairing included?",
        answer: "The cheese pairing is an optional extra. Please request it when making your booking.",
      },
      {
        question: "Are wine tastings included?",
        answer: "Yes, tasting fees at two wine estates are fully included.",
      },
    ],

    tags: ["Adventure", "Wine Tasting", "Adult-Only", "Full Day", "Private"],
  },

  {
    id: 17,
    type: TOUR_TYPES.HISTORICAL,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Robben Island Half Day Tour",
    slug: "robben-island-half-day",
    canonicalPath: "/tours/robben-island-half-day",

    seo: {
      title: "Robben Island Half Day Tour from Cape Town | Cape Frontier Tours",
      description:
        "Visit the UNESCO World Heritage Site where Nelson Mandela was imprisoned. Includes return ferry, guided prison and island bus tour, hotel pickup, and bottled water. A powerful journey through South Africa's history.",
      keywords: [
        "Robben Island tour",
        "Nelson Mandela prison tour",
        "Cape Town historical tour",
        "Robben Island ferry ticket",
        "Robben Island Museum",
        "half day tour Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/robben-island"),
    images: getTourImages("historical/robben-island", 4),

    location: "Robben Island, Cape Town, South Africa",
    duration: "4 - 5 hours",

    priceBase: 1990,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 1990 },
        { category: "kids under 12", pricePerPerson: 995 },
        { category: "children under 5", pricePerPerson: 0 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
    },

    rating: 4.8,
    stars: 5,
    mainReviewerName: "Linda M.",
    mainReviewerCountry: "UK",
    reviewYear: 2026,
    otherReviews: 42,
    mainReview:
      "An absolutely moving experience. Hearing the stories from a former political prisoner made history come alive. Well organised and unforgettable.",

    description:
      "Robben Island, a UNESCO World Heritage Site, stands as a symbol of the triumph of the human spirit over oppression. Embark on a half‑day journey to the island where Nelson Mandela and many other freedom fighters were imprisoned. Includes a return ferry trip, a guided tour of the maximum‑security prison, a bus tour of the island, and a visit to Mandela’s cell – often led by a former inmate who shares first‑hand accounts.",

    highlights: [
      { text: "Return ferry ticket across Table Bay" },
      { text: "Guided prison tour with a former inmate" },
      { text: "See Nelson Mandela’s cell" },
      { text: "Island bus tour – wildlife, lepers’ graveyard, lime quarry" },
      { text: "Hotel pick‑up & drop‑off from central Cape Town" },
      { text: "Professional driver‑guide for the land transfer" },
    ],

    included: [
      { text: "Return ferry ticket" },
      { text: "Guided Robben Island tour" },
      { text: "Hotel pick‑up & drop‑off (Cape Town CBD, Green Point, Sea Point)" },
      { text: "Air‑conditioned vehicle" },
      { text: "Bottled water" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Personal purchases" },
      { text: "Gratuities" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Hotel Pickup",
        time: "08:00",
        duration: "30 min",
        note: "Pickup from Cape Town CBD, Green Point, or Sea Point",
        description:
          "Your driver‑guide collects you from your accommodation in the designated areas and transfers you to the V&A Waterfront.",
        exactLocation: mapLocation({
          label: "Cape Town CBD Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "ferry",
        name: "Nelson Mandela Gateway",
        time: "08:30",
        duration: "30 min",
        note: "Boarding and ferry departure",
        description:
          "Arrive at the Nelson Mandela Gateway at the V&A Waterfront. After a short check‑in, board the ferry for the 30‑minute crossing to Robben Island.",
        exactLocation: mapLocation({
          label: "Nelson Mandela Gateway",
          address: "V&A Waterfront, Cape Town, South Africa",
          query: "Nelson Mandela Gateway Cape Town",
        }),
        images: getTourImages("historical/robben-island", 1),
        touristComments: [],
      },
      {
        id: "robben-island-tour",
        name: "Robben Island Tour",
        time: "09:00",
        duration: "3.5 hours",
        note: "Guided prison and island bus tour",
        description:
          "The tour of Robben Island includes a bus journey around the island with commentary, a visit to the lime quarry, and a moving guided walk through the maximum‑security prison. A highlight is standing outside Nelson Mandela’s cell. Ex‑political prisoners often lead the prison section, sharing personal stories of resilience.",
        exactLocation: mapLocation({
          label: "Robben Island Museum",
          address: "Robben Island, Cape Town, South Africa",
          query: "Robben Island Cape Town",
        }),
        images: getTourImages("historical/robben-island", 4),
        touristComments: [
          {
            name: "Linda",
            country: "UK",
            text: "Standing in Mandela’s cell was surreal. The ex‑prisoner guide made the history tangible and inspiring.",
          },
          {
            name: "Michael",
            country: "ZA",
            text: "A must‑do for anyone visiting Cape Town. The ferry ride offers great views of Table Mountain.",
          },
        ],
      },
      {
        id: "return-ferry",
        name: "Ferry Return & Drop‑off",
        time: "12:30",
        duration: "1 hour",
        note: "Ferry crossing and hotel drop‑off",
        description:
          "Board the ferry back to the V&A Waterfront, where your driver‑guide will meet you and transfer you safely back to your hotel.",
        exactLocation: mapLocation({
          label: "V&A Waterfront Drop‑off",
          address: "V&A Waterfront, Cape Town, South Africa",
          query: "V&A Waterfront Cape Town",
        }),
        images: [],
        touristComments: [],
      },
    ],

    needToKnow: [
      { text: "Book well in advance – ferry tickets sell out quickly" },
      { text: "Morning and afternoon departures available (subject to ferry schedule)" },
      { text: "Bring a warm jacket – it can be cold and windy on the ferry" },
      { text: "The tour involves walking; wear comfortable shoes" },
      { text: "Pickup only from Cape Town CBD, Green Point, and Sea Point" },
    ],

    cancellationPolicy: {
      summary: "Ticket‑based tour. Cancellation possible up to 48 hours before departure.",
      items: [
        { text: "Free cancellation up to 48 hours before tour start" },
        { text: "Ferry tickets are non‑refundable if already issued" },
        { text: "No refund for late cancellations or no‑shows" },
      ],
    },

    faqs: [
      {
        question: "Do I need to book in advance?",
        answer: "Yes, Robben Island tours sell out weeks ahead, especially in high season.",
      },
      {
        question: "How long is the ferry ride?",
        answer: "The crossing takes approximately 30 minutes each way.",
      },
      {
        question: "Is the tour suitable for children?",
        answer: "Yes, the tour is family‑friendly, though the prison history may be intense for very young children.",
      },
      {
        question: "Are food and drinks available?",
        answer: "A café is available on the island, but lunch is not included in the tour price.",
      },
    ],

    tags: ["Historical", "Cultural", "Half Day", "Shared"],
  },

  {
    id: 18,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Horse Riding, Penguins & Cape Point Full‑Day Tour",
    slug: "horse-riding-penguins-cape-point",
    canonicalPath: "/tours/horse-riding-penguins-cape-point",

    seo: {
      title: "Horse Riding, Penguins & Cape Point Full‑Day Tour from Cape Town | Cape Frontier Tours",
      description:
        "Ultimate Cape Peninsula adventure: beach horse ride at Noordhoek, Boulders penguin colony, and Cape Point & Cape of Good Hope. Private tour with driver‑guide, all entry fees, Chapman's Peak tolls, and water included.",
      keywords: [
        "Noordhoek beach horse riding",
        "Boulders Beach penguins",
        "Cape Point tour",
        "Cape Peninsula private tour",
        "Cape Town horse riding and penguins",
        "full day Cape Peninsula tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adventure/horse-riding-penguins-cape-point"),
    images: getTourImages("adventure/horse-riding-penguins-cape-point", 4),

    location: "Cape Town & Cape Peninsula, South Africa",
    duration: "8 - 9 hours",

    priceBase: 5780,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 11560 },
        { category: "kids under 12", pricePerPerson: 5780 },
        { category: "children under 5", pricePerPerson: 0 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
    },

    rating: 4.9,
    stars: 5,
    mainReviewerName: "Isabella G.",
    mainReviewerCountry: "IT",
    reviewYear: 2026,
    otherReviews: 31,
    mainReview:
      "Absolutely magical day! The beach ride was serene, the penguins were adorable, and Cape Point's views took our breath away. Worth every penny for a private tour.",

    description:
      "Experience the ultimate Cape Peninsula adventure blending beach horse riding, African penguins, and the dramatic landscapes of Cape Point & the Cape of Good Hope. Ideal for couples, families, and nature lovers, this private tour includes a scenic Chapman's Peak drive, all entry fees, and a professional driver‑guide, ensuring a flexible, unforgettable day.",

    highlights: [
      { text: "1–2 hour guided horse ride on Noordhoek Beach" },
      { text: "Chapman’s Peak scenic drive with photo stops" },
      { text: "Visit the Boulders Beach African penguin colony" },
      { text: "Explore Cape Point & Cape of Good Hope" },
      { text: "Wildlife sightings (baboons, ostriches, antelope)" },
      { text: "Private transport with flexible itinerary" },
    ],

    included: [
      { text: "Private vehicle & professional driver‑guide" },
      { text: "Chapman’s Peak toll fees" },
      { text: "Horse riding fee (1–2 hours)" },
      { text: "Boulders Beach entry fee" },
      { text: "Cape Point entry fee" },
      { text: "Bottled water" },
      { text: "Hotel pickup & drop‑off" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Funicular ride at Cape Point (optional)" },
      { text: "Gratuities" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Hotel Pickup",
        time: "08:00",
        duration: "30 min",
        note: "Pickup from Cape Town & surrounds",
        description:
          "Your private driver‑guide meets you at your accommodation and the journey begins along the Atlantic Seaboard.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "chapmans-peak",
        name: "Chapman's Peak Drive",
        time: "08:30",
        duration: "45 min",
        note: "Scenic coastal drive with photo stops",
        description:
          "Wind along the iconic Chapman's Peak Drive, one of the world's most spectacular coastal roads, with stops for photos overlooking Hout Bay.",
        exactLocation: mapLocation({
          label: "Chapman's Peak Drive Lookout",
          address: "Chapman's Peak Drive, Hout Bay, Cape Town, South Africa",
          query: "Chapman's Peak Drive Cape Town",
        }),
        images: getTourImages("adventure/horse-riding-penguins-cape-point", 1),
        touristComments: [
          {
            name: "Isabella",
            country: "IT",
            text: "The views were even more stunning than the postcards. Perfect start to the day.",
          },
        ],
      },
      {
        id: "horse-riding",
        name: "Noordhoek Beach Horse Riding",
        time: "09:30",
        duration: "1.5 - 2 hours",
        note: "Guided beach horse ride – all levels welcome",
        description:
          "Arrive at Noordhoek and meet your calm, well‑trained horse. Ride along a pristine stretch of white sand with mountain and ocean backdrops – an unforgettable experience for beginners and experienced riders alike.",
        exactLocation: mapLocation({
          label: "Noordhoek Beach",
          address: "Noordhoek, Cape Town, South Africa",
          query: "Noordhoek Beach Cape Town",
        }),
        images: getTourImages("adventure/horse-riding-penguins-cape-point", 2),
        touristComments: [
          {
            name: "Isabella",
            country: "IT",
            text: "Riding on that endless beach felt like a dream. The horses were so gentle.",
          },
        ],
      },
      {
        id: "boulders-beach",
        name: "Boulders Beach Penguin Colony",
        time: "12:00",
        duration: "1 hour",
        note: "African penguins up close",
        description:
          "Continue to Simon’s Town and stroll the boardwalks of Boulders Beach. Observe the charming African penguin colony waddling among granite boulders and crystal‑clear waters.",
        exactLocation: mapLocation({
          label: "Boulders Beach",
          address: "Simon's Town, Western Cape, South Africa",
          query: "Boulders Beach Simon's Town",
        }),
        images: getTourImages("adventure/horse-riding-penguins-cape-point", 1),
        touristComments: [
          {
            name: "Liam",
            country: "UK",
            text: "Could have watched the penguins for hours – so cute and the setting is beautiful.",
          },
        ],
      },
      {
        id: "cape-point",
        name: "Cape Point & Cape of Good Hope",
        time: "13:30",
        duration: "2 hours",
        note: "Lighthouse, wildlife, and dramatic cliffs",
        description:
          "Enter the Cape Point Nature Reserve. Visit the Cape of Good Hope and take the funicular (optional) up to the historic lighthouse for sweeping ocean views. Keep an eye out for baboons, ostriches, and antelope.",
        exactLocation: mapLocation({
          label: "Cape Point Nature Reserve",
          address: "Cape Point, Cape Peninsula, South Africa",
          query: "Cape Point Cape of Good Hope",
        }),
        images: getTourImages("adventure/horse-riding-penguins-cape-point", 3),
        touristComments: [
          {
            name: "Sophie",
            country: "FR",
            text: "Cape Point is a must‑see. The cliffs and waves are awe‑inspiring.",
          },
        ],
      },
      {
        id: "return",
        name: "Return to Cape Town",
        time: "16:00",
        duration: "1.5 hours",
        note: "Scenic drive back",
        description:
          "Relax as your driver‑guide returns you to your hotel via the scenic coastal route, full of memories.",
        exactLocation: mapLocation({
          label: "Cape Town Drop‑off Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
    ],

    needToKnow: [
      { text: "Maximum weight for horse riding: 95 kg" },
      { text: "Wear long trousers and closed‑toe shoes for the ride" },
      { text: "Itinerary can be adjusted to suit your pace" },
      { text: "1–4 Guests: R11,560 total | 5–7 Guests: R17,300 total" },
      { text: "All entry fees and Chapman’s Peak toll included" },
    ],

    cancellationPolicy: {
      summary: "Private tour with flexible cancellation up to 48 hours before departure.",
      items: [
        { text: "Free cancellation up to 48 hours before tour start" },
        { text: "Changes subject to availability" },
        { text: "No refund for late cancellations or no-shows" },
      ],
    },

    faqs: [
      {
        question: "Is horse riding experience required?",
        answer: "No, the ride is suitable for beginners. The horses are calm and well‑trained.",
      },
      {
        question: "What is the weight limit for horse riding?",
        answer: "The weight limit is 95 kg (about 15 stone) for the horses’ well‑being.",
      },
      {
        question: "Are entrance fees to Boulders Beach and Cape Point included?",
        answer: "Yes, both are included in the tour price.",
      },
      {
        question: "Can we add lunch to the tour?",
        answer: "Lunch is not included, but your guide can suggest excellent local restaurants along the route.",
      },
      {
        question: "How does pricing work for larger groups?",
        answer: "The total price is R11,560 for 1–4 guests and R17,300 for 5–7 guests, all inclusions covered.",
      },
    ],

    tags: ["Adventure", "Wildlife", "Sightseeing", "Full Day", "Private"],
  },

  {
    id: 19,
    type: TOUR_TYPES.HISTORICAL,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Robben Island + Langa Township Tour",
    slug: "robben-island-langa-combo",
    canonicalPath: "/tours/robben-island-langa",

    seo: {
      title: "Robben Island + Langa Township Full‑Day Tour | Cape Town Cultural Experience",
      description:
        "Powerful full‑day combo: morning ferry to Robben Island for the prison and island tour, afternoon cultural walk through Langa. Includes all transport, guides, ferry ticket, entry fees, and bottled water. R3,290 per person.",
      keywords: [
        "Robben Island and Langa tour",
        "Cape Town full day cultural tour",
        "Robben Island prison tour",
        "Langa township experience",
        "combined historical tour Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/robben-island-langa"),
    images: getTourImages("historical/robben-island-langa", 4),

    location: "Robben Island & Langa, Cape Town, South Africa",
    duration: "6 - 7 hours",

    priceBase: 3290,
    minPeople: 1,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 3290 },
        { category: "kids under 12", pricePerPerson: 1645 },
        { category: "children under 5", pricePerPerson: 0 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
    },

    rating: 4.9,
    stars: 5,
    mainReviewerName: "Daniel M.",
    mainReviewerCountry: "CA",
    reviewYear: 2026,
    otherReviews: 34,
    mainReview:
      "A perfect full‑day immersion. Robben Island was deeply moving, and walking through Langa with a local guide gave us hope and connection. Well worth it.",

    description:
      "This powerful full‑day experience combines two of Cape Town’s most meaningful cultural and historical sites. The morning takes you to Robben Island – a UNESCO World Heritage Site where Nelson Mandela spent 18 years in prison – for a guided bus and prison tour led by a former political prisoner. The afternoon shifts to Langa, Cape Town’s oldest township, for an immersive cultural walk, a visit to the Guga S’thebe Arts & Culture Centre, and a craft market stop. All transport, guides, ferry ticket, entry fees, and bottled water are included.",

    highlights: [
      { text: "Return ferry to Robben Island with Table Mountain views" },
      { text: "Guided island bus tour (leper church, lime quarry, Sobukwe house)" },
      { text: "Maximum‑security prison tour – see Mandela’s original cell" },
      { text: "Langa township cultural walk with local community guide" },
      { text: "Guga S’thebe Arts & Culture Centre visit" },
      { text: "Craft market stop – support local artisans" },
    ],

    included: [
      { text: "Hotel pick‑up & drop‑off (Cape Town CBD, Green Point, Sea Point)" },
      { text: "Air‑conditioned vehicle & professional driver‑guide" },
      { text: "Robben Island return ferry ticket" },
      { text: "Robben Island guided tour (bus + prison)" },
      { text: "Langa community guide" },
      { text: "Guga S’thebe Cultural Centre visit" },
      { text: "Cultural walk through Langa" },
      { text: "Craft market stop" },
      { text: "Bottled water" },
      { text: "All entry fees" },
    ],

    excluded: [
      { text: "Lunch" },
      { text: "Personal purchases" },
      { text: "Gratuities" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "pickup",
        name: "Hotel Pickup",
        time: "08:00",
        duration: "30 min",
        note: "Pickup from Cape Town CBD, Green Point, or Sea Point",
        description:
          "Your driver‑guide meets you at your accommodation and drives you to the V&A Waterfront.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town City Centre, Cape Town, South Africa",
          query: "Cape Town City Centre",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "ferry",
        name: "Nelson Mandela Gateway & Ferry",
        time: "08:30",
        duration: "30 min",
        note: "Check‑in and ferry crossing",
        description:
          "Board the ferry at the Nelson Mandela Gateway for a scenic 30‑minute crossing to Robben Island, with panoramic views of Table Mountain.",
        exactLocation: mapLocation({
          label: "Nelson Mandela Gateway",
          address: "V&A Waterfront, Cape Town, South Africa",
          query: "Nelson Mandela Gateway Cape Town",
        }),
        images: getTourImages("historical/robben-island-langa", 1),
        touristComments: [],
      },
      {
        id: "robben-island",
        name: "Robben Island Tour",
        time: "09:00",
        duration: "3.5 hours",
        note: "Bus tour and maximum‑security prison walk",
        description:
          "A guided bus tour takes you around the island – see the leper church, the lime quarry, Robert Sobukwe’s house, and WWII bunkers. Then walk through the maximum‑security prison with a former political prisoner, standing outside Nelson Mandela’s original cell and hearing personal stories of the anti‑apartheid struggle.",
        exactLocation: mapLocation({
          label: "Robben Island Museum",
          address: "Robben Island, Cape Town, South Africa",
          query: "Robben Island Cape Town",
        }),
        images: getTourImages("historical/robben-island-langa", 3),
        touristComments: [
          {
            name: "Daniel",
            country: "CA",
            text: "Our guide was a former inmate – his story made the history palpable. A truly humbling experience.",
          },
        ],
      },
      {
        id: "return-ferry",
        name: "Ferry Return & Transfer",
        time: "12:30",
        duration: "1 hour",
        note: "Scenic ferry back and drive to Langa",
        description:
          "Return to the Waterfront by ferry, where your driver‑guide meets you for the short drive to Langa. A quick stop to buy lunch (own cost) can be arranged.",
        exactLocation: mapLocation({
          label: "V&A Waterfront",
          address: "V&A Waterfront, Cape Town, South Africa",
          query: "V&A Waterfront Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "langa",
        name: "Langa Township Cultural Experience",
        time: "13:30",
        duration: "2 hours",
        note: "Guga S’thebe, cultural walk & craft market",
        description:
          "Meet your local Langa guide at the Guga S’thebe Arts & Culture Centre. Explore art studios, ceramic workshops, and music spaces. Then walk the streets to learn about traditional and modern life, community upliftment projects, and Langa’s vibrant culture. End at a craft market where you can buy handmade crafts directly from artisans.",
        exactLocation: mapLocation({
          label: "Langa Township",
          address: "Langa, Cape Town, South Africa",
          query: "Langa Cape Town",
        }),
        images: getTourImages("historical/robben-island-langa", 2),
        touristComments: [
          {
            name: "Amina",
            country: "UK",
            text: "The craft market was the perfect end – I loved supporting local makers and hearing their stories.",
          },
        ],
      },
      {
        id: "return-hotel",
        name: "Return to Cape Town",
        time: "15:30",
        duration: "30 min",
        note: "Drop‑off at your hotel",
        description:
          "After a deeply enriching day, your driver‑guide returns you to your accommodation.",
        exactLocation: mapLocation({
          label: "Cape Town Drop‑off Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
    ],

    needToKnow: [
      { text: "Book at least 2–3 weeks ahead – Robben Island tickets sell out fast" },
      { text: "Ferry schedule may change due to weather; morning departure recommended" },
      { text: "Langa is safe when exploring with a local guide; dress respectfully" },
      { text: "Ask before photographing people or private homes" },
      { text: "Comfortable walking shoes and a hat are advised" },
    ],

    cancellationPolicy: {
      summary: "Flexible cancellation up to 48 hours before the tour. Ferry tickets are non‑refundable once issued.",
      items: [
        { text: "Free cancellation up to 48 hours before tour start" },
        { text: "Changes subject to availability" },
        { text: "No refund for late cancellations or no‑shows" },
      ],
    },

    faqs: [
      {
        question: "Is the ferry ticket included?",
        answer: "Yes, the return ferry ticket for Robben Island is fully included in the price.",
      },
      {
        question: "Can the order of activities be reversed?",
        answer: "The morning Robben Island slot is fixed due to ferry schedules; the afternoon Langa visit follows directly.",
      },
      {
        question: "What should I bring?",
        answer: "A warm layer for the ferry, comfortable walking shoes, sun protection, and a camera – with respect for photography guidelines.",
      },
      {
        question: "Is lunch included?",
        answer: "Lunch is not included, but your guide will recommend spots for a quick bite between activities.",
      },
    ],

    tags: ["Historical", "Cultural", "Heritage", "Full Day", "Shared"],
  },

  {
    id: 20,
    type: TOUR_TYPES.ADVENTURE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Horse Riding – The Dunes",
    slug: "horse-riding-the-dunes",
    canonicalPath: "/tours/horse-riding-the-dunes",

    seo: {
      title: "Horse Riding at The Dunes, Noordhoek | Cape Frontier Tours",
      description:
        "All‑inclusive guided horse ride through the dunes and along Noordhoek Beach. Meet at the stables, bottled water included. R2,250 per person for 2 or more riders. No experience needed.",
      keywords: [
        "horse riding Cape Town dunes",
        "Noordhoek Beach horse ride",
        "dune horse riding experience",
        "Cape Town horse tours",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adventure/horse-riding-dunes"),
    images: getTourImages("adventure/horse-riding-dunes", 3),

    location: "Noordhoek, Cape Town, South Africa",
    duration: "1.5 - 2 hours",

    priceBase: 2250,
    minPeople: 2,
    baseCurrency: "ZAR",
    supportedCurrencies: SUPPORTED_CURRENCIES,

    pricing: {
      categories: [
        { category: "adults", pricePerPerson: 2250 },
      ],
      groupDiscount: {
        enabled: false,
        icon: "",
        rules: [],
      },
    },

    rating: 4.6,
    stars: 4,
    mainReviewerName: "Chloe B.",
    mainReviewerCountry: "ZA",
    reviewYear: 2026,
    otherReviews: 15,
    mainReview:
      "A magical ride through the dunes and along the beach. The horses were gentle, and the guide gave great tips.",

    description:
      "Saddle up for a peaceful guided horse ride through the rolling dunes and onto the wide sands of Noordhoek Beach. Fully supervised and suitable for all levels, this all‑inclusive experience includes bottled water and meeting at the stables – just bring your sense of adventure.",

    highlights: [
      { text: "Ride through scenic dunes and onto the beach" },
      { text: "Suitable for beginners and experienced riders" },
      { text: "Bottled water included" },
      { text: "Meet at the stables – no transport fuss" },
    ],

    included: [
      { text: "Guided horse ride (approx. 1.5–2 hours)" },
      { text: "Safety briefing & helmet" },
      { text: "Bottled water" },
    ],

    excluded: [
      { text: "Transport (meet at location)" },
      { text: "Meals" },
      { text: "Gratuities" },
    ],

    pickupOptions: [
      "Meet at Noordhoek Stables",
    ],

    stops: [
      {
        id: "meeting",
        name: "Meeting at The Stables",
        time: "09:00",
        duration: "20 min",
        note: "Check‑in and safety briefing",
        description:
          "Arrive at the stables near Noordhoek Beach, meet your guide, and receive a short briefing before mounting.",
        exactLocation: mapLocation({
          label: "Noordhoek Horse Stables",
          address: "Noordhoek, Cape Town, South Africa",
          query: "Noordhoek horse riding stables",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "ride",
        name: "Dune & Beach Ride",
        time: "09:20",
        duration: "1.5 - 2 hours",
        note: "Walk, trot, or canter depending on experience",
        description:
          "Ride through coastal fynbos, over sand dunes, and onto the endless stretch of Noordhoek Beach. Your guide will tailor the pace and route to the group’s confidence.",
        exactLocation: mapLocation({
          label: "Noordhoek Beach",
          address: "Noordhoek, Cape Town, South Africa",
          query: "Noordhoek Beach",
        }),
        images: getTourImages("adventure/horse-riding-dunes", 3),
        touristComments: [
          {
            name: "Chloe",
            country: "ZA",
            text: "The dunes made it feel like another world. And the beach canter was the best feeling ever!",
          },
        ],
      },
    ],

    needToKnow: [
      { text: "Maximum weight: 95 kg" },
      { text: "Wear long trousers and closed‑toe shoes" },
      { text: "Minimum 2 people to book" },
      { text: "No experience necessary – all rides are guided" },
      { text: "Meet directly at the stables (self‑drive)" },
    ],

    cancellationPolicy: {
      summary: "Flexible cancellation up to 48 hours before the ride.",
      items: [
        { text: "Free cancellation up to 48 hours before start time" },
        { text: "Changes subject to availability" },
        { text: "No refund for late cancellations or no‑shows" },
      ],
    },

    faqs: [
      {
        question: "Can I book as a single rider?",
        answer: "A minimum of 2 people is required per booking.",
      },
      {
        question: "Is the ride suitable for beginners?",
        answer: "Yes, the route and horses are chosen to suit all experience levels.",
      },
      {
        question: "Where exactly are the stables?",
        answer: "The stables are in Noordhoek, near the beach. Exact address provided upon booking.",
      },
    ],

    tags: ["Adventure", "Nature", "Horse Riding", "Half Day"],
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
