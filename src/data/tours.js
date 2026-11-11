export const TOUR_TYPES = {
  ADRENALINE: "adrenaline",
  HIKING: "hiking",
  PACKAGES: "packages",
  HISTORICAL: "historical",
};

export const TOUR_MODIFIERS = {
  HALF_DAY: "half-day",
  FULL_DAY: "full-day",
  MULTI_DAY: "multi-day",
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

// supported currencies
export const FX_RATES = {
  ZAR: 1,
  USD: 0.054,
  EUR: 0.05,
  GBP: 0.043,
  CAD: 0.075,
  AUD: 0.082,
  // ...one entry per code in CURRENCIES
};
export const SUPPORTED_CURRENCIES = Object.keys(FX_RATES);

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
    (imageNumber) => `/src/assets/images/tours/${folder}/${imageNumber}.webp`,
  );

const getCoverImage = (folder) => `/src/assets/images/tours/${folder}/1.webp`;

const getDestinationImages = (
  baseFolder,
  destinationFolder,
  imageIndexes = 3,
) => getTourImages(`${baseFolder}/${destinationFolder}`, imageIndexes);

const packageGallery = (baseFolder, stopFolders, imageIndexes = 3) =>
  stopFolders.flatMap((folder) =>
    getDestinationImages(baseFolder, folder, imageIndexes),
  );

const packageDestinationGalleries = (
  baseFolder,
  stopFolders,
  imageIndexes = 3,
) =>
  stopFolders.map((folder) => ({
    folder,
    cover: getCoverImage(`${baseFolder}/${folder}`),
    images: getDestinationImages(baseFolder, folder, imageIndexes),
  }));

const getGoogleMapsSearchUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
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
const PENINSULA_PACKAGE_ONE_BASE = "packages/cape-town-city-tour";
const PENINSULA_PACKAGE_TWO_BASE = "packages/peninsula-tour";
const STELLENBOSCH_WINE_BASE = "packages/wine-farms";
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

/*
adrenaline - shark, gun-range, paragliding, 2hr-cobra, 
hiking - 
historical - 
packages - 
*/

export const tours = [
  // =========================================== ADRENALINE
  // HALF_DAY
  //Shark-cage-diving
  {
    id: 1, // New tour ID to be assigned (e.g., 20)
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Shark Cage Diving",
    slug: "shark-cage-diving-gansbaai",
    canonicalPath: "/tours/shark-cage-diving-gansbaai",
    description:
      "Experience one of South Africa's most thrilling ocean encounters — Shark Cage Diving in Gansbaai, the global hotspot for Great White Sharks. This all‑inclusive adventure includes hotel pick‑up and drop‑off in Cape Town, professional crew, and a safe, unforgettable dive experience.",

    seo: {
      title: "Shark Cage Diving in Gansbaai | Cape Frontier Tours",
      description:
        "Experience one of South Africa's most thrilling ocean encounters — Shark Cage Diving in Gansbaai, the global hotspot for Great White Sharks. This all‑inclusive adventure includes hotel pick‑up and drop‑off in Cape Town, professional crew, and a safe, unforgettable dive experience.",
      keywords: [
        "shark cage diving Gansbaai",
        "great white shark diving South Africa",
        "Gansbaai shark diving",
        "Cape Town shark diving tour",
        "shark cage diving Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: "/src/assets/images/tours/adrenaline/shark-cage-diving/1.webp",
    images: [
      "/src/assets/images/tours/adrenaline/shark-cage-diving/1.webp",
      "/src/assets/images/tours/adrenaline/shark-cage-diving/2.webp",
      "/src/assets/images/tours/adrenaline/shark-cage-diving/3.webp",
    ],
    imageFolder: "adrenaline/shark-cage-diving",

    videos: [],

    location: "Gansbaai, South Africa",
    duration: "4 - 5 hours",

    priceBase: 4900,
    minPeople: 2,
    minAge: 12,
    childFriendly: true,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 4900,
        note: "Minimum two participants required.",
      },
      {
        category: "Teens",
        pricePerPerson: 4900,
        note: "Teens are charged at full adult-rate.",
      },
      {
        category: "Children",
        pricePerPerson: 2400,
        note: "",
      },
      {
        category: "Toddler",
        pricePerPerson: 0,
        note: "Free of charge for children under 5 years old.",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 6,
          maxPeople: 10,
          perPerson: 4750,
          label: "6–10 Guests",
          note: "Applies to adults only • Private vehicle • All-inclusive",
        },
      ],
    },

    highlights: [
      { text: "Close‑up shark encounters" },
      { text: "Safe steel cage with professional supervision" },
      { text: "Scenic drive through the Overberg region" },
      { text: "Marine biologist briefing" },
      { text: "Optional photo & video packages" },
    ],

    included: [
      { text: "Reliable driver transport with passenger liability" },
      { text: "Light breakfast / lunch" },
      { text: "Bottled water" },
      { text: "Safety briefing and equipment" },
      { text: "Professional crew and supervision" },
    ],

    excluded: [
      {
        text: "Tour photos and videos (available on request – operator charge)",
      },
      { text: "Personal purchases" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Sea Point",
      "Camps Bay",
      "V&A Waterfront",
      "Custom pickup on request",
    ],

    arrangements: {
      availability: "",
      duration: "",
      operatingTime: "",
      departure: "",
      return: "",
      location: "",
      clothing: [],
      thingsToBring: [
        "Warm jacket",
        "Swimwear (optional)",
        "Sunscreen",
        "Motion-sickness tablets (if needed)",
        "Camera",
      ],
      passengerPolicy: "",
      sunsetNote: "",
    },

    weatherPolicy: {
      summary:
        "Weather-dependent activity. Ocean conditions may affect departure times.",
      items: [
        { text: "Weather can affect departure times" },
        { text: "Final departure time is confirmed close to the date" },
      ],
    },

    cancellationPolicy: {
      summary:
        "Weather-dependent activity. Final cancellation terms to be confirmed.",
      items: [
        { text: "Ocean conditions may affect timing or availability" },
        { text: "Rescheduling may be offered if conditions are unsuitable" },
        { text: "Refund rules must be confirmed with the operator" },
      ],
    },

    safetyPolicy: {
      summary:
        "All dives are conducted by certified professionals with full compliance to South African marine safety regulations.",
      items: [],
    },

    stops: [
      {
        id: "hotel-pickup",
        name: "Hotel Pickup",
        time: "07:00 – 07:15",
        duration: "15 min",
        note: "Pickup from selected Cape Town hotels",
        description:
          "Your day begins with a convenient pickup from your selected Cape Town hotel before departing for Gansbaai.",
        exactLocation: mapLocation({
          label: "Cape Town Hotel Pickup Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: ["/src/assets/images/tours/shared/pickup/1.webp"],
        touristComments: [],
      },
      {
        id: "drive-to-gansbaai",
        name: "Scenic Drive to Gansbaai",
        time: "07:15 – 09:30",
        duration: "2 hr 15 min",
        note: "Journey along the Overberg region",
        description:
          "Relax during the scenic drive from Cape Town to Gansbaai Harbour while your guide shares information about the coastline and marine wildlife.",
        exactLocation: mapLocation({
          label: "Gansbaai",
          address: "Gansbaai, Western Cape, South Africa",
          query: "Gansbaai Western Cape",
        }),
        touristComments: [],
        images: ["/src/assets/images/tours/shared/gansbaai/1.webp"],
      },
      {
        id: "arrival-briefing",
        name: "Arrival & Safety Briefing",
        time: "09:45",
        duration: "30 min",
        note: "Light breakfast snack included",
        description:
          "Arrive at Gansbaai Harbour, enjoy a light breakfast snack, complete check-in, receive your safety briefing, and get fitted with diving equipment.",
        exactLocation: mapLocation({
          label: "Gansbaai Harbour",
          address: "Gansbaai, Western Cape, South Africa",
          query: "Gansbaai Harbour Western Cape",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "shark-diving",
        name: "Shark Cage Diving",
        time: "10:15 – 13:15",
        duration: "3 hours",
        note: "Main ocean experience",
        description:
          "Board the vessel and experience an unforgettable shark cage diving adventure with experienced guides while enjoying spectacular views of the coastline.",
        exactLocation: mapLocation({
          label: "Gansbaai Harbour",
          address: "Gansbaai, Western Cape, South Africa",
          query: "Gansbaai Harbour Western Cape",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "debrief",
        name: "Hot Drinks & Debrief",
        time: "13:30",
        duration: "30 min",
        note: "Relax after your adventure",
        description:
          "Warm up with complimentary hot drinks or a light meal while the crew shares highlights from the trip before the return journey.",
        exactLocation: mapLocation({
          label: "Gansbaai Harbour",
          address: "Gansbaai, Western Cape, South Africa",
          query: "Gansbaai Harbour Western Cape",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "return-drive",
        name: "Return Journey",
        time: "14:00 – 16:30",
        duration: "2 hr 30 min",
        note: "Transfer back to Cape Town",
        description:
          "Depart Gansbaai and enjoy the scenic drive back to Cape Town.",
        exactLocation: mapLocation({
          label: "Cape Town",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "hotel-dropoff",
        name: "Hotel Drop-off",
        time: "16:30 – 16:45",
        duration: "15 min",
        note: "End of tour",
        description:
          "Arrive back in Cape Town and be dropped off at your original hotel, marking the end of your adventure.",
        exactLocation: mapLocation({
          label: "Cape Town Hotel Drop-off",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
    ],

    // routeInformation: {
    //   title: "",
    //   description: "",
    //   items: [],
    // },

    // vehicle: {
    //   name: "",
    //   class: "",
    //   doors: null,
    //   seats: null,
    //   fuel: "",
    //   gearbox: "",
    //   engine: "",
    //   specifications: [],
    // },

    // securityAndLiability: {
    //   heading: "",
    //   cardPreAuthorisation: {
    //     amount: null,
    //     currency: "",
    //     description: "",
    //     release: "",
    //   },
    //   cashDeposit: {
    //     amountZAR: null,
    //     alternativeAmountUSD: null,
    //     paymentMethod: "",
    //     paidAt: "",
    //     refundPolicy: "",
    //   },
    // },

    needToKnow: [{ text: "No diving experience required" }],

    faqs: [],

    tags: ["Adventure", "Wildlife", "Ocean", "Half Day", "Shark Diving"],
  },
  // Gun-Range
  {
    id: 2, // New tour ID to be assigned (e.g., 21)
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Shooting Experience Packages",
    slug: "shooting-experience-packages",
    canonicalPath: "/tours/shooting-experience-packages",

    seo: {
      title: "Shooting Experience Packages in Cape Town | Cape Frontier Tours",
      description:
        "Experience a thrilling outdoor shooting session at one of Cape Town's accredited licensed gun ranges. Perfect for beginners and experienced shooters, this activity includes full safety instruction, professional supervision, and a variety of firearm options.",
      keywords: [
        "shooting experience Cape Town",
        "gun range Cape Town",
        "firearm experience South Africa",
        "shooting packages Cape Town",
        "adrenaline shooting tour",
        "AK-47 experience Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: "/src/assets/images/tours/adrenaline/gun-range/1.webp",
    images: [
      "/src/assets/images/tours/adrenaline/gun-range/1.webp",
      "/src/assets/images/tours/adrenaline/gun-range/2.webp",
      "/src/assets/images/tours/adrenaline/gun-range/3.webp",
    ],
    imageFolder: "adrenaline/gun-range",

    videos: [],

    location: "Cape Town, South Africa",
    duration: "2 - 3 hours",

    priceBase: 2000,
    minPeople: 2,
    minAge: 18,
    childFriendly: false,

    pricing: [
      {
        category: "2‑Gun Speed Shoot",
        pricePerPerson: 2000,
        note: "30 rounds (15 + 15) • Fast, beginner-friendly, high-adrenaline",
      },
      {
        category: "3‑Gun Zombie Package",
        pricePerPerson: 3000,
        note: "35 rounds (15 + 15 + 5) • AK‑47 experience, mixed firearm types, cinematic feel",
      },
      {
        category: "John Wick 2‑Gun Experience",
        pricePerPerson: 3400,
        note: "100 rounds (50 + 50) • Training-style session, shot timer competition, premium action-movie vibe",
      },
      {
        category: "Sicario 5‑Gun Elite Experience",
        pricePerPerson: 3950,
        note: "55 rounds (15 + 5 + 10 + 10 + 15) • Full tactical variety, 5 iconic firearms, ultimate bucket-list experience",
      },
    ],

    // type: "quanity|fixed|request|external"
    additionalPricing: [
      {
        type: "request",
        category: "Photo & Video Package",
        price: null,
        unit: "per booking",
        currency: "ZAR",
        note: "Available on request",
      },
      {
        type: "request",
        category: "Group Competitions",
        price: null,
        unit: "per booking",
        currency: "ZAR",
        note: "Available on request",
      },
      {
        type: "request",
        category: "Extended Ammunition",
        price: null,
        unit: "per round",
        currency: "ZAR",
        note: "Available on request",
      },
    ],

    options: [
      {
        id: "2-gun-speed-shoot",
        name: "2-Gun Speed Shoot",
        description:
          "30 rounds (15 + 15) • Fast, beginner-friendly, high-adrenaline",
        pricePerPerson: 2000,
      },
      {
        id: "3-gun-zombie",
        name: "3-Gun Zombie Package",
        description:
          "35 rounds (15 + 15 + 5) • AK-47 experience, mixed firearm types, cinematic feel",
        pricePerPerson: 3000,
      },
      {
        id: "john-wick-2-gun",
        name: "John Wick 2-Gun Experience",
        description:
          "100 rounds (50 + 50) • Training-style session, shot timer competition, premium action-movie vibe",
        pricePerPerson: 3400,
      },
      {
        id: "sicario-5-gun",
        name: "Sicario 5-Gun Elite Experience",
        description:
          "55 rounds (15 + 5 + 10 + 10 + 15) • Full tactical variety, 5 iconic firearms, ultimate bucket-list experience",
        pricePerPerson: 3950,
      },
    ],

    groupPricing: {
      enabled: false,
      icon: "",
      tiers: [],
    },

    description:
      "Experience a thrilling outdoor shooting session at one of Cape Town's accredited licensed gun ranges. Perfect for beginners and experienced shooters, this activity includes full safety instruction, professional supervision, and a variety of firearm options.",

    highlights: [
      { text: "Accredited licensed gun range in Cape Town" },
      { text: "Full safety briefing and professional supervision" },
      { text: "Choice of 4 exciting shooting packages" },
      {
        text: "Variety of firearms including handguns, shotguns, carbines, and rifles",
      },
      { text: "Suitable for beginners and experienced shooters" },
      { text: "Training-style sessions with shot timer competition available" },
    ],

    included: [
      { text: "Accredited shooting instructor" },
      { text: "Full safety briefing" },
      { text: "All firearms and ammunition" },
      { text: "Safety gear" },
      { text: "Hotel pickup and drop-off" },
      { text: "Bottled water" },
      { text: "Safe and reliable driver" },
    ],

    excluded: [
      { text: "Photo and video package" },
      { text: "Group competitions" },
      { text: "Extended ammunition" },
      { text: "Breakfast" },
      { text: "Lunch" },
      { text: "Personal purchases" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Sea Point",
      "Camps Bay",
      "V&A Waterfront",
      "Custom pickup on request",
    ],

    requirements: [
      { text: "Minimum age: 18 years" },
      { text: "Valid ID or passport required" },
      { text: "No alcohol before shooting" },
      { text: "All minors strictly prohibited from handling firearms" },
    ],

    arrangements: {
      availability: "Available all year",
      duration: "2 - 3 hours",
      operatingTime: "Flexible time slots available after booking",
      departure: "Flexible",
      return: "Flexible",
      location: "Cape Town, South Africa",

      clothing: ["Comfortable clothing", "Closed shoes"],

      thingsToBring: ["Valid ID or passport", "Camera (optional)"],

      passengerPolicy: "",
      sunsetNote: "",
    },

    weatherPolicy: {
      summary:
        "All weather conditions – outdoor range operates in safe conditions only.",
      items: [
        { text: "Range operates in safe weather conditions" },
        { text: "Weather may affect availability" },
        { text: "Final timing confirmed after booking" },
      ],
    },

    cancellationPolicy: {
      summary:
        "Cancellations must be made at least 2 days before the scheduled experience. Refunds will be subject to our discretion.",
      items: [
        {
          text: "Cancellations must be made at least 2 days before scheduled date",
        },
        { text: "Refunds are subject to our discretion" },
        { text: "Late arrivals may reduce activity time" },
      ],
    },

    safetyPolicy: {
      summary:
        "Participants must adhere to all safety regulations and instructions provided by our instructors during the shooting experience.",
      items: [
        { text: "All safety regulations must be followed at all times" },
        {
          text: "Instructors are not liable for any injuries, damages, or legal consequences resulting from the use of firearms",
        },
        { text: "Be vigilant and observant during the safety briefing" },
        {
          text: "All participants must comply with legal requirements for firearms training",
        },
        { text: "Age restrictions and eligibility criteria apply" },
      ],
    },

    stops: [
      {
        id: "pickup",
        name: "Hotel Pickup / Meeting Point",
        time: "Flexible",
        duration: "30 min",
        note: "Selected pickup areas available",
        description:
          "Begin your experience with a convenient pickup from your selected Cape Town hotel before travelling to the accredited gun range.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "shooting-range",
        name: "Accredited Shooting Range",
        time: "Flexible",
        duration: "2 - 3 hours",
        note: "Full safety briefing and shooting experience",
        description:
          "Arrive at the accredited gun range, receive your full safety briefing, and enjoy your selected shooting package under the supervision of professional instructors.",
        exactLocation: mapLocation({
          label: "Accredited Shooting Range",
          address: "Cape Town, South Africa",
          query: "Cape Town Gun Range",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "dropoff",
        name: "Hotel Drop-off",
        time: "Flexible",
        duration: "30 min",
        note: "End of experience",
        description:
          "After completing your shooting experience, relax during the return transfer to your original Cape Town hotel.",
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
      { text: "Minimum age: 18 years" },
      { text: "Valid ID or passport required" },
      { text: "No alcohol before shooting" },
      { text: "All minors strictly prohibited from handling firearms" },
      { text: "Booking must be made in advance" },
      { text: "Time slots available after booking" },
    ],

    faqs: [
      {
        question: "What shooting packages are available?",
        answer:
          "We offer four packages: 2-Gun Speed Shoot (R2,000), 3-Gun Zombie Package (R3,000), John Wick 2-Gun Experience (R3,400), and Sicario 5-Gun Elite Experience (R3,950).",
      },
      {
        question: "Do I need shooting experience?",
        answer:
          "No. This experience is designed for beginners and includes full safety instruction and professional supervision.",
      },
      {
        question: "What is the minimum age?",
        answer:
          "The minimum age to participate is 18 years. All minors are strictly prohibited from handling firearms.",
      },
      {
        question: "What should I bring?",
        answer:
          "Bring your valid ID or passport. Comfortable clothing and closed shoes are recommended.",
      },
      {
        question: "Is transport included?",
        answer: "Yes. Hotel pickup and drop-off are included in all packages.",
      },
    ],

    tags: [
      "Adrenaline",
      "Shooting",
      "Gun Range",
      "Half Day",
      "Adventure",
      "Cape Town",
    ],
  },
  // Paragliding
  {
    id: 3, // New tour ID to be assigned (e.g., 22)
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,
    childFriendly: false,

    title: "Paragliding – Cape Town",
    slug: "paragliding-experience-cape-town",
    canonicalPath: "/tours/paragliding-experience-cape-town",
    childFriendly: true,

    seo: {
      title: "Paragliding Experience in Cape Town | Cape Frontier Tours",
      description:
        "Experience one of Cape Town's most iconic adventures — a scenic tandem paragliding flight over the Atlantic coastline. Fly with licensed pilots and enjoy breathtaking views of Sea Point, the Twelve Apostles, and the city bowl.",
      keywords: [
        "paragliding Cape Town",
        "tandem paragliding Cape Town",
        "Signal Hill paragliding",
        "Lion's Head paragliding",
        "Cape Town adventure",
        "scenic flight Cape Town",
        "paragliding experience South Africa",
      ],
    },

    workflow: defaultWorkflow,

    image: "/src/assets/images/tours/adrenaline/paragliding/1.webp",
    images: [
      "/src/assets/images/tours/adrenaline/paragliding/1.webp",
      "/src/assets/images/tours/adrenaline/paragliding/2.webp",
      "/src/assets/images/tours/adrenaline/paragliding/3.webp",
    ],
    imageFolder: "adrenaline/paragliding",

    videos: [],

    location: "Signal Hill or Lion's Head, Cape Town (weather dependent)",
    duration: "1 - 2 hours",

    priceBase: 3000,
    minPeople: 1,
    minAge: 12,

    pricing: [
      {
        category: "Adult",
        pricePerPerson: 3000,
        note: "All-inclusive per person",
      },
      {
        category: "Teens",
        pricePerPerson: 2600,
        note: "All-inclusive per child",
      },
      {
        category: "Children ",
        pricePerPerson: 2600,
        note: "All-inclusive per child",
      },
      {
        category: "Toddler",
        pricePerPerson: 0,
        note: "All-inclusive per child",
      },
    ],

    additionalPricing: [
      {
        type: "request",
        category: "Aerial Photos & Videos",
        price: null,
        unit: "per flight",
        currency: "ZAR",
        note: "Paid directly to pilot after landing. GoPro footage and photos available.",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 2,
          perPerson: 2800,
          label: "2+ Guests",
          note: "All-inclusive",
        },
      ],
    },

    description:
      "Experience one of Cape Town's most iconic adventures — a scenic tandem paragliding flight over the Atlantic coastline. Guests enjoy breathtaking views of Sea Point, the Twelve Apostles, and the city bowl while flying with a licensed and accredited tandem paragliding operator.",

    highlights: [
      { text: "Scenic tandem flight over Cape Town's Atlantic coastline" },
      { text: "Professional, licensed pilots with years of experience" },
      { text: "Safety briefing before take‑off" },
      { text: "Flexible timing based on weather conditions" },
      {
        text: "Incredible aerial photos & videos available as an optional extra",
      },
    ],

    included: [
      { text: "Professional reliable transport" },
      { text: "Hotel pick-up" },
      { text: "Bottled water" },
      { text: "Meeting guest at landing zone (Sea Point Promenade, etc.)" },
      { text: "Hotel drop-off" },
      { text: "Licensed and accredited tandem paragliding pilot" },
      { text: "Safety briefing" },
    ],

    excluded: [
      {
        text: "Aerial photos & videos (optional add-on paid directly to pilot after landing)",
      },
      { text: "Breakfast" },
      { text: "Lunch" },
      { text: "Personal purchases" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Sea Point",
      "Camps Bay",
      "V&A Waterfront",
      "Meet at launch point (Signal Hill or Lion's Head)",
      "Custom pickup on request",
    ],

    requirements: [
      { text: "Minimum age: 5 years old" },
      { text: "Minimum weight: 20 kg" },
      { text: "Maximum weight: 110 kg" },
      {
        text: "Children under 18 require a parent/guardian to sign consent forms",
      },
    ],

    arrangements: {
      availability: "Available all year (weather dependent)",
      duration: "1 - 2 hours",
      operatingTime:
        "Flexible (confirmed on the morning of the flight based on weather)",
      departure: "Flexible",
      return: "Flexible",
      location:
        "Signal Hill or Lion's Head (confirmed on the morning of the flight)",

      clothing: [
        "Comfortable clothing",
        "Closed shoes",
        "Warm jacket (weather dependent)",
      ],

      thingsToBring: ["Camera (optional)", "Sunscreen", "Sunglasses"],

      passengerPolicy: "",
      sunsetNote: "",
    },

    weatherPolicy: {
      summary:
        "Paragliding is weather-dependent. If conditions are unsafe, the operator may delay the flight, change the launch site, reschedule, or cancel with refund.",
      items: [
        {
          text: "Weather conditions determine the final launch site (Signal Hill or Lion's Head)",
        },
        { text: "Flight may be delayed if conditions are unsafe" },
        { text: "Rescheduling is offered if conditions are unsuitable" },
        {
          text: "Full refund provided if cancellation is necessary due to weather",
        },
        { text: "Safety always comes first" },
      ],
    },

    cancellationPolicy: {
      summary:
        "Weather-dependent activity. Final cancellation terms must be confirmed with the operator.",
      items: [
        { text: "Cancellation terms are confirmed upon booking" },
        { text: "Weather may result in rescheduling or full refund" },
        {
          text: "Final cancellation policy must be confirmed with the operator",
        },
      ],
    },

    safetyPolicy: {
      summary:
        "Your flight is conducted by a licensed tandem paragliding operator in Cape Town. All pilots are certified, insured, and trained according to South African paragliding regulations.",
      items: [
        {
          text: "All pilots are certified, insured, and trained according to South African paragliding regulations",
        },
        {
          text: "Guests complete indemnity forms directly with the pilot before take‑off",
        },
        { text: "Safety briefing is provided before take-off" },
      ],
    },

    stops: [
      {
        id: "launch-point",
        name: "Launch Point (Signal Hill or Lion's Head)",
        time: "Confirmed on the morning of the flight",
        duration: "30 min briefing",
        note: "Launch site varies based on weather conditions",
        description:
          "Meet your pilot at the designated launch site (Signal Hill or Lion's Head), chosen on the day based on wind and safety conditions. Receive your safety briefing, complete indemnity forms, and prepare for take-off.",
        exactLocation: mapLocation({
          label: "Paragliding Launch Site",
          address: "Cape Town, South Africa",
          query: "Paragliding Cape Town Launch Site",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "flight",
        name: "Scenic Tandem Flight",
        time: "Flexible",
        duration: "1 - 2 hours",
        note: "Flight duration varies",
        description:
          "Enjoy a breathtaking tandem paragliding flight over Cape Town's Atlantic coastline with views of Sea Point, the Twelve Apostles, and the city bowl.",
        exactLocation: mapLocation({
          label: "Cape Town Coastline",
          address: "Cape Town, South Africa",
          query: "Cape Town Coastline",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "landing-zone",
        name: "Landing Zone (Sea Point Promenade)",
        time: "Flexible",
        duration: "15 min",
        note: "Meeting guest at landing zone",
        description:
          "Land near the coast at Sea Point Promenade and enjoy the final views over the Atlantic coastline. Your guide will meet you at the landing zone.",
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
      { text: "Minimum age: 5 years old" },
      { text: "Minimum weight: 20 kg" },
      { text: "Maximum weight: 110 kg" },
      {
        text: "Children under 18 require a parent/guardian to sign consent forms",
      },
      { text: "No experience required — beginners welcome" },
      {
        text: "Exact launch location is confirmed on the morning of the flight based on weather",
      },
      { text: "Time to be confirmed upon booking" },
    ],

    faqs: [
      {
        question: "Do I need paragliding experience?",
        answer:
          "No. This is a tandem flight with a licensed pilot. No experience is required — beginners are welcome.",
      },
      {
        question: "What is the minimum age?",
        answer:
          "The minimum age is 5 years old. Children under 18 require a parent/guardian to sign consent forms.",
      },
      {
        question: "Where do we fly from?",
        answer:
          "The launch site is either Signal Hill or Lion's Head, depending on wind and weather conditions. The exact location is confirmed on the morning of the flight.",
      },
      {
        question: "Is the flight weather dependent?",
        answer:
          "Yes. Paragliding is weather-dependent. If conditions are unsafe, the operator may delay, change the launch site, reschedule, or cancel with a full refund.",
      },
      {
        question: "Are photos and videos included?",
        answer:
          "No. Photos and videos are an optional add-on. Pilots offer high-quality GoPro footage and photos, paid directly to the pilot after landing.",
      },
      {
        question: "Is transport included?",
        answer:
          "Yes. Professional reliable transport with hotel pickup and drop-off is included.",
      },
    ],

    tags: [
      "Adventure",
      "Paragliding",
      "Scenic",
      "Air",
      "Half Day",
      "Cape Town",
      "Tandem Flight",
    ],
  },
  // Cobra (2hr)
  {
    id: 4,
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,
    childFriendly: false,

    title: "Cobra Sundowner Self‑Drive",
    slug: "cobra-sundowner",
    canonicalPath: "/tours/cobra-sundowner",

    seo: {
      title: "Cobra Sundowner Self-Drive in Cape Town | Cape Frontier Tours",
      description:
        "Enjoy a 2-hour sunset self-drive in an official Backdraft Racing Cobra along Cape Town's coastline. Drive a modern classic V8 with automatic transmission, 35 km included mileage, and one free passenger.",
      keywords: [
        "Cobra self-drive Cape Town",
        "Cobra sunset drive Cape Town",
        "Backdraft Racing Cobra Cape Town",
        "V8 Cobra Cape Town",
        "sunset drive Cape Town",
        "classic car experience Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/cobra/cobra-2hr"),
    images: getTourImages("adrenaline/cobra/cobra-2hr", 3),
    imageFolder: "adrenaline/cobra/cobra-2hr",

    videos: [
      "/src/assets/videos/tours/adrenaline/cobra/Vid 1.mp4",
      "/src/assets/videos/tours/adrenaline/cobra/Vid 3.mp4",
      "/src/assets/videos/tours/adrenaline/cobra/Vid 4.mp4",
      "/src/assets/videos/tours/adrenaline/cobra/VID 5.mp4",
    ],

    location: "Foreshore, Cape Town, 8001",
    duration: "2 hours",

    priceBase: 2900,
    minPeople: 1,
    baseCurrency: "ZAR",

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 2900,
        note: "2-hour self-drive experience.",
      },
    ],

    additionalPricing: [
      {
        type: "quantity",
        category: "Additional Mileage",
        price: 20,
        unit: "per km",
        currency: "ZAR",
      },
      {
        type: "fixed",
        category: "Extra Driver",
        price: 500,
        unit: "per booking",
        currency: "ZAR",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 2,
          perPerson: 3000,
          label: "",
          note: "",
        },
      ],
    },

    description:
      "A sunset drive along Cape Town's coastline is one of the most unforgettable ways to end the day — and nothing compares to experiencing it from behind the wheel of a Cobra. Enjoy the freedom of an open-top V8 as the Atlantic horizon turns gold. Not sure where to go? We'll guide you in planning the perfect sunset route.",

    included: [
      { text: "Pick up at hotel." },
      { text: "Drop off at site." },
      { text: "35 km free mileage." },
      { text: "Pick up at site." },
      { text: "Drop off at hotel." },
      { text: "One free passenger may join the drive." },
    ],

    excluded: [
      { text: "Fuel." },
      { text: "Additional kilometres at R20.00 per km." },
      {
        text: "Chapman's Peak Drive (Noordhoek ↔ Hout Bay) is excluded due to safety restrictions.",
      },
    ],

    highlights: [
      {
        text: "2-hour sunset self-drive along Cape Town's coastline.",
      },
      {
        text: "Drive an official Backdraft Racing Cobra.",
      },
      {
        text: "Experience a factory-built modern classic with a V8 engine.",
      },
      {
        text: "Enjoy an open-top driving experience as the Atlantic horizon turns gold.",
      },
      {
        text: "One free passenger may join the drive.",
      },
      {
        text: "35 km of free mileage included.",
      },
      {
        text: "Route guidance available to help plan the perfect sunset drive.",
      },
    ],

    pickupOptions: ["Hotel pickup", "Foreshore, Cape Town", "Site pickup"],

    requirements: [
      {
        text: "Minimum age: 23 years.",
      },
      {
        text: "Valid driver's licence required.",
      },
    ],

    arrangements: {
      availability: "Available all year",
      duration: "2 hours",
      operatingTime: "17h00 - 19h00",
      departure: "17h00",
      return: "19h15",
      location: "Foreshore, Cape Town, 8001",

      clothing: ["Comfortable clothing", "Closed shoes", "Warm jacket"],

      thingsToBring: [
        "Valid driver's licence",
        "Credit card for deposit",
        "Credit card for toll roads",
      ],

      passengerPolicy: "One free passenger may join the drive.",

      sunsetNote: "Sunset times vary seasonally.",
    },

    weatherPolicy: {
      summary: "The Cobra Sundowner operates in safe weather conditions.",
      items: [
        {
          text: "The experience operates subject to safe weather conditions.",
        },
      ],
    },

    cancellationPolicy: {
      summary:
        "The experience operates subject to safe weather conditions and the supplier's rental agreement.",
      items: [
        {
          text: "The drive operates only in safe weather conditions.",
        },
        {
          text: "The final supplier cancellation and rescheduling rules must be confirmed.",
        },
        {
          text: "Security and liability amounts are subject to the vehicle inspection and rental agreement.",
        },
      ],
    },

    safetyPolicy: {
      summary:
        "The vehicle must be operated responsibly and in accordance with the rental agreement and applicable safety requirements.",
      items: [
        {
          text: "A valid driver's licence is required.",
        },
        {
          text: "The minimum driver age is 23 years.",
        },
        {
          text: "Chapman's Peak Drive (Noordhoek ↔ Hout Bay) is excluded due to safety restrictions.",
        },
        {
          text: "A temporary R15,000 card holding fee covers insurance excess, vehicle damage, fines, recovery costs, or rental agreement breaches.",
        },
      ],
    },

    stops: [
      {
        id: "foreshore-departure",
        name: "Foreshore Departure",
        time: "17h00",
        duration: "2 hours",
        note: "Departure from the Foreshore, Cape Town.",
        description:
          "Collect the Cobra and begin your sunset self-drive experience. The route can be planned with guidance to suit the evening.",
        exactLocation: mapLocation({
          label: "Foreshore, Cape Town",
          address: "Foreshore, Cape Town, 8001, South Africa",
          query: "Foreshore Cape Town",
        }),
        touristComments: [],
      },
      {
        id: "foreshore-return",
        name: "Return",
        time: "19h15",
        duration: "15 min",
        note: "Return after the sunset drive.",
        description:
          "Return the Cobra after the drive. The advertised driving experience runs from 17h00 to 19h00, with return scheduled for 19h15.",
        exactLocation: mapLocation({
          label: "Foreshore, Cape Town",
          address: "Foreshore, Cape Town, 8001, South Africa",
          query: "Foreshore Cape Town",
        }),
        images: getTourImages("shared/return", 1),
        touristComments: [],
      },
    ],

    routeInformation: {
      title: "Cape Town Coastal Sunset Route",

      description:
        "Enjoy a scenic sunset drive along Cape Town's coastline. We can guide you in planning the perfect sunset route.",

      items: [
        "Chapman's Peak Drive (Noordhoek ↔ Hout Bay) is excluded due to safety restrictions.",
      ],
    },

    vehicle: {
      name: "Official Backdraft Racing Cobra",
      class: "Modern Classic",
      doors: 2,
      seats: 2,
      fuel: "Petrol",
      gearbox: "Automatic",
      engine: "V8",

      specifications: [
        { text: "Factory built" },
        { text: "V8" },
        { text: "Automatic transmission" },
        { text: "Power steering" },
        { text: "Modern brakes" },
      ],
    },

    securityAndLiability: {
      heading: "Security & Liability Holding Fee",

      cardPreAuthorisation: {
        amount: 15000,
        currency: "ZAR",
        description:
          "A temporary holding fee covering insurance excess, vehicle damage, fines, recovery costs, or rental agreement breaches.",
        release:
          "Any unused amount is released after inspection and fine clearance.",
      },

      cashDeposit: {
        amountZAR: 20000,
        alternativeAmountUSD: 1200,
        paymentMethod: "Cash",
        paidAt: "Venue",
        refundPolicy:
          "Cash deposits may only be refunded from 08h30 the following day.",
      },
    },

    needToKnow: [
      {
        text: "Minimum age: 23 years.",
      },
      {
        text: "A valid driver's licence is required.",
      },
      {
        text: "Bring a credit card for the security/liability holding fee and toll roads.",
      },
      {
        text: "Comfortable clothing, closed shoes, and a warm jacket are recommended.",
      },
      {
        text: "The vehicle operates in safe weather conditions.",
      },
      {
        text: "One free passenger may join the drive.",
      },
      {
        text: "35 km free mileage is included.",
      },
      {
        text: "Additional mileage costs R20.00 per km.",
      },
      {
        text: "Fuel must be replenished on return.",
      },
      {
        text: "An extra driver costs R500.",
      },
      {
        text: "Chapman's Peak Drive (Noordhoek ↔ Hout Bay) is excluded due to safety restrictions.",
      },
      {
        text: "Sunset times vary seasonally.",
      },
    ],

    faqs: [
      {
        question: "How long is the Cobra Sundowner?",
        answer:
          "The sunset drive is 2 hours, from 17h00 to 19h00, with return scheduled for 19h15.",
      },
      {
        question: "Who drives the Cobra?",
        answer:
          "The experience is a self-drive experience. The customer drives the official Backdraft Racing Cobra.",
      },
      {
        question: "What vehicle will I drive?",
        answer:
          "You will drive an official Backdraft Racing Cobra, a factory-built modern classic with a V8 petrol engine, automatic gearbox, power steering, and modern brakes.",
      },
      {
        question: "How many people can the Cobra accommodate?",
        answer:
          "The Cobra has two seats. One free passenger may join the driver.",
      },
      {
        question: "How much mileage is included?",
        answer:
          "The experience includes 35 km of free mileage. Additional mileage is charged at R20.00 per kilometre.",
      },
      {
        question: "Is fuel included?",
        answer: "No. Fuel must be replenished on return.",
      },
      {
        question: "Can I add another driver?",
        answer: "Yes. An extra driver can be added for R500.",
      },
      {
        question: "What is the security deposit?",
        answer:
          "A R15,000 amount is pre-authorised on the card as a temporary holding fee. It covers matters such as insurance excess, vehicle damage, fines, recovery costs, or rental agreement breaches. Any unused amount is released after inspection and fine clearance.",
      },
      {
        question: "Can I pay the deposit in cash?",
        answer:
          "Yes. The cash deposit is R20,000 or $1,200. It is paid at the venue and may only be refunded from 08h30 the following day.",
      },
      {
        question: "Can I drive along Chapman's Peak?",
        answer:
          "No. Chapman's Peak Drive between Noordhoek and Hout Bay is excluded due to safety restrictions.",
      },
      {
        question: "What are the age requirements?",
        answer:
          "The minimum driver age is 23 years, and a valid driver's licence is required.",
      },
      {
        question: "What should I wear?",
        answer:
          "Wear comfortable clothing, closed shoes, and bring a warm jacket.",
      },
      {
        question: "What should I bring?",
        answer:
          "Bring your valid driver's licence, a credit card for the deposit, and a credit card for toll roads.",
      },
      {
        question: "What happens if the weather is unsuitable?",
        answer:
          "The experience operates in safe weather conditions. Final arrangements are subject to the supplier's safety requirements.",
      },
      {
        question: "Can you help plan the route?",
        answer:
          "Yes. If you're not sure where to go, the team can guide you in planning the perfect sunset route.",
      },
    ],

    tags: [
      "Adventure",
      "Self-Drive",
      "Classic Car",
      "V8",
      "Sunset",
      "Coastline",
      "Half Day",
    ],
  },
  // Cobra (24hr)
  {
    id: 5, // New tour ID to be assigned (e.g., 23)
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.FULL_DAY,
    childFriendly: false,

    title: "24‑Hour Self‑Drive Cobra Experience",
    slug: "24-hour-self-drive-cobra-experience",
    canonicalPath: "/tours/24-hour-self-drive-cobra-experience",

    seo: {
      title:
        "24‑Hour Self‑Drive Cobra Experience in Cape Town | Cape Frontier Tours",
      description:
        "Experience Cape Town on your own schedule with our 24‑hour Cobra rental — the perfect blend of freedom, style, and classic motoring excitement. Explore Cape Point, Boulders Beach, and more at your own pace.",
      keywords: [
        "Cobra rental Cape Town",
        "self-drive Cobra Cape Town",
        "classic car rental Cape Town",
        "Cobra experience South Africa",
        "24-hour car rental Cape Town",
        "Backdraft Racing Cobra",
        "Cape Town road trip",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/cobra/cobra-24hr"),
    images: getTourImages("adrenaline/cobra/cobra-24hr", 3),
    imageFolder: "adrenaline/cobra/cobra-24hr",

    videos: [
      "/src/assets/videos/tours/adrenaline/cobra/Vid 1.mp4",
      "/src/assets/videos/tours/adrenaline/cobra/Vid 3.mp4",
      "/src/assets/videos/tours/adrenaline/cobra/Vid 4.mp4",
      "/src/assets/videos/tours/adrenaline/cobra/VID 5.mp4",
    ],
    location: "Foreshore, Cape Town, 8001",
    duration: "24 hours (Collect 08:30 • Return Next Day 08:30)",

    priceBase: 6400,
    minPeople: 1,
    baseCurrency: "ZAR",

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 6400,
        note: "Includes one free passenger. 24-hour rental: 08:30 – 08:30.",
      },
    ],

    additionalPricing: [
      {
        type: "fixed",
        category: "Extra Driver",
        price: 500,
        unit: "per booking",
        currency: "ZAR",
        note: "",
      },
      {
        type: "quantity",
        category: "Additional Mileage",
        price: 20,
        unit: "per km",
        currency: "ZAR",
        note: "For mileage over 130 km",
      },
    ],

    groupPricing: {
      enabled: false,
      icon: "",
      tiers: [],
    },

    description:
      "Since Carroll Shelby introduced the first Cobra in 1962, this iconic machine has captured the imagination of drivers worldwide. If touring the Cape Peninsula in a bus or standard rental car doesn't excite you, elevate your adventure — drive a Cobra and make the journey part of the experience. This popular 24‑hour option allows you to explore Cape Point and all the top highlights at your own pace.",

    highlights: [
      { text: "24-hour self-drive Cobra experience" },
      { text: "Factory-built modern classic with V8 engine" },
      { text: "Automatic transmission with power steering" },
      { text: "130 km free mileage included" },
      { text: "One free passenger included" },
      { text: "Flexible itinerary — explore at your own pace" },
      {
        text: "Scenic stops including Scarborough Beach, Boulders Beach, and Cape Point",
      },
      {
        text: "Customised itinerary loaded onto your smartphone or GPS at pick-up",
      },
    ],

    included: [
      { text: "Hotel pickup" },
      { text: "Drop-off at site (Foreshore, Cape Town)" },
      { text: "130 km free mileage" },
      { text: "Pick-up at site" },
      { text: "Hotel drop-off" },
      { text: "Vehicle orientation and safety briefing" },
      { text: "Personalised itinerary loaded onto smartphone or GPS" },
    ],

    excluded: [
      { text: "Fuel (must be replenished on return)" },
      { text: "Additional mileage at R20.00 per km" },
      {
        text: "Chapman's Peak Drive (Noordhoek → Hout Bay) — excluded due to safety restrictions",
      },
      { text: "Personal purchases" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Sea Point",
      "Camps Bay",
      "V&A Waterfront",
      "Foreshore, Cape Town (collection point)",
      "Custom pickup on request",
    ],

    requirements: [
      { text: "Minimum age: 23 years" },
      { text: "Valid driver's license required" },
    ],

    arrangements: {
      availability: "All year round",
      duration: "24 hours",
      operatingTime: "08:30 – 08:30",
      departure: "08:30",
      return: "08:30 (next day)",
      location: "Foreshore, Cape Town, 8001",

      clothing: ["Comfortable clothing", "Closed shoes", "Warm jacket"],

      thingsToBring: [
        "Valid driver's license",
        "Credit card for deposit",
        "Cash for toll roads",
      ],

      passengerPolicy: "One free passenger may join the driver.",
      sunsetNote: "",
    },

    weatherPolicy: {
      summary:
        "Operates in safe weather conditions. Vehicle rental is weather-dependent for safety.",
      items: [
        { text: "Operates in safe weather conditions" },
        { text: "Final weather confirmation provided before collection" },
      ],
    },

    cancellationPolicy: {
      summary:
        "T's & C's apply. Security deposit and rental terms must be confirmed with the operator.",
      items: [
        { text: "T's & C's apply" },
        { text: "Cancellation terms must be confirmed with the operator" },
        { text: "Security deposit terms apply" },
      ],
    },

    safetyPolicy: {
      summary:
        "The vehicle must be operated responsibly and in accordance with the rental agreement and applicable safety requirements.",
      items: [
        { text: "A valid driver's license is required" },
        { text: "The minimum driver age is 23 years" },
        {
          text: "Chapman's Peak Drive (Noordhoek ↔ Hout Bay) is excluded due to safety restrictions",
        },
        { text: "Fuel must be replenished on return" },
        {
          text: "Please arrive 30 minutes early for paperwork, safety briefing, and full orientation",
        },
      ],
    },

    stops: [
      {
        id: "collection",
        name: "Collection & Orientation",
        time: "08:30",
        duration: "30 min",
        note: "Paperwork, safety briefing, and orientation",
        description:
          "Please arrive 30 minutes early for paperwork, a safety briefing, and a full orientation on your Cobra. Your personalised itinerary will be loaded onto your smartphone or GPS at pick-up.",
        exactLocation: mapLocation({
          label: "Foreshore, Cape Town",
          address: "Foreshore, Cape Town, 8001, South Africa",
          query: "Foreshore Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "self-drive-route",
        name: "Self-Drive Route",
        time: "Flexible",
        duration: "24 hours",
        note: "Explore at your own pace",
        description:
          "Enjoy legendary roads and scenic stops including Scarborough Beach, Boulders Beach Penguin Colony, and Cape Point. Not sure where to go? We'll help you plan the perfect route and load your personalised itinerary directly onto your smartphone or GPS at pick‑up.",
        exactLocation: mapLocation({
          label: "Cape Peninsula Route",
          address: "Cape Peninsula, South Africa",
          query: "Cape Peninsula South Africa",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "return",
        name: "Vehicle Return",
        time: "08:30 (next day)",
        duration: "15 min",
        note: "Return after 24 hours",
        description:
          "Return the Cobra to the Foreshore location. Vehicle inspection and fine clearance will be completed before the security deposit is released.",
        exactLocation: mapLocation({
          label: "Foreshore, Cape Town",
          address: "Foreshore, Cape Town, 8001, South Africa",
          query: "Foreshore Cape Town",
        }),
        images: [],
        touristComments: [],
      },
    ],

    routeInformation: {
      title: "Recommended Self-Drive Route",

      description:
        "Enjoy a scenic self-drive route along the Cape Peninsula at your own pace. We'll help you plan the perfect route and load your personalised itinerary directly onto your smartphone or GPS at pick-up.",

      items: [
        "Chapman's Peak Drive (Noordhoek → Hout Bay) is excluded due to safety restrictions",
        "Scarborough Beach",
        "Boulders Beach Penguin Colony",
        "Cape Point",
        "Cape of Good Hope",
      ],
    },

    vehicle: {
      name: "Official Backdraft Racing Cobra",
      class: "Modern Classic",
      doors: 2,
      seats: 2,
      fuel: "Petrol",
      gearbox: "Automatic",
      engine: "V8",

      specifications: [
        { text: "Factory built" },
        { text: "V8 engine" },
        { text: "Automatic transmission" },
        { text: "Power steering" },
        { text: "Modern brakes" },
      ],
    },

    securityAndLiability: {
      heading: "Security & Liability Holding Fee",

      cardPreAuthorisation: {
        amount: 15000,
        currency: "ZAR",
        description:
          "A temporary holding fee covering insurance excess, vehicle damage, traffic fines, recovery costs, or breaches of the rental agreement.",
        release:
          "Any unused portion is released after inspection and fine clearance.",
      },

      cashDeposit: {
        amountZAR: 20000,
        alternativeAmountUSD: 1200,
        paymentMethod: "Cash",
        paidAt: "Venue",
        refundPolicy:
          "Cash deposits for sunset/sundowner hires may only be returned from 08:30 the following day.",
      },
    },

    needToKnow: [
      { text: "Minimum age: 23 years" },
      { text: "A valid driver's license is required" },
      {
        text: "Please arrive 30 minutes early for paperwork, safety briefing, and full orientation",
      },
      { text: "Rental duration: 08:30 – 08:30 (24 hours)" },
      { text: "130 km free mileage included" },
      { text: "Additional mileage: R20.00 per km" },
      { text: "Fuel must be replenished on return" },
      { text: "Extra driver fee: R500" },
      { text: "One free passenger may join the driver" },
      {
        text: "R15,000 security deposit (card pre-authorisation) or R20,000 cash deposit",
      },
      {
        text: "Chapman's Peak Drive (Noordhoek ↔ Hout Bay) is excluded due to safety restrictions",
      },
      { text: "T's & C's apply" },
    ],

    faqs: [
      {
        question: "How long is the rental?",
        answer: "The rental is 24 hours, from 08:30 to 08:30 the next day.",
      },
      {
        question: "Who drives the Cobra?",
        answer:
          "This is a self-drive experience. The customer drives the official Backdraft Racing Cobra.",
      },
      {
        question: "What vehicle will I drive?",
        answer:
          "You will drive an official Backdraft Racing Cobra, a factory-built modern classic with a V8 petrol engine, automatic gearbox, power steering, and modern brakes.",
      },
      {
        question: "How many people can the Cobra accommodate?",
        answer:
          "The Cobra has two seats. One free passenger may join the driver.",
      },
      {
        question: "How much mileage is included?",
        answer:
          "The experience includes 130 km of free mileage. Additional mileage is charged at R20.00 per kilometre.",
      },
      {
        question: "Is fuel included?",
        answer: "No. Fuel must be replenished on return.",
      },
      {
        question: "Can I add another driver?",
        answer: "Yes. An extra driver can be added for R500.",
      },
      {
        question: "What is the security deposit?",
        answer:
          "A R15,000 amount is pre-authorised on the card as a temporary holding fee. It covers insurance excess, vehicle damage, fines, recovery costs, or rental agreement breaches. Any unused amount is released after inspection and fine clearance.",
      },
      {
        question: "Can I pay the deposit in cash?",
        answer:
          "Yes. The cash deposit is R20,000 or $1,200. Cash deposits for sunset/sundowner hires may only be returned from 08:30 the following day.",
      },
      {
        question: "Can I drive along Chapman's Peak?",
        answer:
          "No. Chapman's Peak Drive between Noordhoek and Hout Bay is excluded due to safety restrictions.",
      },
      {
        question: "What are the age requirements?",
        answer:
          "The minimum driver age is 23 years, and a valid driver's license is required.",
      },
      {
        question: "Can you help plan the route?",
        answer:
          "Yes. If you're not sure where to go, the team can help you plan the perfect route and load your personalised itinerary directly onto your smartphone or GPS at pick-up.",
      },
    ],

    tags: [
      "Adventure",
      "Self-Drive",
      "Classic Car",
      "V8",
      "Cobra",
      "24-Hour Rental",
      "Cape Peninsula",
      "Road Trip",
      "Cape Town",
    ],
  },
  // Cobra (8hr)
  {
    id: 6, // New tour ID to be assigned (e.g., 24)
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.FULL_DAY,
    childFriendly: false,

    title: "8hr Self‑Drive Cobra Experience",
    slug: "full-day-self-drive-cobra-experience",
    canonicalPath: "/tours/full-day-self-drive-cobra-experience",

    seo: {
      title:
        "Full Day Self‑Drive Cobra Experience in Cape Town | Cape Frontier Tours",
      description:
        "Slip into the low‑slung seat of a classic Cobra and let Cape Town's most iconic roads unfold in front of you. A head‑turning, wind‑in‑your‑hair, open‑top adrenaline moment wrapped in pure luxury.",
      keywords: [
        "Cobra self-drive Cape Town",
        "full day Cobra rental Cape Town",
        "classic car experience Cape Town",
        "Backdraft Racing Cobra",
        "Cape Town road trip",
        "Cobra hire Cape Town",
        "luxury car rental Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/cobra/cobra-8hr"),
    images: getTourImages("adrenaline/cobra/cobra-8hr", 3),
    imageFolder: "adrenaline/cobra/cobra-8hr",

    videos: [
      "/src/assets/videos/tours/adrenaline/cobra/Vid 1.mp4",
      "/src/assets/videos/tours/adrenaline/cobra/Vid 3.mp4",
      "/src/assets/videos/tours/adrenaline/cobra/Vid 4.mp4",
      "/src/assets/videos/tours/adrenaline/cobra/VID 5.mp4",
    ],

    location: "Foreshore, Cape Town, 8001",
    duration: "8 hours (08:30 – 16:30)",

    priceBase: 4500,
    minPeople: 1,
    baseCurrency: "ZAR",

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 4500,
        note: "8-hour experience. Includes one free passenger.",
      },
    ],

    additionalPricing: [
      {
        type: "fixed",
        category: "Extra Driver",
        price: 500,
        unit: "per booking",
        currency: "ZAR",
        note: "",
      },
      {
        category: "Additional Mileage",
        price: 20,
        unit: "per km",
        currency: "ZAR",
        note: "For mileage over 110 km",
      },
    ],

    groupPricing: {
      enabled: false,
      icon: "",
      tiers: [],
    },

    description:
      "Slip into the low‑slung seat of a classic Cobra, feel the rumble under you, and let Cape Town's most iconic roads unfold in front of you. This isn't just a drive — it's a head‑turning, wind‑in‑your‑hair, open‑top adrenaline moment wrapped in pure luxury. For the next few hours, the city becomes your playground, and the Cobra becomes your statement piece.",

    highlights: [
      { text: "8-hour self-drive Cobra experience" },
      { text: "Factory-built modern classic with V8 engine" },
      { text: "Automatic transmission with power steering" },
      { text: "110 km free mileage included" },
      { text: "One free passenger included" },
      { text: "Flexible itinerary — choose coastal views or Cape Winelands" },
      { text: "Turn-by-turn itineraries loaded onto your smartphone or GPS" },
      {
        text: "Cape Peninsula highlights: Boulders Beach, Cape Point, Hout Bay, Noordhoek",
      },
      { text: "Cape Winelands option: Stellenbosch and Franschhoek" },
    ],

    included: [
      { text: "Hotel pickup" },
      { text: "Drop-off at site (Foreshore, Cape Town)" },
      { text: "110 km free mileage" },
      { text: "Route itinerary loaded onto your device" },
      { text: "Pick-up at site" },
      { text: "Hotel drop-off" },
      { text: "Vehicle orientation and safety briefing" },
    ],

    excluded: [
      { text: "Fuel (must be replenished on return)" },
      { text: "Additional mileage at R20.00 per km" },
      { text: "Chapman's Peak Drive (restricted for safety reasons)" },
      { text: "Personal purchases" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Sea Point",
      "Camps Bay",
      "V&A Waterfront",
      "Foreshore, Cape Town (collection point)",
      "Custom pickup on request",
    ],

    requirements: [
      { text: "Minimum age: 23 years" },
      { text: "Valid driver's license required" },
    ],

    arrangements: {
      availability: "All year round",
      duration: "8 hours",
      operatingTime: "08:30 – 16:30",
      departure: "08:30",
      return: "16:30",
      location: "Foreshore, Cape Town, 8001",

      clothing: ["Comfortable clothing", "Closed shoes", "Warm jacket"],

      thingsToBring: [
        "Valid driver's license",
        "Credit card for security deposit",
        "Cash for toll roads",
      ],

      passengerPolicy: "One free passenger may join the driver for the day.",
      sunsetNote: "",
    },

    weatherPolicy: {
      summary:
        "Operates in safe weather conditions. Flexible wet weather policy applies.",
      items: [
        { text: "The drive will take place in all safe weather conditions" },
        { text: "If it rains, rescheduling is available" },
        {
          text: "Voucher valid for 3 years can be issued if conditions are unsuitable",
        },
      ],
    },

    cancellationPolicy: {
      summary:
        "T's & C's apply. Flexible wet weather policy allows rescheduling or vouchers.",
      items: [
        { text: "T's & C's apply" },
        { text: "Cancellation terms must be confirmed with the operator" },
        {
          text: "Wet weather allows rescheduling or voucher valid for 3 years",
        },
        { text: "Security deposit terms apply" },
      ],
    },

    safetyPolicy: {
      summary:
        "All vehicles are factory built and comply with all regulations set out by the South African Department of Transport. Safety along with a memorable experience are the two most important factors.",
      items: [
        { text: "All vehicles are factory built" },
        {
          text: "All vehicles comply with South African Department of Transport regulations",
        },
        { text: "A valid driver's license is required" },
        { text: "The minimum driver age is 23 years" },
        { text: "Chapman's Peak Drive is restricted for safety reasons" },
        { text: "Fuel must be replenished on return" },
      ],
    },

    stops: [
      {
        id: "collection",
        name: "Collection & Orientation",
        time: "08:30",
        duration: "30 min",
        note: "Paperwork, safety briefing, and orientation",
        description:
          "Arrive at the Foreshore location for paperwork, a safety briefing, and a full orientation on your Cobra. An itinerary will be drawn up while the guest completes the paperwork.",
        exactLocation: mapLocation({
          label: "Foreshore, Cape Town",
          address: "Foreshore, Cape Town, 8001, South Africa",
          query: "Foreshore Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "self-drive-route",
        name: "Self-Drive Route",
        time: "Flexible",
        duration: "8 hours",
        note: "Explore at your own pace",
        description:
          "Choose your preferred route — Cape Peninsula highlights including Boulders Beach, Cape Point, Hout Bay, and Noordhoek, or the Cape Winelands option exploring Stellenbosch and Franschhoek. Turn-by-turn itineraries are loaded directly to your smartphone or GPS so you can enjoy the drive without worrying about navigation.",
        exactLocation: mapLocation({
          label: "Cape Peninsula or Cape Winelands",
          address: "Cape Town, South Africa",
          query: "Cape Town South Africa",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "return",
        name: "Vehicle Return",
        time: "16:30",
        duration: "15 min",
        note: "Return after 8 hours",
        description:
          "Return the Cobra to the Foreshore location. Vehicle inspection and fine clearance will be completed before the security deposit is released.",
        exactLocation: mapLocation({
          label: "Foreshore, Cape Town",
          address: "Foreshore, Cape Town, 8001, South Africa",
          query: "Foreshore Cape Town",
        }),
        images: [],
        touristComments: [],
      },
    ],

    routeInformation: {
      title: "Recommended Self-Drive Routes",

      description:
        "Whether you prefer coastal views or countryside charm, the Cobra is the perfect way to experience Cape Town's most celebrated destinations. We provide turn‑by‑turn itineraries directly to your smartphone or GPS so you can enjoy the drive without worrying about navigation.",

      items: [
        "Cape Peninsula Highlights: Boulders Beach and its famous penguins",
        "Cape Point's dramatic cliffs and ocean vistas",
        "Hout Bay Harbour and local markets",
        "Noordhoek's long, sweeping coastline",
        "Constantia's lush wine valley",
        "Cape Winelands Option: Stellenbosch and Franschhoek — boutique shops, wine estates, mountain passes, and charming cafés",
        "Chapman's Peak Drive is restricted for safety reasons",
      ],
    },

    vehicle: {
      name: "Official Backdraft Racing Cobra",
      class: "Modern Classic",
      doors: 2,
      seats: 2,
      fuel: "Petrol",
      gearbox: "Automatic",
      engine: "V8",

      specifications: [
        { text: "Factory built" },
        { text: "V8 engine" },
        { text: "Automatic transmission" },
        { text: "Power steering" },
        { text: "Modern brakes" },
        { text: "Pre-installed Go-Pro mounts" },
      ],
    },

    securityAndLiability: {
      heading: "Security & Liability Holding Fee",

      cardPreAuthorisation: {
        amount: 20000,
        currency: "ZAR",
        description:
          "A temporary holding fee covering insurance excess, vehicle damage, traffic fines, recovery costs, or breaches of the rental agreement.",
        release:
          "Any unused amount is released after inspection and fine clearance.",
      },

      cashDeposit: {
        amountZAR: 20000,
        alternativeAmountUSD: 1200,
        paymentMethod: "Cash",
        paidAt: "Venue",
        refundPolicy:
          "Cash deposits for sunset/sundowner hires may only be collected from 08:30 the following day.",
      },
    },

    needToKnow: [
      { text: "Minimum age: 23 years" },
      { text: "Valid driver's license required" },
      { text: "Duration: 08:30 – 16:30 (8 hours)" },
      { text: "110 km free mileage included" },
      { text: "Additional mileage: R20.00 per km" },
      { text: "Fuel must be replenished on return" },
      { text: "Extra driver fee: R500" },
      { text: "One free passenger may join the driver" },
      {
        text: "R15,000 security deposit (card pre-authorisation) or R20,000 cash deposit",
      },
      { text: "Chapman's Peak Drive is restricted for safety reasons" },
      { text: "T's & C's apply" },
      { text: "Go-Pro and SD card rental packages available" },
      {
        text: "Refreshments, t-shirts, caps, and blankets available for purchase",
      },
    ],

    faqs: [
      {
        question: "I have rented the car but have nowhere to go?",
        answer:
          "An itinerary will be drawn up while the guest completes the paperwork. Turn-by-turn itineraries are loaded directly to your smartphone or GPS.",
      },
      {
        question: "Is safety a concern?",
        answer:
          "All our cars are factory built and comply with all regulations set out by the South African Department of Transport. Safety along with a memorable experience are the two most important factors for our Brand.",
      },
      {
        question: "How many people can you accommodate?",
        answer:
          "We can currently take up to 10 pax in Backdraft Cobra's at a time but have a few other great classics we can offer in conjunction to accommodate larger groups. Up to 20 pax can be arranged.",
      },
      {
        question: "What if it rains?",
        answer:
          "We have a flexible wet weather policy. The drive will take place in all safe weather conditions permitting. If you wake up and find it is raining we will allow rescheduling of the experience or issue you with a voucher valid for 3 years to take up the experience at a convenient time.",
      },
      {
        question: "What do I need to bring with?",
        answer:
          "Bring along your driver's license, credit card, and cash for refuelling the car. All our cars have pre-installed Go-Pro mounts and we provide Go-Pro and SD card rental packages allowing you to capture the day on film. We also offer refreshments, t-shirts, caps, and blankets for purchase.",
      },
      {
        question: "What vehicle will I drive?",
        answer:
          "You will drive an official Backdraft Racing Cobra, a factory-built modern classic with a V8 petrol engine, automatic gearbox, power steering, and modern brakes.",
      },
      {
        question: "How much mileage is included?",
        answer:
          "The experience includes 110 km of free mileage. Additional mileage is charged at R20.00 per kilometre.",
      },
      {
        question: "Is fuel included?",
        answer: "No. Fuel must be replenished on return.",
      },
      {
        question: "Can I add another driver?",
        answer: "Yes. An extra driver can be added for R500.",
      },
      {
        question: "What is the security deposit?",
        answer:
          "A R15,000 amount is pre-authorised on the card as a temporary holding fee. It covers insurance excess, vehicle damage, fines, recovery costs, or rental agreement breaches. Any unused amount is released after inspection and fine clearance.",
      },
      {
        question: "Can I pay the deposit in cash?",
        answer:
          "Yes. The cash deposit is R20,000 or $1,200. Cash deposits for sunset/sundowner hires may only be collected from 08:30 the following day.",
      },
      {
        question: "Can I drive along Chapman's Peak?",
        answer: "No. Chapman's Peak Drive is restricted for safety reasons.",
      },
    ],

    tags: [
      "Adventure",
      "Self-Drive",
      "Classic Car",
      "V8",
      "Cobra",
      "Full Day",
      "Cape Peninsula",
      "Cape Winelands",
      "Road Trip",
      "Cape Town",
      "Luxury",
    ],
  },
  // Horse-Riding
  {
    id: 7, // New tour ID to be assigned (e.g., 25)
    type: TOUR_TYPES.ADRENALINE,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "The Dunes Beach Horse Riding - Noordhoek",
    slug: "horse-riding-at-the-cape-dunes",
    canonicalPath: "/tours/horse-riding-at-the-cape-dunes",
    childFriendly: true,

    seo: {
      title: "Horse Riding at the Cape Dunes | Cape Frontier Tours",
      description:
        "A breathtaking guided horse‑riding experience along the Cape dunes, offering sweeping ocean views, soft white sand, and peaceful riding trails suitable for beginners and experienced riders.",
      keywords: [
        "horse riding Cape Town",
        "Cape dunes horse riding",
        "beach horse riding Cape Town",
        "guided horse ride Cape Town",
        "Cape Town horse riding experience",
        "Noordhoek horse riding",
        "family horse riding Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("adrenaline/horse-riding-dunes"),
    images: getTourImages("adrenaline/horse-riding-dunes", 3),
    imageFolder: "adrenaline/horse-riding-dunes",
    videos: [],

    location: "Cape Dunes, Cape Town, South Africa",
    duration: "2 hours (60–90 minutes riding time)",

    priceBase: 2250,
    minPeople: 2,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 2250,
        note: "All-inclusive per person. Minimum 2 guests required.",
      },
      {
        category: "Children (6+)",
        pricePerPerson: 2250,
        note: "Same price as adults.",
      },
    ],

    additionalPricing: [],

    groupPricing: {
      enabled: false,
      icon: "",
      tiers: [],
    },

    stars: null,
    mainReviewerName: "",
    mainReviewerCountry: "",
    reviewYear: null,
    otherReviews: null,
    mainReview: "",

    description:
      "A breathtaking guided horse‑riding experience along the Cape dunes, offering sweeping ocean views, soft white sand, and peaceful riding trails suitable for beginners and experienced riders.",

    highlights: [
      { text: "Scenic dune trails with ocean and mountain views" },
      { text: "Beginner‑friendly horses and professional guides" },
      { text: "Peaceful riding experience away from crowds" },
      { text: "Perfect for couples, families, and small groups" },
      { text: "Bottled water included" },
      { text: "60–90 minutes of riding time" },
    ],

    included: [
      { text: "Pick up at location" },
      {
        text: "Professional driver and reliable vehicle with passenger liability",
      },
      { text: "Horse riding fee" },
      { text: "Bottled water" },
      { text: "Drop off at location" },
      { text: "Safety briefing and helmet fitting" },
      { text: "Guide introduction" },
    ],

    excluded: [
      { text: "Breakfast" },
      { text: "Lunch" },
      { text: "Personal purchases" },
    ],

    pickupOptions: [
      "At location only",
      "Cape Town CBD (on request)",
      "Sea Point (on request)",
      "Camps Bay (on request)",
      "Custom pickup on request",
    ],

    requirements: [
      { text: "Minimum age: 6 years old" },
      { text: "Maximum rider weight: 95–100 kg" },
      {
        text: "Riders must be physically able to mount, balance, and follow guide instructions",
      },
      {
        text: "Guests with medical conditions must disclose this before booking",
      },
    ],

    arrangements: {
      availability: "Available all year (weather dependent)",
      duration: "2 hours total",
      operatingTime: "Flexible",
      departure: "Flexible",
      return: "Flexible",
      location: "Cape Dunes, Cape Town, South Africa",

      clothing: [
        "Comfortable clothing",
        "Closed shoes (no sandals)",
        "Sunscreen",
        "Sunglasses",
        "Light jacket depending on weather",
      ],

      thingsToBring: [],

      passengerPolicy: "",
      sunsetNote: "",
    },

    weatherPolicy: {
      summary:
        "Horse riding is weather‑dependent. The operator may delay or cancel rides for safety reasons.",
      items: [
        { text: "Weather conditions may affect availability" },
        { text: "Rides may be delayed or cancelled for safety reasons" },
        { text: "Final confirmation provided before departure" },
      ],
    },

    cancellationPolicy: {
      summary:
        "Weather-dependent activity. Cancellation terms must be confirmed with the operator.",
      items: [
        { text: "Cancellation terms must be confirmed with the operator" },
        { text: "Weather may result in rescheduling or cancellation" },
        { text: "Final cancellation policy is confirmed upon booking" },
      ],
    },

    safetyPolicy: {
      summary:
        "Horse riding is an outdoor adventure activity and involves inherent risks. By booking or participating, guests acknowledge and accept the safety terms outlined below. These conditions are in place to protect both riders and horses.",
      items: [
        {
          text: "Participation at own risk — horse riding involves inherent risks including uneven terrain, sudden horse movements, weather conditions, and physical exertion",
        },
        {
          text: "Maximum rider weight: 95–100 kg — riders may be weighed on arrival if uncertain",
        },
        {
          text: "Minimum age: 6 years — riders must be physically able to mount, balance, and follow guide instructions",
        },
        { text: "Helmets must be worn at all times" },
        { text: "Riders must follow all guide instructions" },
        { text: "No racing, sudden movements, or galloping" },
        { text: "No riding under the influence of alcohol or drugs" },
        {
          text: "Approach horses calmly — do not stand directly behind a horse",
        },
        { text: "Avoid loud noises or sudden gestures" },
        {
          text: "Cape Frontier Travel & Tours is not responsible for loss or damage to personal items during the ride",
        },
        {
          text: "By booking, paying for, or participating, guests confirm they understand and accept all safety conditions",
        },
      ],
    },

    stops: [
      {
        id: "stables",
        name: "Stables & Safety Briefing",
        time: "Flexible",
        duration: "20 min",
        note: "Welcome, briefing, and helmet fitting",
        description:
          "Friendly licensed guides welcome you at the stables. Receive a safety briefing, helmet fitting, and guide introduction before beginning your ride.",
        exactLocation: mapLocation({
          label: "Cape Dunes Stables",
          address: "Cape Dunes, Cape Town, South Africa",
          query: "Cape Dunes Horse Riding",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "dune-ride",
        name: "Cape Dunes Horse Ride",
        time: "Flexible",
        duration: "60 - 90 min",
        note: "Gentle walk onto the dunes",
        description:
          "Enjoy a gentle walk onto the dunes with a scenic ride featuring sweeping ocean views, soft white sand, and peaceful riding trails. The relaxed pace is suitable for all levels.",
        exactLocation: mapLocation({
          label: "Cape Dunes",
          address: "Cape Town, South Africa",
          query: "Cape Dunes",
        }),
        images: [],
        touristComments: [],
      },
    ],

    needToKnow: [
      { text: "Minimum age: 6 years old" },
      { text: "Maximum rider weight: 95–100 kg" },
      { text: "Helmets must be worn at all times" },
      { text: "No galloping or riding ahead of the guide" },
      { text: "No racing, sudden movements, or riding under the influence" },
      { text: "Riders must follow all guide instructions" },
      { text: "Approach horses calmly — do not stand directly behind a horse" },
      { text: "Avoid loud noises or sudden gestures" },
      {
        text: "Guests with medical conditions must disclose this before booking",
      },
      { text: "Horse riding is weather‑dependent" },
      {
        text: "Cape Frontier Travel & Tours is not responsible for loss or damage to personal items",
      },
    ],

    faqs: [
      {
        question: "Do I need horse riding experience?",
        answer:
          "No. This experience is suitable for beginners and includes a safety briefing, helmet fitting, and guide introduction. The pace is relaxed and suitable for all levels.",
      },
      {
        question: "What is the minimum age?",
        answer:
          "The minimum age is 6 years old. Riders must be physically able to mount, balance, and follow guide instructions.",
      },
      {
        question: "What is the weight limit?",
        answer:
          "The maximum rider weight is 95–100 kg. Riders may be weighed on arrival if uncertain. Guests exceeding the limit cannot be accommodated.",
      },
      {
        question: "What should I wear?",
        answer:
          "Wear comfortable clothing, closed shoes (no sandals), and bring sunscreen, sunglasses, and a light jacket depending on the weather.",
      },
      {
        question: "Is the ride weather dependent?",
        answer:
          "Yes. Horse riding is weather‑dependent. The operator may delay or cancel rides for safety reasons.",
      },
      {
        question: "Can children participate?",
        answer:
          "Yes. Children aged 6 years and older can participate at the same price as adults. All riders must follow guide instructions.",
      },
      {
        question: "What is included in the price?",
        answer:
          "The price includes pick-up at location, professional driver, horse riding fee, bottled water, safety briefing, and drop-off at location.",
      },
    ],

    tags: [
      "Horse Riding",
      "Cape Dunes",
      "Adventure",
      "Outdoor",
      "Half Day",
      "Family Friendly",
      "Cape Town",
      "Beginner Friendly",
    ],
  },
  // =========================================== HIKING
  // Lions-Head
  {
    id: 8,
    type: TOUR_TYPES.HIKING,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Lion’s Head Hike",
    slug: "lions-head-hike",
    canonicalPath: "/tours/lions-head-hike",
    childFriendly: true,

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
    imageFolder: "hiking/lions-head",
    location: "Lion’s Head, Cape Town",
    duration: "3 - 4 hours",

    priceBase: 1900,
    minPeople: 2,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 1900,
      },
      {
        category: "Children (12–17 years)",
        pricePerPerson: 1500,
        note: "No discounts for children. Age and eligibility rules apply.",
      },
    ],

    groupPricing: {
      enabled: false,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 4,
          perPerson: 0, // no discount confirmed yet.
          label: "4+ Guests",
          note: "Private vehicle • All-inclusive",
        },
      ],
    },

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
  // Platteklip
  {
    id: 9,
    type: TOUR_TYPES.HIKING,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Platteklip Gorge Hike",
    slug: "platteklip-gorge-hike",
    canonicalPath: "/tours/platteklip-gorge-hike",
    childFriendly: true,

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
    imageFolder: "hiking/platteklip",
    location: "Table Mountain, Cape Town",
    duration: "4 - 5 hours",

    priceBase: 1900,
    minPeople: 2,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 1500,
      },
      // {
      //   category: "Children",
      //   pricePerPerson: 0,
      // },
    ],

    groupPricing: {
      enabled: false,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 4,
          perPerson: 0, // no discount confirmed yet.
          label: "4+ Guests",
          note: "Private vehicle • All-inclusive",
        },
      ],
    },

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
      summary:
        "Mountain weather and cableway availability may affect the plan.",
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
  // =========================================== HISTORICAL
  // Langa
  {
    id: 10, // New tour ID to be assigned (e.g., 32)
    type: TOUR_TYPES.HISTORICAL,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Langa Township Cultural Experience",
    slug: "langa-township-cultural-experience",
    canonicalPath: "/tours/langa-township-cultural-experience",
    childFriendly: true,

    seo: {
      title: "Langa Township Cultural Experience | Cape Frontier Tours",
      description:
        "Discover the heart of Cape Town's oldest township, Langa, on an immersive cultural tour led by local community guides. Experience authentic storytelling, vibrant art, history, and real connections with the people who call Langa home.",
      keywords: [
        "Langa Township Tour",
        "Langa Cultural Experience",
        "Cape Town Township Tour",
        "Langa Community Tour",
        "Cape Town Cultural Tour",
        "Guga S'thebe",
        "Township Experience Cape Town",
        "Langa history",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/langa"),
    images: getTourImages("historical/langa", 3),
    imageFolder: "historical/langa",
    videos: [],

    location: "Langa, Cape Town, South Africa",
    duration: "3 - 4 hours",

    priceBase: 1300,
    minPeople: 2,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 1300,
        note: "Standard rate",
      },
      {
        category: "Children (4–12 years)",
        pricePerPerson: 650,
        note: "Standard child rate",
      },
    ],

    additionalPricing: [
      {
        type: "request",
        category: "Groups 15+ (Schools, Corporate)",
        price: 950,
        unit: "per person",
        currency: "ZAR",
        // note: "Custom pricing for large groups (R950-R1,000 adults, R475–R500 children)",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 4,
          maxPeople: 6,
          perPerson: null,
          discountPercent: 10,
          label: "4–6 Guests",
          note: "10% discount • All-inclusive",
        },
        {
          minPeople: 7,
          maxPeople: 10,
          perPerson: null,
          label: "7–10 Guests",
          discountPercent: 15,
          note: "15% discount • Ideal shared tour size",
        },
        {
          minPeople: 11,
          maxPeople: 14,
          perPerson: null,
          discountPercent: 20,
          label: "11–14 Guests",
          note: "20% discount • Best value for large groups",
        },
      ],
    },

    description:
      "Langa Township, meaning 'sun' in isiXhosa, is Cape Town's oldest township and a vibrant destination for experiencing South Africa's culture, history, and community spirit. Established formally in 1927 following the 1923 Urban Areas Act, Langa is one of South Africa's oldest townships and played a pivotal role in the anti-apartheid struggle. It was initially developed to house Black Africans under strict apartheid regulations. The name 'Langa' derives from Chief Langalibalele, who resisted colonial authorities and was imprisoned on Robben Island, while 'sun' reflects its Xhosa meaning.",

    highlights: [
      { text: "Cape Town's oldest township — established in 1927" },
      { text: "Local community guide for authentic storytelling" },
      { text: "Guga S'thebe Arts & Culture Centre visit" },
      { text: "Cultural walking tour through Langa" },
      { text: "Craft market stop supporting local artisans" },
      { text: "See local creators, beadworks, and sculptures" },
      {
        text: "Learn about Langa's pivotal role in the anti-apartheid struggle",
      },
      { text: "Real connections with the people who call Langa home" },
    ],

    included: [
      { text: "Hotel pick‑up and drop‑off" },
      { text: "Professional driver‑guide" },
      { text: "Local Langa community guide" },
      { text: "Guga S'thebe visit" },
      { text: "Cultural walk" },
      { text: "Craft market stop" },
      { text: "Bottled water" },
      { text: "All entry fees" },
      { text: "Air‑conditioned transport" },
    ],

    excluded: [{ text: "Lunch" }, { text: "Personal purchases" }],

    pickupOptions: [
      "Cape Town CBD",
      "Green Point",
      "Sea Point",
      "Custom pickup on request",
    ],

    requirements: [],

    arrangements: {
      availability: "Available all year",
      duration: "3 - 4 hours",
      operatingTime:
        "09:00 – 12:00 (Morning Tour) • 13:00 – 16:00 (Afternoon Tour) • Custom times available",
      departure: "Flexible (09:00, 10:00, 13:00, 14:00)",
      return: "Flexible (12:00, 13:00, 16:00, 17:00)",
      location: "Langa, Cape Town, South Africa",

      clothing: [
        "Comfortable clothing",
        "Comfortable walking shoes",
        "Sunscreen",
        "Hat",
      ],

      thingsToBring: ["Camera", "Cash for personal purchases at craft market"],

      passengerPolicy: "",
      sunsetNote: "",
    },

    weatherPolicy: {
      summary:
        "Tour operates in all weather conditions. Rain is part of Cape Town's weather – bring an umbrella or rain jacket.",
      items: [
        { text: "Tour operates in all weather conditions" },
        { text: "Bring an umbrella or rain jacket if rain is forecast" },
      ],
    },

    cancellationPolicy: {
      summary:
        "Private tour bookings require advance confirmation. Route adjustments may occur when necessary.",
      items: [
        { text: "Private bookings require advance confirmation" },
        { text: "Route adjustments may occur when necessary" },
        { text: "Final cancellation policy is confirmed upon booking" },
      ],
    },

    safetyPolicy: {
      summary:
        "Langa is considered one of the safer townships for visitors, especially when exploring with local guides. Please ask permission before photographing residents.",
      items: [
        {
          text: "Langa is considered one of the safer townships when visited with local guides",
        },
        { text: "Please ask permission before photographing residents" },
        {
          text: "Respectful behaviour towards the local community is expected",
        },
        { text: "Tours are conducted with experienced local community guides" },
      ],
    },

    stops: [
      {
        id: "pickup",
        name: "Hotel Pickup",
        time: "Flexible",
        duration: "30 minutes",
        note: "Air‑conditioned transfer",
        description:
          "Enjoy convenient hotel pickup from Cape Town CBD, Green Point, or Sea Point before travelling to Langa Township.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town, South Africa",
          query: "Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "guga-sthebe",
        name: "Guga S'thebe Arts & Culture Centre",
        time: "Flexible",
        duration: "45 minutes",
        note: "Community arts centre",
        description:
          "Visit one of Langa's best-known cultural landmarks, showcasing local artists, crafts, performances, and community initiatives. See local creators, beadworks, and sculptures.",
        exactLocation: mapLocation({
          label: "Guga S'thebe Arts & Culture Centre",
          address: "Langa, Cape Town, South Africa",
          query: "Guga Sthebe Langa",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "langa-walk",
        name: "Langa Cultural Walk",
        time: "Flexible",
        duration: "1.5 - 2 hours",
        note: "Guided community experience",
        description:
          "Walk through Cape Town's oldest township with a local guide, learning about its history, daily life, community projects, and its important role during South Africa's anti-apartheid struggle. Experience authentic storytelling, vibrant art, and real connections with the people who call Langa home.",
        exactLocation: mapLocation({
          label: "Langa Township",
          address: "Langa, Cape Town, South Africa",
          query: "Langa Township",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "craft-market",
        name: "Local Craft Market",
        time: "Flexible",
        duration: "30 minutes",
        note: "Support local artisans",
        description:
          "Browse locally made arts and crafts while supporting small businesses and talented community artisans.",
        exactLocation: mapLocation({
          label: "Langa Craft Market",
          address: "Langa, Cape Town, South Africa",
          query: "Langa Craft Market",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "dropoff",
        name: "Hotel Drop-off",
        time: "Flexible",
        duration: "30 minutes",
        note: "End of tour",
        description:
          "After completing your cultural experience, relax during the return transfer to your original Cape Town hotel.",
        exactLocation: mapLocation({
          label: "Cape Town Drop-off Area",
          address: "Cape Town, South Africa",
          query: "Cape Town",
        }),
        images: [],
        touristComments: [],
      },
    ],

    routeInformation: {
      title: "Langa Township Cultural Experience Route",

      description:
        "Discover the heart of Cape Town's oldest township, Langa, on an immersive cultural tour led by local community guides.",

      items: [
        "Hotel pickup in Cape Town CBD, Green Point, or Sea Point",
        "Guga S'thebe Arts & Culture Centre",
        "Langa Cultural Walking Tour",
        "Local Craft Market",
        "Hotel drop-off",
      ],
    },

    needToKnow: [
      {
        text: "Langa is considered one of the safer townships when visited with local guides",
      },
      { text: "Please ask permission before photographing residents" },
      { text: "Respectful behaviour towards the local community is expected" },
      { text: "Tours are conducted with experienced local community guides" },
      { text: "Comfortable walking shoes are recommended" },
      {
        text: "Morning Tour (09:00–12:00) is the most popular — community activity is lively, craft markets are open",
      },
      {
        text: "Afternoon Tour (13:00–16:00) is good for guests arriving later",
      },
      {
        text: "Private/Custom times available for groups, cruise passengers, or custom itineraries",
      },
    ],

    faqs: [
      {
        question: "Is Langa safe to visit?",
        answer:
          "Yes. Langa is considered one of the safer townships for visitors, especially when exploring with local community guides.",
      },
      {
        question: "Who leads the tour?",
        answer:
          "The experience is led by a professional driver-guide together with a knowledgeable local community guide from Langa.",
      },
      {
        question: "What is the historical significance of Langa?",
        answer:
          "Langa was established formally in 1927 following the 1923 Urban Areas Act and is one of South Africa's oldest townships. It played a pivotal role in the anti-apartheid struggle. The name derives from Chief Langalibalele, who resisted colonial authorities and was imprisoned on Robben Island.",
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
      {
        question: "What are the tour times?",
        answer:
          "Morning Tour: 09:00–12:00 (most popular), Afternoon Tour: 13:00–16:00. Private/Custom times also available (e.g., 10:00–13:00, 14:00–17:00).",
      },
      {
        question: "Can children join?",
        answer:
          "Yes. Children 4–12 years receive discounted rates. Please contact us for children under 4 years.",
      },
      {
        question: "What should I bring?",
        answer:
          "Bring comfortable walking shoes, sunscreen, a hat, your camera, and cash for personal purchases at the craft market.",
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
      "Cultural Tour",
      "Authentic Experience",
      "Local Guide",
    ],
  },
  // Robben-Island
  {
    id: 11, // New tour ID to be assigned (e.g., 33)
    type: TOUR_TYPES.HISTORICAL,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "Robben Island Half Day Tour",
    slug: "robben-island-half-day-tour",
    canonicalPath: "/tours/robben-island-half-day-tour",
    childFriendly: true,

    seo: {
      title: "Robben Island Half Day Tour | Cape Frontier Tours",
      description:
        "Discover the historic Robben Island, a UNESCO World Heritage Site and former prison where Nelson Mandela was held. Includes return ferry, guided prison tour, Mandela's cell, island bus tour, and hotel pickup.",
      keywords: [
        "Robben Island tour",
        "Robben Island ferry",
        "Nelson Mandela prison tour",
        "Cape Town historical tour",
        "UNESCO World Heritage Site",
        "Robben Island Museum",
        "Nelson Mandela cell",
        "Cape Town prison tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/robben-island"),
    images: getTourImages("historical/robben-island", 3),
    imageFolder: "historical/robben-island",
    videos: [],

    location: "Robben Island, Cape Town, South Africa",
    duration: "4 - 5 hours",

    priceBase: 1990,
    minPeople: 2,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 1990,
        note: "",
      },
      {
        category: "Children (5–17 years)",
        pricePerPerson: 995,
        note: "",
      },
      {
        category: "Children (0–4 years)",
        pricePerPerson: 0,
        note: "Free of charge",
      },
    ],

    additionalPricing: [],

    groupPricing: {
      enabled: false,
      icon: "",
      tiers: [],
    },

    description:
      "Robben Island is a small island off the coast of Cape Town, South Africa, historically used as a prison for political prisoners, including Nelson Mandela, and now serves as a UNESCO World Heritage Site and museum symbolizing the triumph of the human spirit over oppression. Robben Island, whose name derives from the Dutch word for 'seals,' spans roughly 5 square miles and lies about 7 kilometres from Cape Town. The island has a long and complex history stretching over 400 years. Other prominent prisoners included Robert Sobukwe, Ahmed Kathrada, and Walter Sisulu. Today, Robben Island is a UNESCO World Heritage Site and home to the Robben Island Museum. Visitors can explore the former prison, historical buildings, and natural landscapes, often guided by former inmates who share firsthand experiences. The island's enduring legacy lies in its poignant symbolism of resistance, resilience, and reconciliation, making it a major site of learning and reflection on South African history.",

    highlights: [
      { text: "Return ferry ticket to Robben Island" },
      { text: "Guided prison tour with former inmates where available" },
      { text: "Visit Nelson Mandela's prison cell" },
      { text: "Island bus tour" },
      {
        text: "Hotel pick‑up and drop‑off (Cape Town CBD, Green Point, Sea Point)",
      },
      { text: "Professional driver‑guide" },
      { text: "UNESCO World Heritage Site" },
      { text: "Explore historical buildings and natural landscapes" },
    ],

    included: [
      { text: "Return ferry ticket" },
      { text: "Guided Robben Island tour" },
      {
        text: "Hotel pick‑up and drop‑off (Cape Town CBD, Green Point, Sea Point)",
      },
      { text: "Air‑conditioned vehicle" },
      { text: "Bottled water" },
      { text: "Professional driver-guide" },
      { text: "Island bus tour" },
    ],

    excluded: [{ text: "Lunch" }, { text: "Personal purchases" }],

    pickupOptions: [
      "Cape Town CBD",
      "Green Point",
      "Sea Point",
      "Custom pickup on request",
    ],

    requirements: [
      { text: "Please carry identification if required for ferry boarding" },
    ],

    arrangements: {
      availability: "Available all year (ferry dependent on weather)",
      duration: "4 - 5 hours",
      operatingTime: "09:00, 11:00, 13:00 departures",
      departure: "Flexible (09:00, 11:00, 13:00)",
      return: "Flexible (approximately 3.5-4 hours after departure)",
      location: "Nelson Mandela Gateway, V&A Waterfront, Cape Town",

      clothing: [
        "Comfortable clothing",
        "Comfortable walking shoes",
        "Warm jacket (weather dependent)",
        "Sunscreen",
        "Hat",
      ],

      thingsToBring: [
        "Identification (if required for ferry boarding)",
        "Camera",
        "Cash for personal purchases",
      ],

      passengerPolicy: "",
      sunsetNote: "",
    },

    weatherPolicy: {
      summary:
        "Ferry operations are subject to weather and sea conditions. Cancelled departures may be rescheduled where possible.",
      items: [
        { text: "Ferry operations are subject to weather and sea conditions" },
        { text: "Weather may result in ferry delays or cancellations" },
        { text: "Cancelled departures may be rescheduled where possible" },
      ],
    },

    cancellationPolicy: {
      summary:
        "Ferry operations are subject to weather and sea conditions. Cancellation terms are confirmed upon booking.",
      items: [
        { text: "Ferry operations are subject to weather and sea conditions" },
        { text: "Weather may result in ferry delays or cancellations" },
        { text: "Cancelled departures may be rescheduled where possible" },
        { text: "Cancellation terms are confirmed upon booking" },
      ],
    },

    safetyPolicy: {
      summary:
        "All tours are conducted in compliance with Robben Island Museum safety regulations and ferry operating procedures.",
      items: [
        { text: "All tours follow Robben Island Museum safety regulations" },
        { text: "Ferry operates according to maritime safety standards" },
        { text: "Guests must follow all guide instructions during the tour" },
      ],
    },

    routeInformation: {
      title: "Robben Island Half Day Tour Route",

      description:
        "Discover the historic Robben Island, a UNESCO World Heritage Site and former prison where Nelson Mandela was held for 18 of his 27 years.",

      items: [
        "Hotel pickup in Cape Town CBD, Green Point, or Sea Point",
        "Nelson Mandela Gateway at the V&A Waterfront",
        "30-minute ferry crossing to Robben Island",
        "Island bus tour",
        "Maximum Security Prison tour",
        "Nelson Mandela's prison cell",
        "Robert Sobukwe House",
        "Lime Quarry",
        "Return ferry crossing",
        "Hotel drop-off",
      ],
    },

    needToKnow: [
      { text: "Morning and afternoon departures are available" },
      { text: "Ferry departures are weather dependent" },
      {
        text: "Ferry times: 09:00 (best for calm seas), 11:00 (mid-morning), 13:00 (most popular)",
      },
      { text: "The crossing takes approximately 30 minutes each way" },
      { text: "Advance booking is highly recommended" },
      { text: "Please carry identification if required for ferry boarding" },
      { text: "Comfortable walking shoes are recommended" },
      {
        text: "Total tour duration is 3.5-4 hours (excluding pickup/drop-off)",
      },
    ],

    faqs: [
      {
        question: "Is the ferry ticket included?",
        answer: "Yes. Return ferry tickets are included in the tour price.",
      },
      {
        question: "Is hotel pickup included?",
        answer:
          "Yes. Pickup and drop-off are included for Cape Town CBD, Green Point, and Sea Point.",
      },
      {
        question: "How long is the tour?",
        answer:
          "The complete experience lasts approximately 4–5 hours, including hotel transfer. The island visit itself is 3.5-4 hours including the ferry crossing.",
      },
      {
        question: "Can weather affect the tour?",
        answer:
          "Yes. Ferry departures depend on weather and sea conditions and may occasionally be delayed or cancelled. Cancelled departures may be rescheduled where possible.",
      },
      {
        question: "What are the ferry departure times?",
        answer:
          "Ferries depart at 09:00 (best for calm seas), 11:00 (mid-morning), and 13:00 (most popular).",
      },
      {
        question: "Who guides the tour on the island?",
        answer:
          "The island tour is conducted by Robben Island Museum guides, often former political prisoners who share firsthand experiences.",
      },
      {
        question: "What will I see on the tour?",
        answer:
          "You will visit the Maximum Security Prison, Nelson Mandela's cell, Robert Sobukwe House, Lime Quarry, WWII bunkers, Leper Church, and enjoy an island bus tour.",
      },
      {
        question: "Is lunch included?",
        answer:
          "No. Lunch and personal purchases are excluded from the tour price.",
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
      "Prison Tour",
      "World Heritage Site",
    ],
  },
  // Cape flats + Mannenburg
  {
    id: 12 || "heritage-tour", // New tour ID to be assigned (e.g., 34)
    type: TOUR_TYPES.HISTORICAL,
    category: TOUR_MODIFIERS.FULL_DAY,
    onPromo: true,

    title: "Heritage, Faith & Cape Flats Community Tour",
    slug: "heritage-faith-cape-flats-community-tour",
    canonicalPath: "/tours/heritage-faith-cape-flats-community-tour",
    childFriendly: true,
    daysInAdvance: 3,
    seo: {
      title:
        "Full‑Day Heritage, Faith & Cape Flats Community Tour | Cape Frontier Tours",
      description:
        "A powerful cultural immersion into Cape Town's Coloured heritage — exploring Islamic and Christian roots, slavery, forced removals, and modern community life. Includes traditional Cape Malay lunch and community upliftment through food distribution.",
      keywords: [
        "Cape Flats tour",
        "Manenberg tour",
        "Bo-Kaap tour",
        "Cape Malay heritage",
        "Coloured heritage Cape Town",
        "Cape Town cultural tour",
        "Slave Lodge tour",
        "Auwal Masjid",
        "District Six forced removals",
        "community upliftment tour",
        "Cape Town township tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/cape-flats-heritage-faith"),
    images: getTourImages("historical/cape-flats-heritage-faith", 3),
    imageFolder: "historical/cape-flats-heritage-faith",
    videos: [],

    location:
      "Cape Town, South Africa (Bo-Kaap, CBD, Sherwood Park, Manenberg)",
    duration: "7 hours (09:00 – 16:00)",

    priceBase: 2500, // Price not specified in the brief
    minPeople: 4,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 2500,
        note: "Minimum 2 participants.",
      },
      {
        category: "Teens (12-17)",
        pricePerPerson: 2500,
        note: "Same as adults.",
      },
      {
        category: "Children under 12",
        pricePerPerson: 0,
        note: "Minimum 1 adult participants.",
      },
    ],

    additionalPricing: [],
    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      countsTowardTier: {
        teens: true, // default true, matches current behaviour
        children: true,
        toddlers: false,
      },
      tiers: [
        // {
        //   minPeople: 2,
        //   maxPeople: 3,
        //   perPerson: 2500,
        //   discountPercent: null,
        //   label: "2-3 Guests",
        //   note: "All-inclusive",
        // },
        // {
        //   minPeople: 4,
        //   maxPeople: 6,
        //   perPerson: 2300,
        //   discountPercent: null,
        //   label: "4-6 Guests",
        //   note: "All-inclusive",
        // },
        // {
        //   minPeople: 6,
        //   maxPeople: 6,
        //   perPerson: null,
        //   groupTotal: 13500,
        //   discountPercent: null,
        //   label: "4-6 Guests",
        //   note: "Group total • All-inclusive",
        // },
        {
          minPeople: 7,
          maxPeople: 12,
          perPerson: null,
          groupTotal: null,
          discountPercent: 20,
          label: "7+ Guests",
          note: "Group total • All-inclusive",
        },
      ],
    },

    description:
      "A powerful cultural immersion into Cape Town's Coloured heritage — exploring Islamic and Christian roots, slavery, forced removals, and modern community life. Guests enjoy a traditional Cape Malay lunch and take part in meaningful community upliftment through food distribution. Every booking directly supports underprivileged families.",

    highlights: [
      { text: "Bo-Kaap cultural introduction and photography" },
      { text: "Auwal Masjid — South Africa's oldest mosque (1794)" },
      { text: "Slave Lodge Museum — slavery, colonialism, and human rights" },
      { text: "Sendingkerk (Sendinggestig) — historic mission church" },
      { text: "Traditional Cape Malay lunch in Sherwood Park" },
      { text: "Manenberg community visit and food distribution" },
      { text: "Meaningful community upliftment through every booking" },
      { text: "Guided by respectful, ethical tourism principles" },
    ],

    included: [
      { text: "Reliable driver and transport" },
      { text: "Hotel pickup and drop-off" },
      { text: "Bottled water" },
      { text: "Breakfast on the go (light snack)" },
      { text: "Lunch (traditional Cape Malay or Cape Town home-style dishes)" },
      { text: "Community engagement and briefing" },
      { text: "All entry fees" },
      { text: "Professional registered guide" },
    ],

    excluded: [{ text: "Personal purchases" }, { text: "Gratuities" }],

    pickupOptions: [
      "Cape Town CBD",
      "Green Point",
      "Sea Point",
      "V&A Waterfront",
      "Custom pickup on request",
    ],

    requirements: [
      { text: "Comfortable walking shoes recommended" },
      { text: "Respectful behaviour towards the local community is expected" },
    ],

    arrangements: {
      availability: "Available all year",
      duration: "7 hours",
      operatingTime: "09:00 – 16:00",
      departure: "09:00",
      return: "16:00",
      location: "Cape Town, South Africa",

      clothing: [
        "Comfortable clothing",
        "Comfortable walking shoes",
        "Sunscreen",
        "Hat",
      ],

      thingsToBring: ["Camera", "Cash for personal purchases", "Water bottle"],

      passengerPolicy: "",
      sunsetNote: "",
    },

    weatherPolicy: {
      summary:
        "Tour operates in all weather conditions. Cape Town weather can change quickly — bring an umbrella or rain jacket.",
      items: [
        { text: "Tour operates in all weather conditions" },
        { text: "Bring an umbrella or rain jacket if rain is forecast" },
        { text: "Some outdoor portions may be adjusted in extreme weather" },
      ],
    },

    cancellationPolicy: {
      summary:
        "Private tour bookings require advance confirmation. Route adjustments may occur when necessary.",
      items: [
        { text: "Private bookings require advance confirmation" },
        { text: "Route adjustments may occur when necessary" },
        { text: "Final cancellation policy is confirmed upon booking" },
      ],
    },

    safetyPolicy: {
      summary:
        "Cape Frontier Travel & Tours operates under full compliance with South African tourism and transport regulations. All tours are conducted with structured risk planning, pre-visit area assessments, guided movement, and emergency readiness protocols.",
      items: [
        { text: "Tourism Act 3 of 2014 — full compliance" },
        { text: "City of Cape Town Community Tourism Guidelines followed" },
        {
          text: "Passenger Transport Regulations and licensing requirements met",
        },
        { text: "Public Liability & Passenger Liability Insurance maintained" },
        { text: "Roadworthy & Operating Licence Requirements compliant" },
        { text: "Pre-visit area assessments conducted" },
        {
          text: "Guided movement only — guests follow guide-led navigation at all times",
        },
        { text: "Emergency readiness protocols in place" },
        { text: "Continuous situational awareness maintained" },
        {
          text: "All outreach activities conducted with verified community organisations",
        },
        {
          text: "Guests receive a pre-tour briefing on movement protocols and respectful behavioural expectations",
        },
        {
          text: "All staff trained in cultural sensitivity, conflict de-escalation, first-aid basics, and ethical tourism practices",
        },
        {
          text: "Food distribution conducted in a controlled, hygienic, and dignified manner with proper food handling, crowd management, and community supervision",
        },
        {
          text: "Ethical tourism principles: respectful storytelling, non-exploitation, ensuring community benefit from every booking",
        },
      ],
    },

    stops: [
      {
        id: "bo-kaap",
        name: "Bo-Kaap Arrival & Orientation",
        time: "09:00",
        duration: "1 hour",
        note: "Guided cultural introduction",
        description:
          "Bo-Kaap sits on the slopes of Signal Hill, just above the CBD. It is instantly recognisable by its brightly painted houses, cobblestone streets, and the sound of the Adhaan (call to prayer) from its historic mosques. The area is one of the oldest residential neighbourhoods in South Africa, with homes dating back to the 1760s. Bo-Kaap is deeply tied to the history of the Cape Malay community — descendants of enslaved people and political exiles. Enjoy a guided cultural introduction, photography moments, and a short walk through the iconic colourful neighbourhood.",
        exactLocation: mapLocation({
          label: "Bo-Kaap",
          address: "Bo-Kaap, Cape Town, South Africa",
          query: "Bo-Kaap Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "auwal-masjid",
        name: "Auwal Masjid",
        time: "10:15",
        duration: "30 minutes",
        note: "South Africa's oldest mosque (1794)",
        description:
          "Visit South Africa's oldest mosque, established in 1794. Learn about early Islamic education, community formation, and cultural preservation in the Cape Malay community.",
        exactLocation: mapLocation({
          label: "Auwal Masjid",
          address: "Bo-Kaap, Cape Town, South Africa",
          query: "Auwal Masjid Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "slave-lodge",
        name: "Slave Lodge Museum",
        time: "11:00",
        duration: "1 hour",
        note: "Slavery, colonialism, and human rights",
        description:
          "A deep historical experience covering slavery, colonialism, and human rights. The Slave Lodge is one of Cape Town's oldest buildings and provides powerful insights into South Africa's complex history of slavery and forced labour.",
        exactLocation: mapLocation({
          label: "Slave Lodge Museum",
          address: "Adderley Street, Cape Town, South Africa",
          query: "Slave Lodge Museum Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "sendingkerk",
        name: "Sendingkerk (Sendinggestig)",
        time: "12:00",
        duration: "30 minutes",
        note: "Historic mission church",
        description:
          "Explore the historic mission church connected to education and upliftment. The Sendingkerk played an important role in the spiritual and educational development of the Cape's diverse communities.",
        exactLocation: mapLocation({
          label: "Sendinggestig",
          address: "Cape Town, South Africa",
          query: "Sendinggestig Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "sherwood-park-lunch",
        name: "Lunch in Sherwood Park",
        time: "13:00",
        duration: "1 hour",
        note: "Traditional Cape Malay lunch",
        description:
          "Enjoy Cape Malay or Cape Town home‑style dishes at a local eatery in Sherwood Park. Experience the rich flavours of Cape Malay cuisine, a fusion of Malay, Indonesian, and Cape Dutch influences.",
        exactLocation: mapLocation({
          label: "Sherwood Park",
          address: "Sherwood Park, Cape Town, South Africa",
          query: "Sherwood Park Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "manenberg",
        name: "Manenberg Community Visit & Food Distribution",
        time: "14:20",
        duration: "1 hour",
        note: "Respectful community outreach",
        description:
          "Guests assist in handing out prepared food to families in a Coloured community. This is a respectful, guided outreach focused on dignity and upliftment. Manenberg is a large township on the Cape Flats, created in the late 1960s as part of apartheid's Group Areas Act. It is known for strong family networks, deep Cape Coloured cultural roots, active community organisations, and a mix of hardship, hope, and ongoing upliftment work. Despite decades of social challenges, Manenberg remains a place of identity, pride, and community strength.",
        exactLocation: mapLocation({
          label: "Manenberg",
          address: "Manenberg, Cape Town, South Africa",
          query: "Manenberg Cape Town",
        }),
        images: [],
        touristComments: [],
      },
    ],

    routeInformation: {
      title: "Heritage, Faith & Cape Flats Community Tour Route",

      description:
        "A powerful cultural immersion into Cape Town's Coloured heritage — exploring Islamic and Christian roots, slavery, forced removals, and modern community life.",

      items: [
        "Bo-Kaap — guided cultural introduction and photography",
        "Auwal Masjid — South Africa's oldest mosque (1794)",
        "Slave Lodge Museum — slavery, colonialism, and human rights",
        "Sendingkerk (Sendinggestig) — historic mission church",
        "Lunch in Sherwood Park — traditional Cape Malay cuisine",
        "Manenberg Community Visit — food distribution and community engagement",
      ],
    },

    needToKnow: [
      {
        text: "Bo-Kaap is one of the oldest residential neighbourhoods in South Africa, with homes dating back to the 1760s",
      },
      {
        text: "Manenberg was built by the apartheid government as a relocation zone for Coloured families forcibly removed from District Six, Bo-Kaap, Claremont, Simon's Town, Woodstock, Salt River, and Wynberg",
      },
      {
        text: "Manenberg is not defined by crime — it is defined by history and resilience. The community did not choose its location — it was forced",
      },
      {
        text: "Upliftment projects are a response to decades of structural inequality",
      },
      {
        text: "The people of Manenberg carry a rich cultural identity shaped by survival and strength",
      },
      {
        text: "Every booking directly supports underprivileged families through community upliftment",
      },
      { text: "Modest attire recommended for mosque visits" },
      { text: "Respectful behaviour towards the local community is expected" },
      { text: "Comfortable walking shoes are recommended" },
    ],

    faqs: [
      {
        question: "What is the historical significance of Bo-Kaap?",
        answer:
          "Bo-Kaap is one of the oldest residential neighbourhoods in South Africa, with homes dating back to the 1760s. It is deeply tied to the history of the Cape Malay community — descendants of enslaved people and political exiles.",
      },
      {
        question: "What is Auwal Masjid?",
        answer:
          "Auwal Masjid is South Africa's oldest mosque, established in 1794. It played a crucial role in early Islamic education, community formation, and cultural preservation.",
      },
      {
        question: "Why does Manenberg exist?",
        answer:
          "Manenberg was built by the apartheid government in the late 1960s as a relocation zone for Coloured families forcibly removed from District Six, Bo-Kaap, Claremont, Simon's Town, Woodstock, Salt River, and Wynberg under the Group Areas Act.",
      },
      {
        question: "Is Manenberg safe to visit?",
        answer:
          "Yes. All township visits are conducted with structured risk planning, pre-visit area assessments, guided movement only, and continuous situational awareness. Tours are led by experienced guides with strong community partnerships.",
      },
      {
        question: "What is the food distribution activity?",
        answer:
          "Guests assist in handing out prepared food to families in the Manenberg community. This is a respectful, guided outreach focused on dignity and upliftment. All food distribution is conducted in a controlled, hygienic, and dignified manner with proper food handling, crowd management, and community supervision.",
      },
      {
        question: "Is lunch included?",
        answer:
          "Yes. A traditional Cape Malay or Cape Town home‑style lunch is included in the tour price.",
      },
      {
        question: "What should I wear?",
        answer:
          "Wear comfortable clothing and walking shoes. Modest attire is recommended for mosque visits. Bring sunscreen, a hat, and a jacket depending on the weather.",
      },
      {
        question: "How does this tour benefit the community?",
        answer:
          "Every booking directly supports underprivileged families through community upliftment and food distribution. The tour operates on ethical tourism principles: respectful storytelling, non‑exploitation, and ensuring community benefit from every booking.",
      },
      {
        question: "Is this tour suitable for children?",
        answer:
          "Yes, the tour is family-friendly and offers meaningful cultural education. Please contact us for specific child pricing.",
      },
    ],

    tags: [
      "Heritage",
      "Faith",
      "Cape Flats",
      "Bo-Kaap",
      "Manenberg",
      "Cape Malay",
      "Coloured Heritage",
      "Slavery",
      "Forced Removals",
      "Community",
      "Upliftment",
      "Cultural Tour",
      "Full Day",
      "Cape Town",
      "Historical",
      "Community Engagement",
    ],
  },
  // =========================================== PACKAGES
  // Cape Town City Tour
  {
    id: 13,

    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Cape Town City Tour",
    slug: "full-day-cape-town-city-tour",
    canonicalPath: "/tours/full-day-cape-town-city-tour",
    childFriendly: true,

    seo: {
      title: "Full-Day Cape Town City Tour | Cape Frontier Tours",
      description:
        "Explore Cape Town's history, culture and iconic landmarks on a private full-day city tour visiting Truth Coffee, District Six Museum, Slave Lodge, Castle of Good Hope, Bo-Kaap, Afrogem and Table Mountain.",
      keywords: [
        "Cape Town city tour",
        "full day Cape Town tour",
        "Cape Town private tour",
        "Cape Town historical tour",
        "District Six Museum",
        "Slave Lodge Cape Town",
        "Castle of Good Hope",
        "Bo-Kaap tour",
        "Table Mountain tour",
        "Cape Town cultural tour",
        "Cape Town family tour",
        "Cape Town sightseeing",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage(`${PENINSULA_PACKAGE_ONE_BASE}`),
    // image: 'src/assets/images/tours/packages/cape-town-city-tour/3.webp',
    images: packageGallery(
      PENINSULA_PACKAGE_ONE_BASE,
      PENINSULA_1_DESTINATIONS,
      3,
    ),
    imageFolder: "packages/cape-town-city-tour",
    destinationGalleries: packageDestinationGalleries(
      PENINSULA_PACKAGE_ONE_BASE,
      PENINSULA_1_DESTINATIONS,
      3,
    ),
    videos: [],

    location: "Cape Town, South Africa",
    duration: "Full Day / Approximately 9 Hours",

    priceBase: 1950,
    minPeople: 2,

    pricing: [
      {
        category: "Adults — 1–3 Guests",
        pricePerPerson: 1950,
        note: "Private tour. Includes all adult/child entry fees.",
      },
      {
        category: "Children (12 - 17 years)",
        pricePerPerson: 1000,
        note: "Most popular option. Includes all entry fees.",
      },
      {
        category: "Children under 12.",
        pricePerPerson: 1000,
        note: "Includes all entry fees.",
      },
    ],

    additionalPricing: [],

    /*
     * NOTE:
     * The supplied prices are TOTAL GROUP PRICES, not per-person prices.
     * Your current groupPricing schema uses `perPerson`.
     *
     * If your checkout supports total group pricing, use:
     *
     * pricingMode: "total"
     *
     * and rename `perPerson` to `totalPrice`.
     */
    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",

      tiers: [
        {
          minPeople: 2,
          maxPeople: 3,
          perPerson: 1950,
          label: "2–3 Guests",
          note: "Includes ALL adult/child entry fees.",
        },
        {
          minPeople: 4,
          maxPeople: 7,
          perPerson: 1550,
          label: "4–7 Guests",
          note: "Most popular option. Includes ALL entry fees.",
        },
        {
          minPeople: 8,
          maxPeople: 12,
          perPerson: 1350,
          label: "8–12 Guests",
          note: "Includes ALL entry fees.",
        },
      ],
    },

    description:
      "Discover the history, culture and iconic landmarks of Cape Town on a private full-day city experience. Begin with artisan coffee at the famous Truth Coffee before exploring some of the city's most important heritage sites, including District Six Museum, the Slave Lodge and the Castle of Good Hope. Continue through the colourful streets of Bo-Kaap, experience South Africa's gemstone industry at Afrogem, and finish the day at Table Mountain for panoramic views across Cape Town, the Atlantic Ocean and surrounding mountains. This experience combines Cape Town's complex history, vibrant communities, creative culture and spectacular scenery into one comprehensive private city tour.",

    highlights: [
      {
        text: "Truth Coffee — artisan coffee and iconic steampunk interior",
      },
      {
        text: "District Six Museum — powerful stories of forced removals, displacement and community resilience",
      },
      {
        text: "Slave Lodge — explore the history of slavery and its impact on South African society",
      },
      {
        text: "Adderley Street Flower Market — colourful historic flower market and local vendors",
      },
      {
        text: "Castle of Good Hope — South Africa's oldest surviving colonial building",
      },
      {
        text: "Bo-Kaap — colourful streets, Cape Malay heritage and Auwal Masjid",
      },
      {
        text: "Afrogem — South African gemstone education, jewellery craftsmanship and showroom",
      },
      {
        text: "Table Mountain — cableway experience and panoramic views over Cape Town",
      },
    ],

    included: [
      {
        text: "Private vehicle",
      },
      {
        text: "Professional driver-guide",
      },
      {
        text: "Bottled water",
      },
      {
        text: "ALL entry fees for every person",
      },
      {
        text: "All listed attraction visits",
      },
    ],

    excluded: [
      {
        text: "Lunch",
      },
      {
        text: "Snacks",
      },
      {
        text: "Drinks at Truth Coffee",
      },
      {
        text: "Personal purchases",
      },
      {
        text: "Flowers",
      },
      {
        text: "Souvenirs",
      },
      {
        text: "Jewellery at Afrogem",
      },
      {
        text: "Additional snacks or beverages",
      },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Green Point",
      "Sea Point",
      "V&A Waterfront",
      "Custom pickup on request",
    ],

    requirements: [],

    arrangements: {
      availability: "Available year-round",
      duration: "Approximately 9 hours",
      operatingTime: "08:00 – 17:00",
      departure: "08:00",
      return: "17:00",
      location: "Cape Town City Centre and surrounding areas",

      clothing: [
        "Comfortable walking shoes",
        "Light jacket",
        "Sunscreen",
        "Hat",
        "Camera or phone",
        "Optional small backpack",
      ],

      thingsToBring: [
        "Camera or phone",
        "Sunscreen",
        "Hat",
        "Comfortable walking shoes",
        "Small backpack",
      ],

      passengerPolicy: "",

      notes: [
        "Table Mountain Cableway is weather-dependent",
        "Some attractions involve walking and uneven surfaces",
        "Lunch is not included",
        "Attraction opening hours may affect the exact itinerary",
      ],
    },

    weatherPolicy: {
      summary:
        "The tour operates in most weather conditions, but Table Mountain Cableway is weather-dependent. Cape Town weather can change quickly, so guests should bring a light jacket and sun protection.",

      items: [
        {
          text: "Table Mountain Cableway is weather-dependent",
        },
        {
          text: "Cape Town weather can change quickly",
        },
        {
          text: "Bring a light jacket and sun protection",
        },
        {
          text: "Walking portions may be adjusted depending on weather conditions",
        },
      ],
    },

    cancellationPolicy: {
      summary:
        "Cancellations should be made at least 24 hours before the tour. Late cancellations may result in forfeiture of the refund.",

      items: [
        {
          text: "Cancellations must be made at least 24 hours before departure",
        },
        {
          text: "Late cancellations may result in forfeiture of the refund",
        },
      ],
    },

    safetyPolicy: {
      summary:
        "Guests should follow the instructions of their driver-guide and attraction staff throughout the tour, particularly during walking sections and at Table Mountain.",

      items: [
        {
          text: "Follow instructions from your driver-guide",
        },
        {
          text: "Follow attraction safety instructions",
        },
        {
          text: "Take care on uneven and cobbled surfaces",
        },
        {
          text: "Bo-Kaap includes steep and cobbled streets",
        },
        {
          text: "Castle of Good Hope includes uneven historic surfaces",
        },
        {
          text: "Table Mountain conditions can change quickly",
        },
      ],
    },

    stops: [
      {
        id: "pickup",
        name: "Hotel Pickup",
        time: "Flexible",
        duration: "30 minutes",
        note: "Air‑conditioned transfer",
        description:
          "Enjoy convenient hotel pickup from Cape Town CBD, Green Point, or Sea Point before travelling to Langa Township.",
        exactLocation: mapLocation({
          label: "Cape Town Pickup Area",
          address: "Cape Town, South Africa",
          query: "Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "Truth Coffee",
        name: "Truth Coffee Stop",
        description:
          "Truth Coffee is consistently ranked among the world's best coffee shops. Its striking steampunk interior, featuring brass pipes, vintage machinery and leather seating, creates a theatrical atmosphere and reflects Cape Town's modern creative culture.",

        time: "08:00",
        duration: "35 min",

        type: "food",
        optional: false,

        image: "",

        highlights: [
          "Freshly roasted artisan coffee",
          "Insight into Cape Town's contemporary food and design scene",
          "Relaxed introduction to the day's historical experiences",
          "Photo opportunities inside the iconic steampunk décor",
        ],
      },

      {
        title: "District Six Museum",
        name: "District Six Museum",
        description:
          "District Six Museum preserves the stories of one of Cape Town's most important historic communities. The museum documents the forced removal of more than 60,000 residents during apartheid through personal artefacts, street signs, maps and oral histories.",

        time: "08:35",
        duration: "1 hr 25 min",

        type: "heritage",
        optional: false,

        image: "",

        highlights: [
          "Stories of former District Six residents",
          "Original street maps and community history",
          "Personal artefacts and oral histories",
          "Insight into forced removals and community resilience",
        ],
      },

      {
        title: "Slave Lodge",
        name: "Slave Lodge",
        description:
          "The Slave Lodge is one of South Africa's oldest buildings and explores the history and experiences of enslaved people brought to the Cape from East Africa, Madagascar, India and Southeast Asia.",

        time: "10:00",
        duration: "1 hr 10 min",

        type: "heritage",
        optional: false,

        image: "",

        highlights: [
          "Exhibitions on slavery and identity",
          "Artefacts showing the daily lives of enslaved people",
          "Multimedia displays explaining global slave routes",
          "Educational reflection on colonial history",
        ],
      },

      {
        title: "Adderley Street Flower Market",
        name: "Adderley Street Flower Market",
        description:
          "Visit one of Cape Town's historic flower markets and experience the colourful stalls and generations-old tradition of local flower sellers in the city centre.",

        time: "11:10",
        duration: "30 min",

        type: "culture",
        optional: false,

        image: "",

        highlights: [
          "Roses, proteas, fynbos and seasonal flowers",
          "Interaction with local flower sellers",
          "Colourful street-level photography",
          "Opportunity to support local vendors",
        ],
      },

      {
        title: "Castle of Good Hope",
        name: "Castle of Good Hope",
        description:
          "Built between 1666 and 1679, the Castle of Good Hope is the oldest surviving colonial building in South Africa. Explore its courtyard, bastions and historic rooms while learning about early Cape settlement and military history.",

        time: "11:40",
        duration: "1 hr 20 min",

        type: "heritage",
        optional: false,

        image: "",

        highlights: [
          "Historic courtyard and bastions",
          "Early Dutch settlement history",
          "Military history of the Cape",
          "Historic architecture and photography",
          "Optional dungeon experience",
        ],
      },

      {
        title: "Lunch Break",
        name: "Lunch Break",
        description:
          "Enjoy a relaxed lunch break at one of Cape Town's popular eateries. Guests can choose from Cape Malay, international or casual dining options.",

        time: "13:00",
        duration: "1 hour",

        type: "meal",
        optional: true,

        image: "",

        options: [
          "Eastern Food Bazaar",
          "Bo-Kaap Kombuis",
          "Company's Garden Restaurant",
          "Swan Café",
        ],

        highlights: [
          "Choice of Cape Malay, international or casual dining",
          "Time to rest after the morning's historical experiences",
          "Opportunity to explore local flavours",
        ],
      },

      {
        name: "Bo-Kaap Walking Tour",
        title: "Bo-Kaap Walking Tour",
        description:
          "Explore the colourful streets of Bo-Kaap, the heart of Cape Malay culture. Discover the neighbourhood's Islamic heritage, colourful houses, cobbled streets and cultural traditions.",

        time: "14:10",
        duration: "1 hour",

        type: "culture",
        optional: false,

        image: "",

        highlights: [
          "Walking tour through colourful streets",
          "Visit to Auwal Masjid",
          "Cape Malay cultural storytelling",
          "Photography at iconic houses",
        ],

        optionalActivities: ["Bo-Kaap Museum"],
      },

      {
        title: "Afrogem",
        name: "Afrogem",
        description:
          "Visit Afrogem, a South African gemstone and jewellery manufacturer showcasing locally sourced gems including diamonds, tanzanite and semi-precious stones.",

        time: "15:10",
        duration: "40 min",

        type: "shopping",
        optional: false,

        image: "",

        highlights: [
          "Gemstone education",
          "Showroom experience",
          "Jewellery crafting demonstrations",
          "South African gemstone industry insight",
          "Shopping opportunity",
        ],
      },

      {
        title: "Table Mountain",
        name: "Table Mountain",
        description:
          "Finish the day at Cape Town's most iconic landmark. Ride the Table Mountain Cableway to the summit and enjoy panoramic views over Cape Town, Robben Island, Lion's Head, Camps Bay and the Twelve Apostles.",

        time: "15:50",
        duration: "1 hr 10 min",

        type: "scenic",
        optional: false,

        image: "",

        highlights: [
          "Table Mountain Cableway",
          "360-degree panoramic views",
          "Scenic viewpoints",
          "Light walking at the summit",
          "Excellent photography opportunities",
        ],

        notes: ["Weather-dependent experience"],
      },

      {
        name: "Hotel Drop-off",
        title: "Drop-off",
        description:
          "Return to the agreed drop-off location in Cape Town after completing the city tour.",

        time: "17:00",
        duration: "",

        type: "transfer",
        optional: false,

        image: "",
      },
    ],
    // routeInformation: {
    //   title: "Cape Town City Tour Route",
    //   description:
    //     "A private full-day Cape Town experience combining heritage, culture, shopping and Table Mountain.",
    //   items: [
    //     "Truth Coffee",
    //     "District Six Museum",
    //     "Slave Lodge",
    //     "Adderley Street Flower Market",
    //     "Castle of Good Hope",
    //     "Bo-Kaap",
    //     "Afrogem",
    //     "Table Mountain",
    //   ],
    // },
    accommodation: {
      included: false,
      type: "",
      description: "",
    },

    needToKnow: [
      {
        text: "Table Mountain Cableway is weather-dependent",
      },
      {
        text: "Lunch is not included in the tour price",
      },
      {
        text: "Drinks at Truth Coffee are not included",
      },
      {
        text: "Personal purchases, flowers, souvenirs and jewellery are not included",
      },
      {
        text: "Bo-Kaap includes steep and cobbled streets",
      },
      {
        text: "Castle of Good Hope includes uneven historic surfaces",
      },
      {
        text: "Table Mountain requires light walking at the summit",
      },
      {
        text: "Optional visit to Bo-Kaap Museum",
      },
      {
        text: "The itinerary may be adjusted according to attraction operating hours and weather",
      },
    ],

    faqs: [
      {
        question: "How long is the Cape Town City Tour?",

        answer:
          "The tour operates approximately from 08:00 to 17:00, making it a full-day Cape Town experience.",
      },

      {
        question: "What is included in the tour price?",

        answer:
          "The tour includes a private vehicle, professional driver-guide, bottled water, all entry fees and all listed attraction visits.",
      },

      {
        question: "Is lunch included?",

        answer:
          "No. Lunch is not included. Guests can choose from several recommended restaurants and cafés during the scheduled lunch break.",
      },

      {
        question: "Is Truth Coffee included?",

        answer:
          "The visit to Truth Coffee is included, but drinks and personal purchases are not included.",
      },

      {
        question: "Is Table Mountain included?",

        answer:
          "Yes. The Table Mountain Cableway experience is included in the tour price, subject to weather and cableway operating conditions.",
      },

      {
        question: "Can children join the tour?",

        answer:
          "Yes. The private group prices include both adult and child entry fees.",
      },

      {
        question: "Is this a private tour?",

        answer:
          "Yes. This is a private tour with a dedicated vehicle and professional driver-guide.",
      },

      {
        question: "What should I wear?",

        answer:
          "Wear comfortable walking shoes and bring a light jacket, sunscreen and a hat. A small backpack is optional.",
      },

      {
        question: "Is the tour wheelchair friendly?",

        answer:
          "Several attractions are wheelchair accessible, including Truth Coffee, the Slave Lodge, the Flower Market, Afrogem and the Table Mountain Cableway. District Six Museum and the Castle of Good Hope have some accessibility limitations, while Bo-Kaap has steep and cobbled streets.",
      },

      {
        question: "Can we visit the Bo-Kaap Museum?",

        answer:
          "Yes. A visit to the Bo-Kaap Museum can be included as an optional stop depending on timing and operating hours.",
      },
    ],

    tags: [
      "Cape Town",
      "Cape Town City Tour",
      "Full Day",
      "Private Tour",
      "District Six",
      "Slave Lodge",
      "Castle of Good Hope",
      "Bo-Kaap",
      "Table Mountain",
      "Truth Coffee",
      "Afrogem",
      "Cape Malay",
      "History",
      "Heritage",
      "Culture",
      "Family Friendly",
      "Wheelchair Accessible",
      "Sightseeing",
    ],
  },
  // Peninsula Tour
  {
    id: 14,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,
    onPromo: true,
    title: "Cape Peninsula Tour",
    slug: "peninsula-tour-2",
    canonicalPath: "/tours/peninsula-tour-2",
    childFriendly: true,

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

    image: getCoverImage(`${PENINSULA_PACKAGE_TWO_BASE}`),
    images: packageGallery(
      PENINSULA_PACKAGE_TWO_BASE,
      PENINSULA_2_DESTINATIONS,
      3,
    ),
    imageFolder: "packages/peninsula-tour-2",
    destinationGalleries: packageDestinationGalleries(
      PENINSULA_PACKAGE_TWO_BASE,
      PENINSULA_2_DESTINATIONS,
      3,
    ),

    location: "Cape Peninsula, Cape Town",
    duration: "Full Day",

    priceBase: 2500,
    minPeople: 2,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 2500,
        note: "Includes all entry fees.",
      },
      {
        category: "Children (12–17 years)",
        pricePerPerson: 2500,
        note: "Same price as adults. Includes all entry fees.",
      },
      {
        category: "Children (5-11 years)",
        pricePerPerson: 1900,
        note: "Includes all entry fees.",
      },
      {
        category: "Children (0-4 years)",
        pricePerPerson: 0,
        note: "Free for children under 5.",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 5,
          maxPeople: 5,
          discountPercent: 15,
          note: "Private vehicle • All-inclusive",
        },
      ],
    },

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
        images: getTourImages(`shared/sea-point`, 3),
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
        images: getTourImages(`shared/camps-bay`, 3),
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
        images: getTourImages(`shared/cape-point`, 2),
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
        images: getTourImages(`shared/boulders-beach`, 3),
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
        touristComments: [],
      },
    ],

    groupDiscount: {
      enabled: true,
      icon: "/icons/savemore.png",
      rules: [
        { minPeople: 5, discountPercent: 10 },
        { minPeople: 7, discountPercent: 15 },
      ],
    },

    needToKnow: [
      { text: "Some entrance fees may be separate" },
      { text: "Full-day availability required" },
      { text: "Route may adjust due to weather or traffic" },
      {
        text: "Package galleries now pull multiple images per destination folder",
      },
    ],

    weatherPolicy: {
      summary:
        "Weather conditions can affect the route, timing, and accessibility of certain stops.",
      items: [
        { text: "Some stops may be shortened or skipped due to weather" },
        { text: "Final route adjustments will be confirmed with the client" },
        { text: "Weather-related changes may affect timing and duration" },
      ],
    },

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
  // District-Six + Langa
  {
    id: 17, // New tour ID to be assigned (e.g., 37)
    type: TOUR_TYPES.HISTORICAL,
    category: TOUR_MODIFIERS.HALF_DAY,

    title: "District Six + Langa Combined Tour Package",
    slug: "district-six-langa-combined-tour",
    canonicalPath: "/tours/district-six-langa-combined-tour",
    childFriendly: true,

    seo: {
      title: "District Six & Langa Combined Tour Package | Cape Frontier Tours",
      description:
        "A powerful, emotionally rich half‑day experience connecting Cape Town's past, present, and community future. Explore District Six — the heart of forced removals — and Langa, Cape Town's oldest Black township.",
      keywords: [
        "District Six tour",
        "Langa township tour",
        "District Six Museum",
        "Langa cultural experience",
        "Cape Town forced removals",
        "Cape Town township tour",
        "Guga S'thebe",
        "District Six land restitution",
        "Cape Town heritage tour",
        "combined tour Cape Town",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage("historical/district-six-langa"),
    images: getTourImages("historical/district-six-langa", 3),
    imageFolder: "historical/district-six-langa",
    videos: [],

    location: "Cape Town, South Africa (District Six, Langa)",
    duration: "Half Day (4 - 5 hours)",

    priceBase: 2300,
    minPeople: 2,

    pricing: [
      {
        category: "Adults (2–3 Guests)",
        pricePerPerson: 2300,
        note: "Full rate",
      },

      {
        category: "Teens (13–17 years)",
        pricePerPerson: 2300,
        note: "Adult rate depending on group size",
      },
      {
        category: "Children (4–12 years)",
        pricePerPerson: 1200,
        note: "",
      },
      {
        category: "Children (0–3 years)",
        pricePerPerson: 0,
        note: "Free of charge",
      },
    ],

    additionalPricing: [],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 2,
          maxPeople: 3,
          perPerson: 2300,
          discountPercent: 0,
          label: "2–3 Guests",
          note: "Full rate • All-inclusive",
        },
        {
          minPeople: 4,
          maxPeople: 4,
          perPerson: null,
          discountPercent: 10,
          label: "4 Guests",
          note: "10% discount • All-inclusive",
        },
        {
          minPeople: 5,
          maxPeople: 7,
          perPerson: null,
          discountPercent: 15,
          label: "5–7 Guests",
          note: "15% discount • All-inclusive",
        },
      ],
    },
    description:
      "A powerful, emotionally rich half‑day experience connecting Cape Town's past, present, and community future. This combined tour brings together District Six — the heart of forced removals — and Langa, Cape Town's oldest Black township. Guests experience two deeply significant communities in one seamless narrative: displacement → resilience → cultural revival.",

    highlights: [
      {
        text: "District Six Museum — stories of families forcibly removed, the vibrant culture that once filled the streets, and the ongoing fight for land restitution",
      },
      {
        text: "Drive through the old District Six area — empty land awaiting restitution, churches and landmarks that survived demolition, and the contrast between past destruction and present rebuilding",
      },
      {
        text: "Langa Township arrival — history of Langa as the first planned Black township, resistance movements, cultural identity, and modern community upliftment projects",
      },
      {
        text: "Guga S'thebe Arts & Culture Centre — art studios, ceramic workshops, community craft markets, and colourful murals",
      },
      {
        text: "Guided Cultural Walk Through Langa — traditional hostels and modern housing, local entrepreneurship, daily life, and community upliftment initiatives",
      },
      { text: "Authentic, safe, and meaningful community interaction" },
    ],

    included: [
      { text: "Hotel pick‑up and drop‑off" },
      { text: "Driver‑guide" },
      { text: "District Six Museum entry" },
      { text: "Langa community guide" },
      { text: "Guga S'thebe visit" },
      { text: "Langa cultural walk" },
      { text: "Bottled water" },
      { text: "All entry fees" },
    ],

    excluded: [
      { text: "Meals" },
      { text: "Personal purchases" },
      { text: "Optional upgrades" },
      { text: "Gratuities" },
    ],

    pickupOptions: [
      "Cape Town CBD",
      "Green Point",
      "Sea Point",
      "V&A Waterfront",
      "Custom pickup on request",
    ],

    requirements: [
      { text: "Comfortable walking shoes recommended" },
      { text: "Respectful behaviour towards the local community is expected" },
      { text: "Please ask permission before photographing residents" },
    ],

    arrangements: {
      availability: "Available all year",
      duration: "Half Day (4 - 5 hours)",
      operatingTime: "Flexible",
      departure: "Flexible",
      return: "Flexible",
      location: "Cape Town, South Africa",

      clothing: [
        "Comfortable clothing",
        "Comfortable walking shoes",
        "Sunscreen",
        "Hat",
      ],

      thingsToBring: ["Camera", "Cash for personal purchases", "Water bottle"],

      passengerPolicy: "",
      sunsetNote: "",
    },

    weatherPolicy: {
      summary:
        "Tour operates in all weather conditions. Cape Town weather can change quickly — bring an umbrella or rain jacket.",
      items: [
        { text: "Tour operates in all weather conditions" },
        { text: "Bring an umbrella or rain jacket if rain is forecast" },
        { text: "Some outdoor portions may be adjusted in extreme weather" },
      ],
    },

    cancellationPolicy: {
      summary:
        "Private tour bookings require advance confirmation. Route adjustments may occur when necessary.",
      items: [
        { text: "Private bookings require advance confirmation" },
        { text: "Route adjustments may occur when necessary" },
        { text: "Final cancellation policy is confirmed upon booking" },
      ],
    },

    safetyPolicy: {
      summary:
        "Langa is considered one of the safer townships when visited with local guides. District Six Museum visits are conducted in a safe, guided environment.",
      items: [
        {
          text: "Langa is considered one of the safer townships when visited with local guides",
        },
        { text: "Please ask permission before photographing residents" },
        {
          text: "Respectful behaviour towards the local community is expected",
        },
        { text: "Tours are conducted with experienced local community guides" },
        { text: "All museum visits follow standard safety protocols" },
      ],
    },

    stops: [
      {
        id: "district-six-museum",
        name: "District Six Museum",
        time: "Flexible",
        duration: "1 - 1.5 hours",
        note: "Heart of forced removals",
        description:
          "Explore the District Six Museum, which tells the stories of families forcibly removed from this vibrant community during apartheid. Learn about the vibrant culture that once filled the streets and the ongoing fight for land restitution. This stop sets the emotional foundation for the rest of the tour.",
        exactLocation: mapLocation({
          label: "District Six Museum",
          address: "25A Buitenkant Street, Cape Town, South Africa",
          query: "District Six Museum Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "district-six-drive",
        name: "Drive Through the Old District Six Area",
        time: "Flexible",
        duration: "20 minutes",
        note: "Empty land awaiting restitution",
        description:
          "Drive through the old District Six area to experience the empty land still awaiting restitution, churches and landmarks that survived demolition, and the contrast between past destruction and present rebuilding. This creates a powerful visual connection to the museum's stories.",
        exactLocation: mapLocation({
          label: "District Six",
          address: "District Six, Cape Town, South Africa",
          query: "District Six Cape Town",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "langa-arrival",
        name: "Langa Township Arrival",
        time: "Flexible",
        duration: "15 minutes",
        note: "Welcome to Cape Town's oldest Black township",
        description:
          "Arrive in Langa, Cape Town's oldest Black township. Your local accredited community guide welcomes you and shares the history of Langa as the first planned Black township, resistance movements, cultural identity, and modern community upliftment projects.",
        exactLocation: mapLocation({
          label: "Langa Township",
          address: "Langa, Cape Town, South Africa",
          query: "Langa Township",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "guga-sthebe",
        name: "Guga S'thebe Arts & Culture Centre",
        time: "Flexible",
        duration: "30 - 45 minutes",
        note: "Art studios, ceramic workshops, craft markets",
        description:
          "Explore one of Langa's best-known cultural landmarks. Guests discover art studios, ceramic workshops, community craft markets, and colourful murals and cultural expressions. This is one of the most photographed locations in Langa.",
        exactLocation: mapLocation({
          label: "Guga S'thebe Arts & Culture Centre",
          address: "Langa, Cape Town, South Africa",
          query: "Guga Sthebe Langa",
        }),
        images: [],
        touristComments: [],
      },
      {
        id: "langa-cultural-walk",
        name: "Guided Cultural Walk Through Langa",
        time: "Flexible",
        duration: "1 - 1.5 hours",
        note: "Traditional hostels, local entrepreneurship, daily life",
        description:
          "Your guide leads you through traditional hostels and modern housing, local entrepreneurship, daily life in Langa, and community upliftment initiatives. This is the most interactive part of the tour — authentic, safe, and meaningful.",
        exactLocation: mapLocation({
          label: "Langa Township",
          address: "Langa, Cape Town, South Africa",
          query: "Langa Township",
        }),
        images: [],
        touristComments: [],
      },
    ],

    routeInformation: {
      title: "District Six + Langa Combined Tour Route",

      description:
        "A powerful, emotionally rich half‑day experience connecting Cape Town's past, present, and community future.",

      items: [
        "District Six Museum — stories of forced removals, vibrant culture, and land restitution",
        "Drive through the old District Six area — empty land, surviving landmarks, past vs present",
        "Langa Township arrival — first planned Black township, resistance movements, modern upliftment",
        "Guga S'thebe Arts & Culture Centre — art studios, ceramic workshops, craft markets, murals",
        "Guided Cultural Walk — traditional hostels, local entrepreneurship, daily life, community initiatives",
      ],
    },

    needToKnow: [
      {
        text: "District Six Museum tells the stories of families forcibly removed during apartheid",
      },
      {
        text: "The old District Six area still has empty land awaiting restitution",
      },
      {
        text: "Langa is Cape Town's oldest Black township, established in 1927",
      },
      {
        text: "Guga S'thebe is one of the most photographed locations in Langa",
      },
      { text: "Please ask permission before photographing residents" },
      { text: "Respectful behaviour towards the local community is expected" },
      { text: "Comfortable walking shoes are recommended" },
      { text: "Children 0–3 years are free of charge" },
    ],

    faqs: [
      {
        question: "What is the historical significance of District Six?",
        answer:
          "District Six was a vibrant, multi-racial community in Cape Town before the apartheid government declared it a 'whites only' area under the Group Areas Act. Over 60,000 residents were forcibly removed, and their homes were bulldozed. The District Six Museum preserves their stories and the ongoing fight for land restitution.",
      },
      {
        question: "What is Langa?",
        answer:
          "Langa is Cape Town's oldest Black township, established in 1927. It played a pivotal role in the anti-apartheid struggle and today is a vibrant community with strong cultural identity, local entrepreneurship, and community upliftment projects.",
      },
      {
        question: "What is Guga S'thebe?",
        answer:
          "Guga S'thebe is an Arts & Culture Centre in Langa that showcases local art, crafts, pottery, and community projects. It is one of the most photographed locations in Langa and a hub for creative expression.",
      },
      {
        question: "Is Langa safe to visit?",
        answer:
          "Yes. Langa is considered one of the safer townships when visited with local community guides. The tour is conducted with experienced guides who ensure a safe and meaningful experience.",
      },
      {
        question: "How long is the tour?",
        answer:
          "The combined tour is a half‑day experience lasting approximately 4–5 hours.",
      },
      {
        question: "Are entry fees included?",
        answer:
          "Yes. All entry fees, transport, guides, and bottled water are included in the tour price.",
      },
      {
        question: "Are meals included?",
        answer:
          "No. Meals, personal purchases, optional upgrades, and gratuities are excluded from the tour price.",
      },
      {
        question: "Can children join?",
        answer:
          "Yes. Children 0–3 years are free, children 4–12 years are R1,200, and teens 13–17 years pay the adult rate depending on group size.",
      },
      {
        question: "What should I bring?",
        answer:
          "Bring comfortable walking shoes, sunscreen, a hat, your camera, and cash for personal purchases.",
      },
      {
        question: "What is the connection between District Six and Langa?",
        answer:
          "The combined tour creates a seamless narrative from displacement (District Six forced removals) to resilience and cultural revival (Langa's ongoing community strength). Many families forcibly removed from District Six were relocated to townships like Langa on the Cape Flats.",
      },
    ],

    tags: [
      "District Six",
      "Langa",
      "Township",
      "Heritage",
      "History",
      "Forced Removals",
      "Cultural Tour",
      "Cape Town",
      "Half Day",
      "Museum",
      "Community",
      "Authentic Experience",
      "Combined Tour",
    ],
  },
  // Cool-Runnings Toboggan Park, Winelands & Adventure Loop
  {
    id: 21,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Cool Runnings Toboggan Park, Winelands & Adventure Loop",
    slug: "cool-runnings-toboggan-park",
    canonicalPath: "/tours/cool-runnings-toboggan-park",
    childFriendly: true,

    seo: {
      title: "",
      description:
        "A full-day guided experience from Cape Town combining adventure, wildlife, artisanal chocolate tasting, scenic Winelands views, Franschhoek village exploration, and Babylonstoren Farm & Gardens.",
      keywords: [],
    },

    workflow: defaultWorkflow,

    image: "/src/assets/images/tours/packages/cool-runnings/1.webp",
    images: [],
    imageFolder: "packages/cool-runnings/",
    videos: [],

    location: "Cape Town → Winelands → Cape Town",
    duration: "Full Day",

    priceBase: 1865,
    minPeople: 2,

    pricing: [
      {
        category: "Adult",
        pricePerPerson: 1865,
        note: "",
      },
      {
        category: "Child (4–12 years)",
        pricePerPerson: 1110,
        note: "",
      },
      {
        category: "Infant (0–3 years)",
        pricePerPerson: 0,
        note: "Free",
      },
    ],

    additionalPricing: [
      {
        type: "external",
        category: "Babylonstoren Wine Tasting",
        price: null,
        note: "Optional. Charged separately by the estate unless requested to be added to the tour pricing.",
      },
    ],

    groupPricing: {
      enabled: false,
      icon: "",
      tiers: [],
    },

    description:
      "A full-day guided experience starting and ending in Cape Town. Guests enjoy a mix of adrenaline, animal encounters, artisanal chocolate tasting, scenic Winelands views, Franschhoek village exploration, and the world-famous Babylonstoren gardens. Perfect for families, couples, and small groups.",

    highlights: [
      {
        text: "Cool Runnings Toboggan Park – adventure start with gravity-powered toboggan rides",
      },
      {
        text: "The Alpaca Loom Coffee Shop & Weaving Studio – alpaca encounters, coffee, and weaving",
      },
      {
        text: "Franschhoek Village – scenic exploration, cafés, galleries, and optional wine tasting",
      },
      {
        text: "Huguenot Fine Chocolates – Belgian-style artisanal chocolate tasting",
      },
      {
        text: "Babylonstoren Farm & Gardens – gardens, farm experience, and optional wine tasting",
      },
    ],

    included: [
      {
        text: "Professional driver-guide",
      },
      {
        text: "Entrance fees",
      },
      {
        text: "Air-conditioned vehicle",
      },
      {
        text: "Bottled water",
      },
      {
        text: "All transport between stops",
      },
    ],

    excluded: [
      {
        text: "Lunch",
      },
      {
        text: "Personal purchases",
      },
      {
        text: "Babylonstoren wine tasting unless requested to be added to the pricing",
      },
    ],

    pickupOptions: ["Cape Town"],

    requirements: [],

    arrangements: {
      availability: "",
      duration: "Full Day",
      operatingTime: "",
      departure: "08:00",
      return: "17:00",
      location: "Cape Town → Winelands → Cape Town",

      clothing: [],

      thingsToBring: [],

      passengerPolicy: "",
      notes: [],
    },

    weatherPolicy: {
      summary: "",
      items: [],
    },

    /*
     * FULL-DAY ITINERARY / STOPS
     */
    stops: [
      {
        stop: 1,
        title: "Cool Runnings Toboggan Park",
        subtitle: "Adventure Start",
        location: "",
        time: "08:30 – 10:00",
        duration: "1.5 hours",
        type: "adventure",
        optional: false,

        description:
          "Cool Runnings is South Africa's only outdoor toboggan track, offering a gravity-powered ride down a steel half-pipe. Set against the backdrop of Tyger Valley's rolling hills, the attraction combines fun, speed, and safety. Guests control their own speed, allowing the experience to be as thrilling or relaxed as they choose.",

        highlights: [
          {
            text: "Safety briefing followed by multiple exhilarating runs",
          },
          {
            text: "Smooth, scenic descent with panoramic views",
          },
          {
            text: "Fun, competitive atmosphere as guests race each other",
          },
          {
            text: "Photo opportunities at the track",
          },
        ],

        image: ["/src/assets/images/tours/packages/cool-runnings/5.webp"],
      },

      {
        stop: 2,
        title: "The Alpaca Loom Coffee Shop & Weaving Studio",
        subtitle: "Animals & Coffee",
        location: "Paarl",
        time: "10:30 – 11:30",
        duration: "1 hour",
        type: "wildlife",
        optional: false,

        description:
          "Nestled in the rural outskirts of Paarl, The Alpaca Loom is a tranquil farm experience where guests meet gentle alpacas and learn about the craft of weaving. The farm showcases the process of transforming alpaca fleece into luxurious textiles, while the coffee shop overlooks the paddocks.",

        highlights: [
          {
            text: "Feeding and interacting with friendly alpacas",
          },
          {
            text: "Watching skilled artisans weave alpaca fibre",
          },
          {
            text: "Enjoying freshly brewed coffee and homemade treats",
          },
          {
            text: "Browsing a boutique shop with scarves, blankets, and handmade goods",
          },
        ],
      },

      {
        stop: 3,
        title: "Franschhoek Village Exploration",
        subtitle: "Scenic Exploration",
        location: "Franschhoek",
        time: "12:00 – 14:00",
        duration: "2 hours",
        type: "scenic",
        optional: false,

        description:
          "Franschhoek is one of South Africa's oldest towns, founded by French Huguenots in the 17th century. Today it is a world-renowned culinary and wine destination surrounded by dramatic mountain ranges and vineyards. The village blends European charm with South African hospitality.",

        highlights: [
          {
            text: "Scenic walk through the village's main street",
          },
          {
            text: "Optional wine tasting at nearby estates",
          },
          {
            text: "Lunch at one of Franschhoek's cafés or bistros",
          },
          {
            text: "Visits to art galleries, craft shops, and heritage landmarks",
          },
        ],

        image: "",
      },

      {
        stop: 4,
        title: "Huguenot Fine Chocolates",
        subtitle: "Belgian Chocolate Tasting",
        location: "Franschhoek",
        time: "14:00 – 14:30",
        duration: "30 minutes",
        type: "food",
        optional: false,

        description:
          "Huguenot Fine Chocolates is a boutique chocolate studio run by Belgian-trained chocolatiers. Located on Franschhoek's main road, it offers handcrafted pralines, truffles, and chocolate bars made using traditional European techniques.",

        highlights: [
          {
            text: "Guided chocolate tasting with curated selections",
          },
          {
            text: "Insight into Belgian chocolate-making traditions",
          },
          {
            text: "Opportunity to purchase artisanal chocolates",
          },
          {
            text: "Optional demonstrations depending on the day's schedule",
          },
        ],

        image: "",
      },

      {
        stop: 5,
        title: "Babylonstoren Farm & Gardens",
        subtitle: "Gardens, Wine & Farm Experience",
        location: "Simondium",
        time: "14:45 – 16:00",
        duration: "1 hour 15 minutes",
        type: "wine",
        optional: false,

        description:
          "Babylonstoren is a historic Cape Dutch farm transformed into a world-class lifestyle estate. Its expansive gardens are inspired by the Company's Garden of the 1600s, featuring fruit orchards, vegetable patches, water canals, and medicinal plants. The estate includes a greenhouse restaurant, wine cellar, bakery, spa, and farm shop.",

        highlights: [
          {
            text: "Self-guided walk through the iconic gardens",
          },
          {
            text: "Visits to the greenhouse, farm shop, and bakery",
          },
          {
            text: "Optional wine tasting at the Babylonstoren cellar",
          },
          {
            text: "Beautiful landscapes for photography and relaxation",
          },
        ],

        image: "",
      },

      {
        stop: 6,
        title: "Return to Cape Town",
        subtitle: "Scenic Return",
        location: "Cape Town",
        time: "16:00 – 17:00",
        duration: "1 hour",
        type: "transfer",
        optional: false,

        description: "Return transport from Babylonstoren to Cape Town.",

        highlights: [],

        image: "",
      },
    ],

    needToKnow: [
      {
        text: "Lunch is not included in the tour price.",
      },
      {
        text: "Babylonstoren wine tasting is optional and charged separately by the estate unless requested to be added to the tour pricing.",
      },
      {
        text: "The tour starts and ends in Cape Town.",
      },
      {
        text: "Perfect for families, couples, and small groups.",
      },
    ],

    faqs: [],

    tags: [
      "Full Day",
      "Cool Runnings",
      "Toboggan",
      "Winelands",
      "Franschhoek",
      "Babylonstoren",
      "Alpaca",
      "Chocolate Tasting",
      "Adventure",
      "Family Friendly",
      "Cape Town",
    ],
  },
  // Family-Wine-Tour
  {
    id: 22,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.DAY_TOUR,

    title: "Family Wine Tour with Kids Activities",
    slug: "full-day-family-wine-tour-stellenbosch",
    canonicalPath: "/tours/full-day-family-wine-tour-stellenbosch",
    childFriendly: true,

    seo: {
      title: "Family Wine Tour in Stellenbosch with Kids Activities",
      description:
        "Enjoy a family-friendly Stellenbosch wine tour from Cape Town with wine tasting, kids activities, wildlife encounters, a Stellenbosch town walk, scenic mountain views and seasonal strawberry picking.",
      keywords: [
        "family wine tour Stellenbosch",
        "Stellenbosch family tour",
        "Cape Town family wine tour",
        "wine tour with kids",
        "Stellenbosch wine tour",
        "family-friendly Cape Winelands tour",
        "kids activities Stellenbosch",
      ],
    },

    workflow: defaultWorkflow,

    image: "/src/assets/images/tours/packages/family-wine/1.webp",
    images: ["/src/assets/images/tours/packages/family-wine/1.webp"],
    imageFolder: "packages/family-wine",
    videos: [],

    location: "Stellenbosch, Cape Winelands, South Africa",
    duration: "Full day (08:00–17:30)",

    priceBase: 1950,
    minPeople: 2,

    pricing: [
      {
        category: "Adults (18+)",
        pricePerPerson: 1950,
        note: "Includes wine tasting, private transport and bottled water.",
      },
      {
        category: "Teens (14–17)",
        pricePerPerson: 1550,
        note: "All activities except wine tasting.",
      },
      {
        category: "Children (4–13)",
        pricePerPerson: 1050,
        note: "Includes animal park access, attractions and transport.",
      },
      {
        category: "Infants (0–3)",
        pricePerPerson: 0,
        note: "Free. No charges apply.",
      },
    ],

    additionalPricing: [],

    groupPricing: {
      enabled: true,
      icon: "",
      tiers: [
        {
          minPeople: 2,
          maxPeople: 4,
          perPerson: null,
          label: "2–4 guests",
          discountPercent: 10,
          note: "10% off the overall total.",
        },
        {
          minPeople: 5,
          maxPeople: 7,
          perPerson: null,
          discountPercent: 15,
          label: "5–7 guests",
          note: "15% off the overall total.",
        },
        {
          minPeople: 8,
          maxPeople: null,
          perPerson: null,
          discountPercent: null,
          label: "8+ guests",
          note: "Custom quote based on group size and requirements.",
        },
      ],
    },

    description:
      "This full-day family-friendly experience combines the beauty of the Stellenbosch Winelands with activities designed to keep children entertained. Adults can enjoy a premium wine tasting at Vredenheim while children explore the Big Cats Park, farm animals, jungle gym and gardens. The day continues with a choice of Butterfly World or Giraffe House, a relaxed lunch in Stellenbosch, a historic town walk, scenic views along Helshoogte Pass and seasonal strawberry picking at Mooiberge. With comfortable private transport, bottled water and structured timing, this tour offers a relaxed and memorable Cape Winelands experience for the whole family.",

    highlights: [
      {
        text: "Premium wine tasting at Vredenheim Wine Farm",
      },
      {
        text: "Big Cats Park, farm animals and jungle gym for children",
      },
      {
        text: "Choice of Butterfly World or Giraffe House",
      },
      {
        text: "Relaxed lunch stop in Stellenbosch",
      },
      {
        text: "Historic Stellenbosch town walk",
      },
      {
        text: "Scenic drive through Helshoogte Pass",
      },
      {
        text: "Seasonal strawberry picking at Mooiberge",
      },
      {
        text: "Private transport with driver-guide and bottled water",
      },
    ],

    included: [
      {
        text: "Private vehicle and driver-guide",
      },
      {
        text: "Bottled water",
      },
      {
        text: "Wine tasting at Vredenheim",
      },
      {
        text: "Transport between scheduled attractions",
      },
      {
        text: "Scenic stops",
      },
    ],

    excluded: [
      {
        text: "Lunch",
      },
      {
        text: "Entry fees for Butterfly World or Giraffe House",
      },
      {
        text: "Optional second wine tasting at Tokara",
      },
      {
        text: "Gratuities",
      },
      {
        text: "Personal purchases",
      },
    ],

    pickupOptions: [
      {
        type: "hotel",
        label: "Cape Town hotel pickup",
        description: "Pickup from your Cape Town hotel at approximately 08:00.",
      },
    ],

    requirements: [
      "Children must be accompanied by a parent or responsible adult.",
      "Wine tasting is available to adults aged 18 and over.",
      "Please provide accurate passenger ages when booking.",
    ],

    arrangements: {
      availability:
        "Available year-round, subject to attraction and venue availability.",
      duration: "Approximately 9.5 hours",
      operatingTime: "08:00–17:30",
      departure: "08:00 from Cape Town",
      return: "Approximately 17:30 in Cape Town",
      location:
        "Cape Town pickup with a full-day route through Stellenbosch and the surrounding Winelands.",

      clothing: [
        "Comfortable clothing suitable for walking and outdoor activities",
        "Comfortable walking shoes",
        "A light jacket for cooler weather",
      ],

      thingsToBring: ["Sun protection", "Hat", "Sunscreen", "Camera"],

      passengerPolicy:
        "Children and infants are welcome. Children must be accompanied by a parent or responsible adult.",

      notes: [
        "Lunch is not included.",
        "Butterfly World or Giraffe House is selected based on family preference and availability.",
        "Mooiberge strawberry picking is seasonal, generally from September to December.",
        "If strawberry picking is unavailable, this time becomes additional Stellenbosch exploration or a second wine estate.",
        "An optional second wine tasting at Tokara may be available for adults.",
      ],
    },

    weatherPolicy: {
      summary:
        "The tour operates in most weather conditions, although outdoor activities may be adjusted when conditions are unsuitable.",
      items: [
        {
          text: "Outdoor activities may be modified or replaced due to severe weather.",
        },
        {
          text: "Seasonal activities such as strawberry picking depend on weather and availability.",
        },
        {
          text: "The driver-guide will advise on suitable alternatives when necessary.",
        },
      ],
    },

    safetyPolicy: {
      summary:
        "This is a family-friendly experience with structured timing and activities suitable for children.",
      items: [
        {
          text: "Children must remain under the supervision of their parent or responsible adult.",
        },
        {
          text: "Follow all safety instructions provided at wildlife and attraction venues.",
        },
        {
          text: "The itinerary may be adjusted to maintain a comfortable and safe experience.",
        },
      ],
    },

    /*
     * FULL-DAY TOUR
     * Uses stops rather than the multi-day itinerary structure.
     */
    itinerary: null,

    stops: [
      {
        name: "Pickup from Cape Town",
        description:
          "Your driver-guide collects you from your Cape Town hotel. Bottled water is provided for the journey.",
        time: "08:00",
        duration: "",
        type: "transport",
        optional: false,
        image: "",
      },

      {
        name: "Vredenheim Wine Farm",
        description:
          "Adults enjoy a premium wine tasting while children explore the Big Cats Park, farm animals, jungle gym and large gardens.",
        time: "09:00",
        duration: "±2 hours",
        type: "wine",
        optional: false,
        image: "",
      },

      {
        name: "Butterfly World OR Giraffe House",
        description:
          "Choose one family attraction. Butterfly World features a tropical butterfly house, reptiles and birds, while Giraffe House offers wildlife education and encounters with giraffes, zebras and reptiles.",
        time: "11:15",
        duration: "±1 hour",
        type: "wildlife",
        optional: false,
        image: "",
      },

      {
        name: "Lunch in Stellenbosch",
        description:
          "Enjoy a relaxed lunch at a family-friendly restaurant in Stellenbosch. Suggested options include Schoon Bakery, Hudsons, De Warenmarkt or Spur.",
        time: "12:30",
        duration: "±1 hour",
        type: "meal",
        optional: true,
        image: "",
      },

      {
        name: "Stellenbosch Town Walk",
        description:
          "Explore historic Stellenbosch with stops along Dorp Street, Oom Samie se Winkel, artisan chocolate shops and scenic photo locations.",
        time: "13:45",
        duration: "±45 minutes",
        type: "culture",
        optional: false,
        image: "",
      },

      {
        name: "Helshoogte Pass Scenic Drive",
        description:
          "Enjoy spectacular mountain scenery along Helshoogte Pass with safe viewpoints for photographs. Adults can optionally enjoy a second wine tasting at Tokara.",
        time: "14:45",
        duration: "±30 minutes",
        type: "scenic",
        optional: false,
        image: "",
      },

      {
        name: "Mooiberge Strawberry Farm",
        description:
          "During strawberry season, enjoy strawberry picking, the play area and colourful scarecrows. If strawberries are out of season, this time becomes additional Stellenbosch exploration or a second wine estate.",
        time: "15:30",
        duration: "±45 minutes",
        type: "family",
        optional: true,
        image: "",
      },

      {
        name: "Return to Cape Town",
        description:
          "Depart the Stellenbosch area and return to Cape Town for hotel drop-off.",
        time: "16:30",
        duration: "±1 hour",
        type: "transport",
        optional: false,
        image: "",
      },
    ],

    securityAndLiability: null,

    accommodation: {
      included: false,
      type: "",
      description:
        "No accommodation is included. This is a full-day tour from Cape Town.",
    },

    needToKnow: [
      {
        text: "This is a full-day tour and takes approximately 9.5 hours.",
      },
      {
        text: "Wine tasting is available only to guests aged 18 and over.",
      },
      {
        text: "Lunch is not included.",
      },
      {
        text: "Entry fees for Butterfly World or Giraffe House are not included.",
      },
      {
        text: "Butterfly World and Giraffe House are alternative attractions; the family chooses one.",
      },
      {
        text: "Mooiberge strawberry picking is seasonal, generally from September to December.",
      },
      {
        text: "The optional Tokara wine tasting is for adults and subject to availability.",
      },
      {
        text: "If strawberry picking is unavailable, the itinerary will be adjusted accordingly.",
      },
    ],

    faqs: [
      {
        question: "Is this tour suitable for children?",
        answer:
          "Yes. The tour is specifically designed for families and includes animal encounters, children's play areas, wildlife attractions and family-friendly sightseeing.",
      },
      {
        question: "Can children participate in the wine tasting?",
        answer:
          "No. Wine tasting is for guests aged 18 and over. Children can enjoy the family activities at Vredenheim instead.",
      },
      {
        question: "Is lunch included?",
        answer:
          "No. Lunch is not included. There is a dedicated lunch stop in Stellenbosch where guests can choose from family-friendly restaurants.",
      },
      {
        question: "Can we choose between Butterfly World and Giraffe House?",
        answer:
          "Yes. The family can choose either Butterfly World or Giraffe House, subject to availability.",
      },
      {
        question: "Is strawberry picking available all year?",
        answer:
          "No. Strawberry picking at Mooiberge is seasonal, generally from September to December. Outside the season, the tour includes additional Stellenbosch exploration or another wine estate.",
      },
      {
        question: "Is the second wine tasting at Tokara included?",
        answer:
          "No. The optional second wine tasting is not included and is available to adults subject to availability.",
      },
      {
        question: "Do you provide hotel pickup?",
        answer:
          "Yes. Private pickup from your Cape Town hotel is included, with pickup scheduled for approximately 08:00.",
      },
      {
        question: "What time will we return to Cape Town?",
        answer:
          "The tour leaves the Stellenbosch area at approximately 16:30, with hotel drop-off around 17:30.",
      },
    ],

    tags: [
      "family",
      "wine",
      "stellenbosch",
      "cape-winelands",
      "kids",
      "wildlife",
      "private-tour",
      "cape-town",
      "day-tour",
    ],
  },
  // Stellenbosch Wine-Estate
  {
    id: 15,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.FULL_DAY,

    title: "Premium Stellenbosch Wine, Cheese & Chocolate Pairing Tour",
    slug: "premium-stellenbosch-wine-cheese-chocolate-pairing-tour",
    canonicalPath:
      "/tours/premium-stellenbosch-wine-cheese-chocolate-pairing-tour",
    childFriendly: true,

    seo: {
      title:
        "Premium Stellenbosch Wine, Cheese & Chocolate Pairing Tour | Cape Frontier Tours",
      description:
        "Enjoy a private full-day Stellenbosch wine experience visiting Spier, Delaire Graff and Rust en Vrede, with wine tastings, cheese pairings, lunch, scenic views and a professional private driver-guide.",
      keywords: [
        "Stellenbosch wine tour",
        "Stellenbosch wine cheese chocolate tour",
        "Cape Town wine tour",
        "Spier Wine Farm tour",
        "Delaire Graff wine tour",
        "Rust en Vrede wine tour",
        "private Stellenbosch wine tour",
        "Cape Winelands wine tour",
      ],
    },

    workflow: defaultWorkflow,

    image: getCoverImage(`${STELLENBOSCH_WINE_BASE}/delaire`),
    images: packageGallery(
      STELLENBOSCH_WINE_BASE,
      ["spier", "delaire", "rust-en-vrede"],
      3,
    ),
    destinationGalleries: packageDestinationGalleries(
      STELLENBOSCH_WINE_BASE,
      ["spier", "delaire", "rust-en-vrede"],
      3,
    ),
    imageFolder: "packages/wine-farms",

    location: "Stellenbosch, South Africa",
    duration: "Full Day",

    priceBase: 2250,
    minPeople: 4,

    pricing: [
      {
        category: "Adults",
        pricePerPerson: 2250,
        note: "Private driver/guide • Minimum 4 guests",
      },
      {
        category: "Teens (12–17 years)",
        pricePerPerson: 950,
        note: "Kids grape juice tasting at Spier • Lunch at Rust en Vrede • No wine tasting",
      },
      {
        category: "Children (5–11 years)",
        pricePerPerson: 950,
        note: "Kids grape juice tasting at Spier • Lunch at Rust en Vrede • No wine tasting",
      },
      {
        category: "Toddlers",
        pricePerPerson: null,
        note: "Toddlers are not suitable for this tour.",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 5,
          maxPeople: null,
          perPerson: 2000,
          label: "5+ Guests",
          note: "Reduced adult rate for groups of 5 or more",
        },
      ],
    },

    description:
      "A premium private Stellenbosch wine experience visiting three exceptional estates: Spier Wine Farm, Delaire Graff Estate and Rust en Vrede. Enjoy wine tastings and cheese pairings at Spier and Delaire Graff, followed by a wine tasting and lunch at historic Rust en Vrede. The experience combines scenic Cape Winelands landscapes, historic estates, premium wine, food pairings and a professional private driver-guide.",

    highlights: [
      { text: "Private driver and professional guide" },
      { text: "Three premium Stellenbosch wine estates" },
      { text: "Wine and cheese pairings included" },
      { text: "Lunch included at Rust en Vrede" },
      { text: "Scenic mountain and vineyard views" },
      { text: "Cape Dutch architecture and historic estates" },
      { text: "Kids grape juice tasting at Spier" },
    ],

    included: [
      { text: "Private vehicle for the full tour" },
      { text: "Professional driver/guide" },
      { text: "Wine tasting at Spier Wine Farm" },
      { text: "Cheese pairing at Spier" },
      { text: "Kids grape juice tasting at Spier" },
      { text: "Wine tasting at Delaire Graff" },
      { text: "Cheese pairing at Delaire Graff" },
      { text: "Wine tasting at Rust en Vrede" },
      { text: "Lunch at Rust en Vrede" },
      { text: "Bottled water" },
      { text: "Pick-up and drop-off in Cape Town CBD" },
      { text: "Photo stops at all three estates" },
      { text: "Guided explanations of each estate" },
    ],

    excluded: [
      { text: "Dessert at Rust en Vrede" },
      { text: "Additional beverages at any estate" },
      { text: "Premium wine upgrades, including Icon and Reserve wines" },
      { text: "Charcuterie platters at Delaire Graff" },
      { text: "Eagle Encounters at Spier" },
      { text: "Kids activities beyond the included grape juice tasting" },
      { text: "Wine tasting for children" },
      { text: "Gratuities" },
      { text: "Personal purchases, including wine bottles and gifts" },
      { text: "Any extras not specifically listed under inclusions" },
    ],

    pickupOptions: DEFAULT_PICKUP_OPTIONS,

    stops: [
      {
        id: "spier",
        name: "Spier Wine Farm",
        time: "09:30",
        duration: "1.5 hours",
        note: "Wine tasting and cheese pairing",
        description:
          "One of South Africa's oldest wine farms, established in 1692. Spier combines Cape Dutch heritage, scenic lawns, riverside areas and a relaxed, family-friendly atmosphere. Guests enjoy a wine tasting and cheese pairing, while children can enjoy a grape juice tasting.",
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
            text: "Spier was relaxed and beautiful, and the cheese pairing was a lovely way to start the day.",
          },
        ],
      },

      {
        id: "delaire-graff",
        name: "Delaire Graff",
        time: "11:30",
        duration: "1.5 hours",
        note: "Premium wine tasting and cheese pairing",
        description:
          "Perched on the Helshoogte Pass overlooking the Simonsberg and Banghoek Valley, Delaire Graff combines luxury architecture, art, gardens and dramatic mountain views. Guests enjoy a premium wine tasting with a beautifully presented cheese pairing.",
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
            text: "The views were incredible and the estate felt incredibly elegant without being rushed.",
          },
        ],
      },

      {
        id: "rust-en-vrede",
        name: "Rust en Vrede",
        time: "13:30",
        duration: "2 hours",
        note: "Wine tasting and lunch",
        description:
          "A historic Stellenbosch estate dating back to 1694, Rust en Vrede is renowned for its premium red wines and historic Cape Dutch buildings. Guests enjoy a wine tasting followed by lunch in an elegant and peaceful estate setting.",
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
            text: "The historic setting was beautiful, and finishing the tour with lunch made the whole experience feel very special.",
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
      {
        text: "The tour has a minimum requirement of 4 guests.",
      },
      {
        text: "Adult pricing is R2,250 per person for groups of 4.",
      },
      {
        text: "Adult groups of 5 or more receive the R2,000 per person group rate.",
      },
      {
        text: "Children aged 5–17 years are charged R950 per child.",
      },
      {
        text: "Children do not participate in wine tastings.",
      },
      {
        text: "Children can enjoy the grape juice tasting at Spier.",
      },
      {
        text: "Estate availability may affect exact booking times.",
      },
      {
        text: "The tour follows a relaxed premium itinerary with three estate visits.",
      },
    ],

    cancellationPolicy: {
      summary:
        "Estate availability and advance bookings can affect the final itinerary.",
      items: [
        {
          text: "Wine farm stops may change depending on estate availability.",
        },
        {
          text: "Tasting and lunch reservations may require advance confirmation.",
        },
        {
          text: "Final cancellation rules must be confirmed at the time of booking.",
        },
      ],
    },

    faqs: [
      {
        question: "How many wine estates are included?",
        answer:
          "The tour visits three estates: Spier Wine Farm, Delaire Graff Estate and Rust en Vrede.",
      },
      {
        question: "What is included in the wine and food pairings?",
        answer:
          "Spier includes a wine tasting and cheese pairing. Delaire Graff includes a wine tasting and cheese pairing. Rust en Vrede includes a wine tasting and lunch.",
      },
      {
        question: "Can children join the tour?",
        answer:
          "Yes. Children aged 5–17 years are welcome and are charged R950 per child. Children receive a grape juice tasting at Spier and lunch at Rust en Vrede but do not participate in wine tastings.",
      },
      {
        question: "What is the minimum number of guests?",
        answer: "The private tour requires a minimum of 4 guests.",
      },
      {
        question: "Is there a group discount?",
        answer:
          "Yes. Groups of 5 or more receive a reduced adult rate of R2,000 per person.",
      },
      {
        question: "Is transport included?",
        answer:
          "Yes. The experience includes a private vehicle, professional driver/guide, bottled water and Cape Town CBD pick-up and drop-off.",
      },
      {
        question: "Are premium wine upgrades included?",
        answer:
          "No. Premium Icon and Reserve wine upgrades are excluded and can be purchased separately where available.",
      },
      {
        question: "Is the Delaire Graff charcuterie platter included?",
        answer:
          "No. Charcuterie platters at Delaire Graff are optional and are not included in the tour price.",
      },
    ],

    tags: [
      "Wine",
      "Stellenbosch",
      "Full Day",
      "Cape Winelands",
      "Cheese Pairing",
      "Private Tour",
      "Family Friendly",
    ],
  },
  // Stellenbosch & Franschhoek Winelands + Tram
  {
    id: 23,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.DAY_TOUR,

    title: "Stellenbosch & Franschhoek Winelands Tour",
    slug: "full-day-stellenbosch-franschhoek-winelands-tour",
    canonicalPath: "/tours/full-day-stellenbosch-franschhoek-winelands-tour",
    childFriendly: true,

    seo: {
      title: "Full-Day Stellenbosch & Franschhoek Winelands Tour",
      description:
        "Enjoy a private full-day Stellenbosch and Franschhoek Winelands tour with three premium wine tastings, cheese or chocolate pairings, the Franschhoek Wine Tram and private transport from Cape Town.",
      keywords: [
        "Stellenbosch Franschhoek wine tour",
        "Cape Town Winelands tour",
        "Franschhoek Wine Tram tour",
        "Stellenbosch wine tour",
        "Franschhoek wine tour",
        "private Winelands tour",
        "Cape Town wine tour",
        "full-day Winelands tour",
        "Franschhoek Wine Tram",
        "family friendly Winelands tour",
      ],
    },

    workflow: defaultWorkflow,

    image: "/src/assets/images/tours/packages/winelands+tram/1.webp",
    images: ["/src/assets/images/tours/packages/winelands+tram/1.webp"],
    imageFolder: "packages/winelands+tram",
    videos: [],

    location: "Stellenbosch & Franschhoek, Western Cape, South Africa",
    duration: "8.5–9 hours",

    priceBase: 3200,
    minPeople: 2,

    pricing: [
      {
        category: "2 Guests",
        pricePerPerson: 3200,
        note: "Includes standard wine tastings with cheese OR chocolate pairing, Franschhoek Wine Tram ticket and private vehicle.",
      },

      {
        category: "Teens (13–17 years)",
        pricePerPerson: 2600,
        note: "Franschhoek Wine Tram ticket and private vehicle.",
      },

      {
        category: "Children (4–12 years)",
        pricePerPerson: 2600,
        note: "Franschhoek Wine Tram ticket and private vehicle.",
      },

      {
        category: "Toddlers (0–3 years)",
        pricePerPerson: null,
        note: "Franschhoek Wine Tram ticket and private vehicle.",
      },
    ],

    additionalPricing: [
      {
        type: "request",
        category: "Optional ice-cream stop in Franschhoek",
        pricePerPerson: null,
        note: "Optional stop available on request. Additional cost may apply.",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "",
      tiers: [
        {
          minPeople: 2,
          maxPeople: 2,
          perPerson: 3200,
          discountPercent: null,
          label: "2-3 Guests",
          note: "Includes standard wine tastings with cheese OR chocolate pairing, Franschhoek Wine Tram ticket and private vehicle.",
        },
        {
          minPeople: 3,
          maxPeople: 3,
          perPerson: 2650,
          label: "3 Guests",
          discountPercent: null,
          note: "Includes standard wine tastings with cheese OR chocolate pairing, Franschhoek Wine Tram ticket and private vehicle.",
        },
        {
          minPeople: 4,
          maxPeople: 4,
          perPerson: 2450,
          label: "5–7 Guests",
          discountPercent: null,
          note: "Includes standard wine tastings with cheese OR chocolate pairing, Franschhoek Wine Tram ticket and private vehicle.",
        },
        {
          minPeople: 5,
          maxPeople: 7,
          perPerson: 2150,
          label: "5–7 Guests",
          discountPercent: null,
          note: "Includes standard wine tastings with cheese OR chocolate pairing, Franschhoek Wine Tram ticket and private vehicle.",
        },
      ],
    },

    description:
      "A luxurious full-day journey through the Stellenbosch and Franschhoek Winelands, featuring three premium wine estates, breathtaking scenery, included cheese OR chocolate pairings, and the iconic Franschhoek Wine Tram. Perfect for couples, families and wine lovers seeking a relaxed, scenic and unforgettable Cape Winelands experience. The tour is family-friendly, with spacious wine-estate lawns, mountain scenery, outdoor areas and an open-air Wine Tram experience that children can enjoy.",

    highlights: [
      {
        text: "Three standard wine tastings included",
      },
      {
        text: "Cheese OR chocolate pairing included",
      },
      {
        text: "Visit Zevenwacht Wine Estate in Stellenbosch",
      },
      {
        text: "Visit Marianne Wine Estate",
      },
      {
        text: "Visit Rickety Bridge Wine Estate in Franschhoek",
      },
      {
        text: "Franschhoek Wine Tram ticket included",
      },
      {
        text: "Scenic Stellenbosch and Franschhoek landscapes",
      },
      {
        text: "Private vehicle and professional driver-guide",
      },
      {
        text: "Cultural commentary while passing Langa",
      },
      {
        text: "Family-friendly option available",
      },
      {
        text: "Bottled water and all transport costs included",
      },
    ],

    included: [
      {
        text: "Zevenwacht standard wine tasting + cheese OR chocolate pairing",
      },
      {
        text: "Marianne standard wine tasting + cheese OR chocolate pairing",
      },
      {
        text: "Rickety Bridge standard wine tasting + cheese OR chocolate pairing",
      },
      {
        text: "Franschhoek Wine Tram ticket",
      },
      {
        text: "Private vehicle",
      },
      {
        text: "Professional driver-guide",
      },
      {
        text: "Bottled water",
      },
      {
        text: "All scheduled transport costs",
      },
    ],

    excluded: [
      {
        text: "Lunch in Franschhoek",
      },
      {
        text: "Optional biltong pairing",
      },
      {
        text: "Additional wine purchases",
      },
      {
        text: "Any extra tastings",
      },
      {
        text: "Optional ice-cream stop in Franschhoek",
      },
    ],

    pickupOptions: [
      {
        type: "hotel",
        label: "Cape Town accommodation pickup",
        description:
          "Private pickup from your Cape Town accommodation between approximately 08:30 and 09:00.",
      },
    ],

    requirements: [
      "Guests participating in wine tastings must be of legal drinking age.",
      "Please provide accurate passenger information when booking.",
      "Guests should bring suitable identification where required by wine estates.",
      "Parents and guardians remain responsible for children throughout the experience.",
    ],

    arrangements: {
      availability:
        "Available year-round, subject to wine estate and Franschhoek Wine Tram availability.",
      duration: "8.5–9 hours",
      operatingTime: "Approximately 08:30–18:00",
      departure: "08:30–09:00 from Cape Town accommodation",
      return: "Approximately 18:00 to Cape Town",
      location: "Cape Town → Stellenbosch → Franschhoek → Cape Town",

      clothing: [
        "Comfortable clothing",
        "Comfortable walking shoes",
        "Light jacket for cooler weather",
      ],

      thingsToBring: [
        "Identification",
        "Sun protection",
        "Hat",
        "Sunscreen",
        "Camera",
      ],

      passengerPolicy:
        "Wine tasting is subject to the legal drinking age and venue requirements. Children may participate in the family-friendly aspects of the tour but may not participate in wine tastings.",

      notes: [
        "Lunch is not included and is at the guest's own cost.",
        "Cheese OR chocolate pairing is included as specified in the tour package.",
        "Optional biltong pairing is not included.",
        "Additional wine purchases and extra tastings are not included.",
        "The Franschhoek Wine Tram ticket is included.",
        "An optional ice-cream stop in Franschhoek can be added on request.",
        "Wine estate visits and tasting availability are subject to venue operating conditions.",
        "The itinerary may be adjusted slightly to accommodate venue or tram operating schedules.",
      ],
    },

    weatherPolicy: {
      summary:
        "The tour operates in most weather conditions, although specific outdoor activities may be adjusted when necessary.",
      items: [
        {
          text: "Wine estate visits generally continue in light or moderate weather conditions.",
        },
        {
          text: "Outdoor and scenic activities may be adjusted due to severe weather.",
        },
        {
          text: "Wine Tram operations are subject to the operator's weather and safety conditions.",
        },
      ],
    },

    safetyPolicy: {
      summary:
        "Guests are expected to follow the safety and venue guidelines provided by the driver-guide and each wine estate.",
      items: [
        {
          text: "Guests must follow all instructions provided by wine estates and the Wine Tram operator.",
        },
        {
          text: "Responsible alcohol consumption is expected throughout the experience.",
        },
        {
          text: "Guests should remain with the group during scheduled transfers and activities.",
        },
        {
          text: "Parents and guardians are responsible for supervising children throughout the tour.",
        },
      ],
    },

    /*
     * FULL-DAY TOUR
     * Uses stops rather than the multi-day itinerary structure.
     */
    itinerary: null,

    stops: [
      {
        name: "Pick-Up in Cape Town",
        description:
          "Private vehicle collection from your Cape Town accommodation. Bottled water is provided for the journey.",
        time: "08:30–09:00",
        duration: "",
        type: "transport",
        optional: false,
        image: "",
      },

      {
        name: "Drive Past Langa",
        description:
          "Travel along the N2 while your driver-guide provides commentary on Langa, Cape Town's oldest township, including its history and cultural significance. There is no stop or entry.",
        time: "09:00",
        duration: "±15 minutes",
        type: "culture",
        optional: false,
        image: "",
      },

      {
        name: "Zevenwacht Wine Estate",
        description:
          "Begin the Winelands experience with a standard wine tasting and included cheese OR chocolate pairing at Zevenwacht. Enjoy beautiful dam and vineyard views.",
        time: "09:40",
        duration: "±1 hour",
        type: "wine",
        optional: false,
        image: "",
      },

      {
        name: "Marianne Wine Estate",
        description:
          "Visit this boutique French-style wine estate for a standard wine tasting with an included cheese OR chocolate pairing.",
        time: "10:55",
        duration: "±50 minutes",
        type: "wine",
        optional: false,
        image: "",
      },

      {
        name: "Rickety Bridge Wine Estate",
        description:
          "Enjoy a standard wine tasting with an included cheese OR chocolate pairing at this historic Franschhoek estate, surrounded by a spectacular mountain backdrop.",
        time: "12:05",
        duration: "±55 minutes",
        type: "wine",
        optional: false,
        image: "",
      },

      {
        name: "Lunch in Franschhoek",
        description:
          "Enjoy lunch at a restaurant of your choice in Franschhoek. Guests select and pay for their own lunch.",
        time: "13:05",
        duration: "±1 hour",
        type: "meal",
        optional: true,
        image: "",
      },

      {
        name: "Franschhoek Wine Tram",
        description:
          "Enjoy a scenic open-air hop-on hop-off tram experience through Franschhoek's vineyards and mountains. The Wine Tram ticket is included.",
        time: "14:20",
        duration: "±2 hours",
        type: "wine-tram",
        optional: false,
        image: "",
      },

      {
        name: "Return to Cape Town",
        description:
          "Begin the comfortable journey back to Cape Town through the surrounding mountain passes and farmlands.",
        time: "16:30",
        duration: "±1.5 hours",
        type: "transport",
        optional: false,
        image: "",
      },
    ],
    securityAndLiability: null,

    accommodation: {
      included: false,
      type: "",
      description:
        "No accommodation is included. This is a private full-day tour from Cape Town.",
    },

    needToKnow: [
      {
        text: "This is a private full-day experience lasting approximately 8.5–9 hours.",
      },
      {
        text: "Three standard wine tastings are included in the tour price.",
      },
      {
        text: "Cheese OR chocolate pairing is included at the three wine estates.",
      },
      {
        text: "Lunch in Franschhoek is not included.",
      },
      {
        text: "Optional biltong pairing is not included.",
      },
      {
        text: "Additional wine purchases and extra tastings are not included.",
      },
      {
        text: "The Franschhoek Wine Tram ticket is included.",
      },
      {
        text: "The drive past Langa is a commentary experience only; there is no stop or entry.",
      },
      {
        text: "This tour is suitable for families seeking a relaxed scenic day in the Winelands.",
      },
      {
        text: "Children can enjoy the open-air Wine Tram, spacious estate lawns, mountain scenery and outdoor environment.",
      },
      {
        text: "An optional ice-cream stop in Franschhoek can be added on request.",
      },
      {
        text: "Wine tasting is subject to legal drinking age requirements.",
      },
      {
        text: "Wine estate and Wine Tram schedules are subject to availability.",
      },
    ],

    faqs: [
      {
        question: "How many wine tastings are included?",
        answer:
          "Three standard wine tastings are included: one at Zevenwacht, one at Marianne Wine Estate and one at Rickety Bridge.",
      },

      {
        question: "Are wine pairings included?",
        answer:
          "Yes. A cheese OR chocolate pairing is included with the wine tasting experience at each of the three estates.",
      },

      {
        question: "Is the Franschhoek Wine Tram included?",
        answer:
          "Yes. The Franschhoek Wine Tram ticket is included in the tour price.",
      },

      {
        question: "Is lunch included?",
        answer:
          "No. Lunch is at the guest's own cost, and you can choose your preferred restaurant in Franschhoek.",
      },

      {
        question: "Is this a private tour?",
        answer:
          "Yes. The experience includes a private vehicle and professional driver-guide.",
      },

      {
        question: "Is this tour suitable for children?",
        answer:
          "Yes. A family-friendly option is available. Children can enjoy the open-air Wine Tram, spacious wine-estate lawns, mountain scenery and relaxed outdoor environment. Children may not participate in wine tastings.",
      },

      {
        question: "Is there anything for children to enjoy?",
        answer:
          "Yes. Children can enjoy the open-air Wine Tram ride, outdoor estate spaces and mountain scenery. An optional ice-cream stop in Franschhoek can also be added on request.",
      },

      {
        question: "Do we stop at Langa?",
        answer:
          "No. Langa is a place of interest during the drive, and your guide provides cultural and historical commentary without a stop or entry.",
      },

      {
        question: "What time does the tour return to Cape Town?",
        answer:
          "The tour is expected to return to Cape Town at approximately 18:00.",
      },

      {
        question: "Who is this tour suitable for?",
        answer:
          "The experience is ideal for couples, families and wine lovers looking for a relaxed private day through the Stellenbosch and Franschhoek Winelands.",
      },
    ],

    tags: [
      "wine",
      "stellenbosch",
      "franschhoek",
      "winelands",
      "wine-tram",
      "cape-town",
      "private-tour",
      "day-tour",
      "wine-tasting",
      "family-friendly",
    ],
  },
  // Cape Town Gems - Kirstenbosch & Constantia
  {
    id: 24,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.DAY_TOUR,

    title: "Cape Town Gems – Kirstenbosch & Constantia Winelands Experience",
    slug: "full-day-cape-town-gems-kirstenbosch-constantia-winelands",
    canonicalPath:
      "/tours/full-day-cape-town-gems-kirstenbosch-constantia-winelands",
    childFriendly: true,

    seo: {
      title:
        "Cape Town Gems: Kirstenbosch & Constantia Winelands Full-Day Tour",
      description:
        "Explore AfroGem, Kirstenbosch and the historic Constantia Winelands on a private Cape Town tour featuring Groot Constantia, Klein Constantia and Constantia Glen with two wine tastings included for adults and teens.",
      keywords: [
        "Cape Town gems tour",
        "Kirstenbosch tour",
        "Constantia wine tour",
        "Constantia Winelands tour",
        "Groot Constantia tour",
        "Klein Constantia tour",
        "Constantia Glen wine tasting",
        "Cape Town private tour",
        "Cape Town wine tour",
        "Kirstenbosch and Constantia",
      ],
    },

    workflow: defaultWorkflow,

    image: "/src/assets/images/tours/packages/cape-town-gems/3.webp",
    images: ["/src/assets/images/tours/packages/cape-town-gems/3.webp"],
    imageFolder: "packages/cape-town-gems",
    videos: [],

    location: "Cape Town CBD, Kirstenbosch & Constantia, South Africa",
    duration: "7–8 hours",

    priceBase: 1950,
    minPeople: 2,

    pricing: [
      {
        category: "Adults (18+)",
        pricePerPerson: 1950,
        note: "Includes all listed entry fees and 2 standard wine tastings.",
      },
      {
        category: "Teens (13–17)",
        pricePerPerson: 1550,
        note: "Includes all listed entry fees and 2 standard wine tastings.",
      },
      {
        category: "Children (6–12)",
        pricePerPerson: 850,
        note: "Includes Kirstenbosch entry only.",
      },
      {
        category: "Infants (0–5)",
        pricePerPerson: 0,
        note: "Free. No entry fees.",
      },
    ],

    additionalPricing: [
      {
        type: "external",
        category: "Klein Constantia wine tasting",
        pricePerPerson: null,
        note: "Optional tasting available at an additional cost.",
      },
    ],

    groupPricing: {
      enabled: false,
      icon: "",
      tiers: [],
    },

    description:
      "This curated Cape Town experience blends African craftsmanship, botanical beauty and the historic Constantia wine valley, the birthplace of South African winemaking. The journey begins in the CBD at AfroGem, where guests explore African gemstones and jewellery artistry. From there, travel to Kirstenbosch National Botanical Garden to discover indigenous fynbos, proteas, sculptures, the iconic Boomslang walkway and spectacular mountain scenery. The route continues into Constantia, where guests visit the historic Groot Constantia estate, learn about Klein Constantia and the legendary Vin de Constance, and finish with a standard wine tasting at boutique Constantia Glen. With private transport, bottled water and entry fees included, this is a relaxed and scenic experience combining culture, nature, wine and heritage.",

    highlights: [
      {
        text: "African gemstone and jewellery experience at AfroGem",
      },
      {
        text: "Explore Kirstenbosch National Botanical Garden",
      },
      {
        text: "Walk the iconic Boomslang canopy walkway",
      },
      {
        text: "Visit historic Groot Constantia",
      },
      {
        text: "Standard wine tasting at Groot Constantia",
      },
      {
        text: "Explore Klein Constantia and the history of Vin de Constance",
      },
      {
        text: "Standard wine tasting at Constantia Glen",
      },
      {
        text: "Scenic Table Mountain and Constantia Valley landscapes",
      },
      {
        text: "Private vehicle and professional driver-guide",
      },
    ],

    included: [
      {
        text: "Kirstenbosch National Botanical Garden entry",
      },
      {
        text: "Standard wine tasting at Groot Constantia",
      },
      {
        text: "Klein Constantia estate visit",
      },
      {
        text: "Standard wine tasting at Constantia Glen",
      },
      {
        text: "Private vehicle and professional driver-guide",
      },
      {
        text: "Bottled water",
      },
      {
        text: "All scheduled transport costs",
      },
    ],

    excluded: [
      {
        text: "Lunch",
      },
      {
        text: "Optional Klein Constantia wine tasting",
      },
      {
        text: "Optional wine purchases",
      },
      {
        text: "Gratuities",
      },
    ],

    pickupOptions: [
      {
        type: "hotel",
        label: "Cape Town CBD pickup",
        description:
          "Private collection from your Cape Town CBD hotel or residence at approximately 08:30.",
      },
    ],

    requirements: [
      "Guests participating in wine tastings must meet the applicable legal drinking age requirements.",
      "Please provide accurate passenger ages when booking.",
      "Comfortable walking shoes are recommended for Kirstenbosch.",
    ],

    arrangements: {
      availability:
        "Available year-round, subject to attraction and wine estate availability.",
      duration: "7–8 hours",
      operatingTime: "Approximately 08:30–16:00",
      departure: "08:30 from Cape Town CBD",
      return: "Approximately 16:00 to Cape Town CBD",
      location:
        "Cape Town CBD → AfroGem → Kirstenbosch → Groot Constantia → Klein Constantia → Constantia Glen → Cape Town CBD",

      clothing: [
        "Comfortable clothing",
        "Comfortable walking shoes",
        "Light jacket for changing weather",
      ],

      thingsToBring: ["Sun protection", "Hat", "Sunscreen", "Camera"],

      passengerPolicy:
        "Children are welcome. Wine tasting is subject to applicable age requirements.",

      notes: [
        "Lunch is not included.",
        "Klein Constantia wine tasting is optional and charged separately.",
        "Children aged 6–12 are priced at the child rate and include Kirstenbosch entry only.",
        "Infants aged 0–5 are free.",
        "Wine estate visits and tastings are subject to venue availability.",
      ],
    },

    weatherPolicy: {
      summary:
        "The experience operates in most weather conditions, although outdoor activities may be adjusted when necessary.",
      items: [
        {
          text: "Kirstenbosch activities are weather dependent.",
        },
        {
          text: "Outdoor walking routes may be adjusted during severe weather.",
        },
        {
          text: "Wine estate visits may continue in light or moderate weather conditions.",
        },
      ],
    },

    safetyPolicy: {
      summary:
        "Guests should follow instructions from the driver-guide and venue staff throughout the experience.",
      items: [
        {
          text: "Follow all safety instructions at Kirstenbosch and the wine estates.",
        },
        {
          text: "Children should remain under the supervision of a parent or responsible adult.",
        },
        {
          text: "Guests participating in wine tastings should consume alcohol responsibly.",
        },
      ],
    },

    /*
     * FULL-DAY TOUR
     * Uses stops rather than the multi-day itinerary structure.
     */
    itinerary: null,

    stops: [
      {
        name: "Pick-Up in Cape Town CBD",
        description:
          "Private collection from your Cape Town CBD hotel or residence. Bottled water is provided.",
        time: "08:30",
        duration: "",
        type: "transport",
        optional: false,
        image: "",
      },

      {
        name: "AfroGem Jewellery Experience",
        description:
          "Explore African diamonds, tanzanite, gemstones and local jewellery craftsmanship at AfroGem.",
        time: "09:00",
        duration: "±1 hour",
        type: "culture",
        optional: false,
        image: "",
      },

      {
        name: "Kirstenbosch National Botanical Garden",
        description:
          "Explore indigenous gardens, fynbos, proteas, sculptures and the iconic Boomslang canopy walkway beneath the eastern slopes of Table Mountain.",
        time: "10:20",
        duration: "±1 hour 40 minutes",
        type: "nature",
        optional: false,
        image: "",
      },

      {
        name: "Groot Constantia Wine Estate",
        description:
          "Visit the historic Groot Constantia estate and enjoy a standard wine tasting. Adults and teens receive the included tasting according to the supplied pricing structure.",
        time: "12:15",
        duration: "±45 minutes",
        type: "wine",
        optional: false,
        image: "",
      },

      {
        name: "Lunch in Constantia",
        description:
          "Enjoy a relaxed lunch break at your choice of restaurant. Suggested options include Jonkershuis Restaurant, Simons Restaurant or Constantia Glen Restaurant.",
        time: "13:00",
        duration: "±1 hour",
        type: "meal",
        optional: true,
        image: "",
      },

      {
        name: "Klein Constantia Wine Estate",
        description:
          "Explore the historic estate and learn about the legacy of Vin de Constance. A wine tasting is available optionally at additional cost.",
        time: "14:00",
        duration: "±30 minutes",
        type: "wine",
        optional: false,
        image: "",
      },

      {
        name: "Constantia Glen Wine Estate",
        description:
          "Finish the Winelands experience at this boutique estate with panoramic views over the Constantia Valley. A standard wine tasting is included.",
        time: "14:40",
        duration: "±40 minutes",
        type: "wine",
        optional: false,
        image: "",
      },

      {
        name: "Return to Cape Town CBD",
        description: "Enjoy a comfortable return journey to the Cape Town CBD.",
        time: "15:30",
        duration: "±30 minutes",
        type: "transport",
        optional: false,
        image: "",
      },
    ],

    securityAndLiability: null,

    accommodation: {
      included: false,
      type: "",
      description:
        "No accommodation is included. This is a full-day Cape Town experience.",
    },

    needToKnow: [
      {
        text: "This is a private 7–8 hour experience.",
      },
      {
        text: "All listed entry fees are included according to the applicable passenger category.",
      },
      {
        text: "Two standard wine tastings are included for adults and teens.",
      },
      {
        text: "Klein Constantia wine tasting is optional and charged separately.",
      },
      {
        text: "Lunch is not included.",
      },
      {
        text: "Optional wine purchases and gratuities are not included.",
      },
      {
        text: "Children aged 6–12 receive the child rate and Kirstenbosch entry only.",
      },
      {
        text: "Infants aged 0–5 travel free with no entry fees.",
      },
      {
        text: "Wine tastings are subject to applicable age requirements.",
      },
    ],

    faqs: [
      {
        question: "How many wine tastings are included?",
        answer:
          "Two standard wine tastings are included: one at Groot Constantia and one at Constantia Glen.",
      },
      {
        question: "Is the Klein Constantia wine tasting included?",
        answer:
          "No. The Klein Constantia estate visit is included, but the wine tasting is optional and available at an additional cost.",
      },
      {
        question: "Is lunch included?",
        answer:
          "No. Lunch is not included. Guests can choose from several recommended restaurants in the Constantia area.",
      },
      {
        question: "Is Kirstenbosch entry included?",
        answer:
          "Yes. Kirstenbosch entry is included in the tour price. Children have a separate child rate that includes Kirstenbosch entry.",
      },
      {
        question: "Is this tour suitable for children?",
        answer:
          "Yes. The experience has a family-friendly structure, with discounted pricing for children aged 6–12 and free entry for infants aged 0–5.",
      },
      {
        question: "Is the tour private?",
        answer:
          "Yes. The experience includes a private vehicle and professional driver-guide.",
      },
      {
        question: "What areas does the tour visit?",
        answer:
          "The route runs from Cape Town CBD to AfroGem, Kirstenbosch, Groot Constantia, Klein Constantia and Constantia Glen before returning to the CBD.",
      },
      {
        question: "What time does the tour return to Cape Town?",
        answer:
          "The scheduled return to the Cape Town CBD is approximately 16:00.",
      },
    ],

    tags: [
      "cape-town",
      "kirstenbosch",
      "constantia",
      "groot-constantia",
      "klein-constantia",
      "constantia-glen",
      "wine",
      "heritage",
      "nature",
      "family",
      "private-tour",
      "day-tour",
    ],
  },
  // West Coast National Park + Kraalbaai + Groote Post Winery
  {
    id: 25,
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.DAY_TOUR,

    title: "West Coast National Park, Kraalbaai & Groote Post Winery",
    slug: "west-coast-national-park-kraalbaai-groote-post-winery-tour",
    canonicalPath:
      "/tours/west-coast-national-park-kraalbaai-groote-post-winery-tour",
    childFriendly: true,

    seo: {
      title:
        "West Coast National Park, Kraalbaai & Groote Post Winery Private Full-Day Tour",
      description:
        "Explore West Coast National Park, beautiful Kraalbaai and historic Groote Post Winery on a private full-day tour from Cape Town, with wildlife viewing, lagoon scenery, beach time and a wine tasting included.",
      keywords: [
        "West Coast National Park tour",
        "Kraalbaai tour",
        "Groote Post Winery tour",
        "West Coast Cape Town tour",
        "Cape Town West Coast tour",
        "Langebaan tour",
        "Kraalbaai beach tour",
        "West Coast National Park private tour",
        "Groote Post wine tour",
        "Cape Town private day tour",
        "West Coast wildlife tour",
        "West Coast wildflower tour",
      ],
    },

    workflow: defaultWorkflow,

    image: "/src/assets/images/tours/packages/west-coast/1.webp",
    images: ["/src/assets/images/tours/packages/west-coast/1.webp"],
    imageFolder: "packages/west-coast",
    videos: [],

    location:
      "West Coast National Park, Kraalbaai & Groote Post Winery, Western Cape, South Africa",

    duration: "Full day",

    priceBase: 3200,
    minPeople: 2,

    pricing: [
      {
        category: "Adult",
        pricePerPerson: 3200,
        note: "",
      },
      {
        category: "Child: 5–12 Years",
        pricePerPerson: 1900,
        note: "Child rate for guests aged 5–12 years.",
      },
      {
        category: "Toddler: 0-4 Years",
        pricePerPerson: null,
        note: "Not applicable for toddlers.",
      },
    ],

    additionalPricing: [
      {
        type: "external",
        category: "Kayak rental at Kraalbaai",
        pricePerPerson: null,
        note: "Optional activity. Guest-paid directly.",
      },
      {
        type: "external",
        category: "Stand-up paddle boarding at Kraalbaai",
        pricePerPerson: null,
        note: "Optional activity. Guest-paid directly.",
      },
    ],

    groupPricing: {
      enabled: true,
      icon: "",
      tiers: [
        {
          minPeople: 2,
          maxPeople: 3,
          perPerson: 3200,
          label: "2–3 guests",
          note: "Adult rate. Minimum tour total of R6,400 covers 2 guests.",
        },
        {
          minPeople: 4,
          maxPeople: 6,
          perPerson: 3100,
          label: "4–6 guests",
          note: "Adult rate for groups of 4–6 guests.",
        },
        {
          minPeople: 7,
          maxPeople: 10,
          perPerson: 3000,
          label: "7–10 guests",
          note: "Adult rate for groups of 7–10 guests.",
        },
        {
          minPeople: 11,
          maxPeople: null,
          perPerson: null,
          label: "11+ guests",
          note: "Custom quote based on group size and requirements.",
        },
      ],
    },

    description:
      "A private full-day journey along the Cape West Coast, combining the natural beauty of West Coast National Park, the turquoise lagoon waters of Kraalbaai and the peaceful countryside setting of Groote Post Winery. Guests can enjoy wildlife viewing, scenic lagoon viewpoints, beach time, photography stops and a standard wine tasting at Groote Post. The experience also includes private transport, a professional driver-guide, onboard Wi-Fi, bottled water and all listed entry fees.",

    highlights: [
      {
        text: "Explore West Coast National Park",
      },
      {
        text: "Visit beautiful Kraalbaai and its turquoise lagoon",
      },
      {
        text: "±2–3 hours of beach time at Kraalbaai",
      },
      {
        text: "Wildlife viewing inside West Coast National Park",
      },
      {
        text: "Scenic Langebaan Lagoon viewpoints",
      },
      {
        text: "Standard wine tasting at Groote Post Winery included",
      },
      {
        text: "Historic Groote Post Winery and countryside landscapes",
      },
      {
        text: "Seasonal Postberg wildflower reserve scenery",
      },
      {
        text: "Scenic stop in Yzerfontein",
      },
      {
        text: "Private vehicle and professional driver-guide",
      },
      {
        text: "Onboard Wi-Fi and bottled water",
      },
      {
        text: "All listed entry fees included",
      },
    ],

    included: [
      {
        text: "Private vehicle for the full day",
      },
      {
        text: "Professional driver-guide",
      },
      {
        text: "Onboard Wi-Fi",
      },
      {
        text: "Bottled water for all guests",
      },
      {
        text: "Standard wine tasting at Groote Post Winery",
      },
      {
        text: "West Coast National Park entry",
      },
      {
        text: "Kraalbaai access",
      },
      {
        text: "Groote Post Winery entry",
      },
      {
        text: "Scenic stop at Yzerfontein",
      },
      {
        text: "Langebaan Lagoon viewpoints",
      },
      {
        text: "Wildlife viewing inside the park",
      },
      {
        text: "Photo stops and commentary",
      },
    ],

    excluded: [
      {
        text: "Lunch at Groote Post Winery",
      },
      {
        text: "Kayak rental at Kraalbaai",
      },
      {
        text: "Stand-up paddle boarding at Kraalbaai",
      },
      {
        text: "Snacks or additional beverages",
      },
      {
        text: "Beach towels or swimwear",
      },
      {
        text: "Personal purchases at shops or farm stalls",
      },
    ],

    pickupOptions: [
      {
        type: "hotel",
        label: "Cape Town CBD & surrounds",
        description:
          "Private pick-up and drop-off from accommodation in Cape Town CBD and surrounding areas.",
      },
    ],

    requirements: [
      "Guests should bring suitable identification where required.",
      "Guests should bring suitable swimwear and beach equipment if they intend to swim.",
      "Guests participating in the wine tasting must meet applicable legal drinking-age requirements.",
    ],

    arrangements: {
      availability:
        "Available subject to West Coast National Park, Kraalbaai and Groote Post Winery operating conditions.",
      duration: "Full day",
      operatingTime: "",
      departure: "Cape Town CBD & surrounds",
      return: "Cape Town CBD & surrounds",
      location:
        "Cape Town → Yzerfontein → West Coast National Park → Kraalbaai → Groote Post Winery → Cape Town",

      clothing: [
        "Comfortable clothing",
        "Comfortable walking shoes",
        "Swimwear if swimming at Kraalbaai",
        "Light jacket for cooler weather",
      ],

      thingsToBring: [
        "Sun protection",
        "Hat",
        "Sunscreen",
        "Camera",
        "Swimwear",
        "Beach towel",
      ],

      passengerPolicy:
        "Guests are expected to follow the instructions of the professional driver-guide, West Coast National Park and Groote Post Winery staff.",

      notes: [
        "Lunch at Groote Post Winery is not included and is guest-paid.",
        "Kayaking and stand-up paddle boarding at Kraalbaai are optional and guest-paid.",
        "The standard wine tasting at Groote Post Winery is included.",
        "Additional beverages and personal purchases are not included.",
        "Postberg wildflower displays are seasonal and are highlighted during August–September.",
        "Yzerfontein is a scenic/photo stop with an optional coffee break.",
        "Langebaan is mentioned as a place along the route and offers lagoon views.",
        "Beach time at Kraalbaai is approximately 2–3 hours.",
        "Park and venue access is subject to operating conditions.",
      ],
    },

    weatherPolicy: {
      summary:
        "The tour operates subject to weather and safety conditions, particularly for outdoor activities at Kraalbaai and within the national park.",
      items: [
        {
          text: "Wildlife viewing and scenic drives generally continue in suitable weather conditions.",
        },
        {
          text: "Beach activities at Kraalbaai may be affected by weather and water conditions.",
        },
        {
          text: "Optional kayaking and stand-up paddle boarding are subject to operator and weather conditions.",
        },
        {
          text: "Seasonal wildflower displays depend on seasonal conditions and cannot be guaranteed.",
        },
      ],
    },

    safetyPolicy: {
      summary:
        "Guests must follow the safety requirements of West Coast National Park, Kraalbaai activity operators and Groote Post Winery.",
      items: [
        {
          text: "Guests must follow all instructions provided by the professional driver-guide and venue staff.",
        },
        {
          text: "Guests should remain with the group during scheduled transfers and activities.",
        },
        {
          text: "Guests should exercise caution around the lagoon and beach areas.",
        },
        {
          text: "Optional water activities are subject to operator safety requirements.",
        },
        {
          text: "Responsible alcohol consumption is expected during the wine tasting.",
        },
      ],
    },

    /*
     * FULL-DAY TOUR
     * Uses stops rather than the multi-day itinerary structure.
     */
    itinerary: null,

    stops: [
      {
        name: "Yzerfontein",
        description:
          "Visit the quiet coastal village of Yzerfontein for a quick scenic photo opportunity and optional coffee break.",
        time: "Flexible",
        duration: "",
        type: "scenic",
        optional: true,
        image: "",
      },

      {
        name: "West Coast National Park",
        description:
          "Explore one of South Africa's most scenic protected areas, with wildlife viewing, lagoon viewpoints, fynbos vegetation, photography opportunities and commentary about conservation and the West Coast ecosystem.",
        time: "",
        duration: "",
        type: "nature",
        optional: false,
        image: "",
      },

      {
        name: "Langebaan Lagoon Viewpoints",
        description:
          "Enjoy scenic viewpoints overlooking the turquoise waters of Langebaan Lagoon while travelling through the West Coast National Park area.",
        time: "",
        duration: "",
        type: "scenic",
        optional: false,
        image: "",
      },

      {
        name: "Kraalbaai",
        description:
          "Spend approximately 2–3 hours at Kraalbaai enjoying its crystal-clear turquoise lagoon, white sandy beach and peaceful surroundings. Swimming and relaxation are available, with optional kayaking and stand-up paddle boarding at guest cost.",
        time: "",
        duration: "±2–3 hours",
        type: "beach",
        optional: false,
        image: "",
      },

      {
        name: "Groote Post Winery",
        description:
          "Visit the historic Groote Post Winery for its scenic countryside atmosphere, rolling hills, vineyards and historic farm buildings. A standard wine tasting is included, while lunch at the restaurant is guest-paid.",
        time: "",
        duration: "",
        type: "wine",
        optional: false,
        image: "",
      },

      {
        name: "Return to Cape Town",
        description:
          "Comfortable private journey back to Cape Town following the day's West Coast experience.",
        time: "",
        duration: "",
        type: "transport",
        optional: false,
        image: "",
      },
    ],

    needToKnow: [
      {
        text: "The minimum tour total is R6,400 and covers 2 guests.",
      },
      {
        text: "Adult pricing is R3,200 pp for 2–3 guests, R3,100 pp for 4–6 guests and R3,000 pp for 7–10 guests.",
      },
      {
        text: "The child rate is R1,900 pp for ages 5–12 and R2,100 pp for ages 13–17.",
      },
      {
        text: "The standard wine tasting at Groote Post Winery is included.",
      },
      {
        text: "Lunch at Groote Post Winery is not included and is guest-paid.",
      },
      {
        text: "Kayaking and stand-up paddle boarding at Kraalbaai are optional and guest-paid.",
      },
      {
        text: "Kraalbaai beach time is approximately 2–3 hours.",
      },
      {
        text: "Postberg wildflowers are seasonal and are typically highlighted during August–September.",
      },
      {
        text: "Yzerfontein is a scenic/photo stop with an optional coffee break.",
      },
      {
        text: "Langebaan is mentioned as a location along the route and offers lagoon views.",
      },
      {
        text: "Guests should bring suitable swimwear if they intend to swim at Kraalbaai.",
      },
      {
        text: "Additional beverages, snacks and personal purchases are not included.",
      },
    ],

    faqs: [
      {
        question: "What is included in the tour?",
        answer:
          "The tour includes a private vehicle, professional driver-guide, onboard Wi-Fi, bottled water, standard wine tasting at Groote Post Winery, West Coast National Park entry, Kraalbaai access, Groote Post Winery entry and scenic stops.",
      },

      {
        question: "Is the wine tasting at Groote Post included?",
        answer:
          "Yes. A standard wine tasting at Groote Post Winery is included in the tour price.",
      },

      {
        question: "Is lunch included?",
        answer: "No. Lunch at Groote Post Winery is guest-paid.",
      },

      {
        question: "How long do we spend at Kraalbaai?",
        answer:
          "Approximately 2–3 hours are allocated for beach time, swimming and relaxation at Kraalbaai.",
      },

      {
        question: "Can we kayak or paddleboard at Kraalbaai?",
        answer:
          "Yes. Kayaking and stand-up paddle boarding are available as optional activities, but guests pay for these separately.",
      },

      {
        question: "Is this tour suitable for children?",
        answer:
          "Yes. The tour is suitable for families, with calm lagoon-style waters at Kraalbaai, wildlife viewing, scenic stops and plenty of outdoor space.",
      },

      {
        question: "What wildlife can we see?",
        answer:
          "The park is home to animals including eland, bontebok, ostrich and tortoises, as well as migratory birds.",
      },

      {
        question: "Can we see the West Coast wildflowers?",
        answer:
          "The Postberg wildflower reserve is seasonal, with wildflower displays highlighted during August–September. Displays depend on seasonal conditions and cannot be guaranteed.",
      },

      {
        question: "Do we stop in Yzerfontein?",
        answer:
          "Yzerfontein is a scenic stop for a quick photo opportunity and optional coffee break.",
      },

      {
        question: "Do we stop in Langebaan?",
        answer:
          "Langebaan is mentioned as a place along the route and offers beautiful lagoon views.",
      },

      {
        question: "Is this a private tour?",
        answer:
          "Yes. The experience includes a private vehicle and professional driver-guide for the full day.",
      },

      {
        question: "Where can you pick us up?",
        answer:
          "Pick-up and drop-off are available in Cape Town CBD and surrounding areas.",
      },
    ],

    tags: [
      "west-coast",
      "west-coast-national-park",
      "kraalbaai",
      "groote-post",
      "winery",
      "langebaan",
      "yzerfontein",
      "wildlife",
      "beach",
      "wine",
      "cape-town",
      "private-tour",
      "day-tour",
      "family-friendly",
    ],
  },
  // 3-Day / 2-Night Garden Route & Safari Escape
  {
    id: 27, // assign
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.MULTI_DAY,

    title: "3-Day Garden Route & Safari Escape",
    slug: "3-day-garden-route-safari-escape",
    canonicalPath: "/tours/3-day-garden-route-safari-escape",
    childFriendly: true, // family packages offered for children 3–11 (QUERY CLIENT: minimum age)
    daysInAdvance: 30, // QUERY CLIENT (booking cut-off)

    seo: {
      title:
        "3-Day Garden Route & Safari Escape from Cape Town | Cape Frontier Tours",
      description:
        "3 days, 2 nights from Cape Town: Route 62, Oudtshoorn ostrich farm, Cango Caves, Knysna Heads, a private game reserve safari and Mossel Bay.",
      keywords: [
        "3 day Garden Route tour",
        "Garden Route and safari tour",
        "Cape Town to Garden Route tour",
        "Route 62 tour",
        "Oudtshoorn ostrich farm tour",
        "Cango Caves tour",
        "Knysna Heads tour",
        "Garden Route private game reserve safari",
        "Mossel Bay tour",
        "Mossel Bay zipline",
        "Cape Town multi-day tour",
        "Garden Route family tour",
      ],
    },

    workflow: defaultWorkflow,

    image:
      "/src/assets/images/tours/packages/3-day-garden-route-safari-escape/4.webp", // TODO
    images: getTourImages("packages/3-day-garden-route-safari-escape", 5), // TODO
    imageFolder: "packages/3-day-garden-route-safari-escape",
    videos: [],

    location:
      "Cape Town, Oudtshoorn, Knysna & Mossel Bay, Western Cape, South Africa",
    duration: "3 Days / 2 Nights",

    priceBase: 17000,
    minPeople: 2,

    pricing: [
      {
        category: "Adult (sharing, 2 guests)",
        pricePerPerson: 17000,
        note: "Per person sharing. Includes 15% VAT.",
      },

      // DERIVED from the family package totals (total minus 2 x R17,000, divided by
      // number of children). The same figure comes out for 1, 2 and 3 children.
      // QUERY CLIENT: confirm these are the real child rates before publishing.
      {
        category: "Child: 3–5 Years",
        pricePerPerson: 11900,
        note: "Child rate when sharing with parents. Includes 15% VAT.",
      },
      {
        category: "Child: 6–11 Years",
        pricePerPerson: 12750,
        note: "Child rate when sharing with parents. Includes 15% VAT.",
      },

      // QUERY CLIENT: left out on purpose (no rate supplied; null would render "R0.00" or "RNaN")
      // { category: "Solo Traveller (single supplement)", pricePerPerson: ???, note: "" },
      // { category: "Child: 0–2 Years", pricePerPerson: ???, note: "" },
      // { category: "Child: 12–17 Years", pricePerPerson: ???, note: "" },
    ],

    /*
     * FAMILY PACKAGE TOTALS (supplied by client, per family, ZAR, incl. 15% VAT):
     *   2 Adults + 1 Child (3–5 yrs)   R45,900
     *   2 Adults + 1 Child (6–11 yrs)  R46,750
     *   2 Adults + 2 Children (3–5)    R57,800
     *   2 Adults + 2 Children (6–11)   R59,500
     *   2 Adults + 3 Children (3–5)    R69,700
     *   2 Adults + 3 Children (6–11)   R72,250
     * The current schema has no field for fixed family totals, so these are stored in
     * the child rates above and in the FAQs / needToKnow. QUERY: add a familyPackages field?
     */

    additionalPricing: [
      {
        type: "request",
        category: "Mossel Bay Ocean Zipline (longest over-ocean zipline)",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Optional. Payable separately. Subject to availability and weather.",
      },
      {
        type: "request",
        category: "Knysna Lagoon Boat Cruise",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Optional. Payable separately. Subject to availability.",
      },
      {
        type: "request",
        category: "Knysna Oyster Tasting",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Optional. Payable separately. Subject to availability.",
      },
      {
        type: "request",
        category: "Cango Wildlife Ranch (Oudtshoorn)",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Optional. Payable separately. Subject to availability.",
      },
      {
        type: "request",
        category: "Higher-category accommodation upgrade",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Available on request at an additional cost.",
      },
    ],

    groupPricing: {
      enabled: false, // no group discounts supplied
      icon: "/icons/savemore.png",
      tiers: [],
    },

    rating: null,
    stars: null,
    mainReviewerName: "",
    mainReviewerCountry: "",
    reviewYear: null,
    otherReviews: null,
    mainReview: "",

    description:
      "Experience the best of South Africa's Garden Route and Klein Karoo on a memorable 3-day, 2-night guided journey from Cape Town and back. This tour combines spectacular scenic drives, cultural and historical attractions, fascinating natural wonders, coastal experiences and an exciting African safari. Travelling along the famous Route 62, you will discover the beautiful Cape Winelands, visit an ostrich farm in Oudtshoorn, explore the magnificent Cango Caves, admire the iconic Knysna Heads and enjoy a wildlife safari at a private game reserve. The journey concludes in Mossel Bay, where you can explore the town's rich maritime history and coastal attractions, with an optional over-ocean zipline, before returning to Cape Town.",

    highlights: [
      { text: "Scenic Route 62 and the Cape Winelands" },
      { text: "Ostrich farm experience in Oudtshoorn" },
      { text: "Cango Caves exploration with natural limestone formations" },
      { text: "Swartberg Mountain scenery" },
      { text: "Knysna Heads and Knysna Waterfront" },
      {
        text: "Private game reserve safari with wildlife viewing and game drive",
      },
      { text: "Mossel Bay sightseeing and historical attractions" },
      { text: "Optional longest over-ocean zipline experience" },
    ],

    included: [
      { text: "Private transportation from Cape Town and return" },
      { text: "Professional driver-guide" },
      { text: "Fuel and road travel for the scheduled itinerary" },
      { text: "Route 62 scenic journey" },
      { text: "Robertson Wine Region scenic drive" },
      { text: "Ostrich farm guided experience" },
      { text: "Cango Caves standard guided tour" },
      { text: "Swartberg region scenic drive" },
      { text: "Knysna Heads sightseeing" },
      { text: "Knysna Waterfront visit" },
      { text: "One night's accommodation in Oudtshoorn" },
      { text: "One night's accommodation at the selected private game lodge" },
      { text: "Breakfast at the Oudtshoorn guesthouse" },
      {
        text: "Breakfast, lunch and dinner at the game reserve (according to the selected package)",
      },
      { text: "Morning guided safari game drive" },
      { text: "Mossel Bay sightseeing" },
      {
        text: "Bartolomeu Dias Museum Complex visit (subject to agreed entry arrangements)",
      },
    ],

    excluded: [
      { text: "International and domestic flights" },
      { text: "Travel and medical insurance" },
      { text: "Personal expenses and shopping" },
      { text: "Alcoholic and additional beverages" },
      { text: "Meals not specifically mentioned in the itinerary" },
      { text: "Optional activities and excursions" },
      { text: "Ocean Zipline experience in Mossel Bay" },
      { text: "Gratuities for the driver, guide and safari rangers" },
      { text: "Additional accommodation before or after the tour" },
      { text: "Any additional nights or itinerary extensions" },
      { text: "Laundry services and personal purchases" },
      { text: "Entry fees not specifically listed as included" },
    ],

    pickupOptions: [], // QUERY CLIENT: pickup points, if offered
    requirements: [
      { text: "A valid passport is required for all international visitors" },
      {
        text: "Guests are responsible for arranging valid travel documentation where required",
      },
      {
        text: "Special dietary requirements must be communicated prior to departure",
      },
      { text: "Children must be accompanied by an adult at all times" },
    ],

    arrangements: {
      availability:
        "Subject to availability at the time of confirmation. Departures are subject to minimum passenger requirements where applicable.", // QUERY CLIENT: fixed dates or on request?
      duration: "3 Days / 2 Nights",
      operatingTime: "",
      departure: "Cape Town", // QUERY CLIENT: departure time
      return: "Cape Town, evening of Day 3",
      location:
        "Cape Town → Robertson → Route 62 → Oudtshoorn → Cango Caves → Knysna → Garden Route Game Lodge → Mossel Bay → Cape Town",

      clothing: ["Comfortable walking shoes", "Warm jacket", "Sunglasses"],

      thingsToBring: [
        "Valid passport (international visitors)",
        "Sunscreen",
        "Sunglasses",
        "Camera",
        "Comfortable walking shoes",
        "Warm jacket",
      ],

      passengerPolicy: "",

      notes: [
        "Accommodation is based on carefully selected 3-star guesthouses, lodges and safari accommodation",
        "Night 1: guesthouse or lodge in Oudtshoorn (to be confirmed based on guest preference and availability)",
        "Night 2: Garden Route Game Lodge (safari lodge or tented accommodation, depending on the selected room category)",
        "Higher-category accommodation upgrades are available on request at an additional cost",
        "Optional activities are available at an additional cost and are subject to availability, operating schedules and advance booking requirements",
        "Optional activities must be requested at the time of booking whenever possible",
        "The itinerary may be adjusted due to weather, road conditions, wildlife sightings or other unforeseen circumstances, with guest safety remaining the priority",
        "Cape Frontier Travel & Tours may substitute accommodation or activities with similar alternatives of an equivalent standard if required",
      ],
    },

    weatherPolicy: {
      summary:
        "Activities and safari sightings are subject to weather, environmental conditions and operational requirements. The itinerary may be adjusted for weather or road conditions.",
      items: [
        {
          text: "The Mossel Bay Ocean Zipline is subject to availability and weather conditions",
        },
        {
          text: "Safari sightings depend on weather and environmental conditions",
        },
        {
          text: "The itinerary may be adjusted due to weather or road conditions",
        },
        {
          text: "Accommodation and activity operators may amend services due to weather, safety or operational requirements",
        },
      ],
    },

    cancellationPolicy: {
      summary:
        "A 30% non-refundable deposit secures your booking. Refunds depend on how far ahead of departure you cancel, and all cancellations must be made in writing.",
      items: [
        {
          text: "More than 30 days before departure: 90% refund of monies paid, less administration fees",
        },
        { text: "15–30 days before departure: 50% refund of monies paid" },
        { text: "7–14 days before departure: 25% refund of monies paid" },
        { text: "Less than 7 days before departure: no refund" },
        {
          text: "No-shows, unused services, missed departures and early departures are non-refundable",
        },
        {
          text: "Certain third-party supplier fees may be non-refundable and will be deducted from any refund due",
        },
        { text: "All cancellations must be submitted in writing" },
        {
          text: "Refunds, where applicable, are processed within 14 business days of cancellation approval",
        },
      ],
    },

    safetyPolicy: {
      summary:
        "Guest safety is the priority throughout the tour. Children must be accompanied by an adult at all times.",
      items: [
        { text: "Children must be accompanied by an adult at all times" },
        {
          text: "Follow the instructions of your driver-guide, safari rangers and venue staff",
        },
        { text: "Itinerary changes may be made for guest safety" },
      ],
    },

    /*
     * MULTI-DAY ITINERARY
     */
    itinerary: {
      intro: {
        title: "Your 3-Day Garden Route & Safari Journey",
        description:
          "From the Cape Winelands and Route 62 to the Klein Karoo, Knysna, a private game reserve and the historic harbour town of Mossel Bay.",
      },

      route: {
        title:
          "Cape Town → Oudtshoorn → Knysna → Game Reserve → Mossel Bay → Cape Town",
        description: "",
      },

      days: [
        {
          day: 1,
          title: "Cape Town → Route 62 → Oudtshoorn",
          route: "Cape Town → Robertson → Route 62 → Oudtshoorn",
          description:
            "Depart Cape Town and travel through the Cape Winelands towards Robertson and the famous Route 62, enjoying mountain scenery, vineyards, country towns and the semi-arid landscapes of the Klein Karoo. In Oudtshoorn, visit a working ostrich farm, then check in at your guesthouse for a relaxing evening.",

          activities: [
            {
              id: "d1-depart",
              title: "Depart Cape Town",
              description:
                "Travel through the beautiful Cape Winelands towards Robertson and the Route 62.",
              time: "",
              duration: "",
              type: "transfer",
              optional: false,
              image: "",
            },
            {
              id: "d1-route62",
              title: "Scenic Route 62 & Robertson Wine Region",
              description:
                "Picturesque mountain scenery, vineyards, country towns and the Klein Karoo landscapes.",
              time: "",
              duration: "",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d1-ostrich",
              title: "Ostrich Farm, Oudtshoorn",
              description:
                "An educational guided experience at a working ostrich farm, learning about ostrich farming and the area's heritage.",
              time: "",
              duration: "",
              type: "wildlife",
              optional: false,
              image: "",
            },
            {
              id: "d1-checkin",
              title: "Check in at your Oudtshoorn accommodation",
              description:
                "Check in at your selected guesthouse and enjoy a relaxing evening.",
              time: "",
              duration: "",
              type: "accommodation",
              optional: false,
              image: "",
            },
          ],

          // QUERY CLIENT: Day 1 meals not stated
          meals: { breakfast: false, lunch: false, dinner: false },

          accommodation: {
            title: "Oudtshoorn guesthouse or lodge",
            location: "Oudtshoorn, Klein Karoo",
            availabilityNote:
              "Accommodation to be confirmed based on guest preference and availability.",
            options: ["3-star guesthouse or lodge", "Breakfast included"],
            image: "",
          },

          images: [],
        },

        {
          day: 2,
          title: "Cango Caves, Knysna & Private Game Reserve",
          route: "Oudtshoorn → Cango Caves → Swartberg → Knysna → Game Reserve",
          description:
            "After breakfast, explore the Cango Caves and continue through the Swartberg region to the Garden Route coast. Visit the Knysna Heads and the Knysna Waterfront, then head to your private game reserve for check-in, dinner and a night in the bush.",

          activities: [
            {
              id: "d2-cango",
              title: "Cango Caves",
              description:
                "A standard guided tour of the impressive limestone chambers, stalactites and stalagmites.",
              time: "",
              duration: "",
              type: "nature",
              optional: false,
              image: "",
            },
            {
              id: "d2-wildlife-ranch",
              title: "Cango Wildlife Ranch",
              description:
                "Animal encounters, conservation experiences and guided wildlife exhibits. Payable separately.",
              time: "",
              duration: "",
              type: "wildlife",
              optional: true,
              image: "",
            },
            {
              id: "d2-swartberg",
              title: "Swartberg Region Drive",
              description:
                "Breathtaking mountain scenery on the way to the Garden Route coastline.",
              time: "",
              duration: "",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-knysna-heads",
              title: "Knysna Heads",
              description: "Sightseeing at the famous Knysna Heads viewpoint.",
              time: "",
              duration: "",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-waterfront",
              title: "Knysna Waterfront",
              description:
                "Free time for shopping, photographs or refreshments.",
              time: "",
              duration: "",
              type: "leisure",
              optional: false,
              image: "",
            },
            {
              id: "d2-lagoon-cruise",
              title: "Knysna Lagoon Boat Cruise",
              description:
                "A relaxing cruise on Knysna Lagoon with views of the Knysna Heads, coastline and waterfront. Payable separately.",
              time: "",
              duration: "",
              type: "leisure",
              optional: true,
              image: "",
            },
            {
              id: "d2-oysters",
              title: "Knysna Oyster Tasting",
              description:
                "Sample the region's famous fresh oysters. Payable separately.",
              time: "",
              duration: "",
              type: "food",
              optional: true,
              image: "",
            },
            {
              id: "d2-reserve",
              title: "Check in at the Private Game Reserve",
              description:
                "In the late afternoon, check in at the Garden Route Game Lodge, enjoy dinner and relax in the natural surroundings.",
              time: "Late afternoon",
              duration: "",
              type: "accommodation",
              optional: false,
              image: "",
            },
          ],

          // QUERY CLIENT: Day 2 lunch not stated
          meals: { breakfast: true, lunch: false, dinner: true },

          accommodation: {
            title: "Garden Route Game Lodge",
            location: "Garden Route, Western Cape",
            availabilityNote: "",
            options: [
              "Safari lodge or tented accommodation, depending on room category",
            ],
            image: "",
          },

          images: [],
        },

        {
          day: 3,
          title: "Morning Safari, Mossel Bay & Return to Cape Town",
          route: "Game Reserve → Mossel Bay → Cape Town",
          description:
            "Wake up to the sounds of the bush for an early morning game drive with experienced rangers, then enjoy breakfast and check-out. Travel to Mossel Bay for coastal sightseeing and the Bartolomeu Dias Museum Complex, then take the scenic route back to Cape Town, arriving in the evening.",

          activities: [
            {
              id: "d3-gamedrive",
              title: "Morning Guided Game Drive",
              description:
                "An early morning game drive with experienced safari rangers. Look out for giraffes, zebras, antelope and other wildlife in the reserve.",
              time: "Early morning",
              duration: "",
              type: "safari",
              optional: false,
              image: "",
            },
            {
              id: "d3-breakfast",
              title: "Breakfast & Check-out",
              description:
                "Breakfast at the game reserve, followed by check-out.",
              time: "",
              duration: "",
              type: "food",
              optional: false,
              image: "",
            },
            {
              id: "d3-museum",
              title: "Bartolomeu Dias Museum Complex, Mossel Bay",
              description:
                "Coastal sightseeing and historical exploration, including the famous Post Office Tree, Ethno-Botanical Garden, Fountain, Munrohoek Cottages and Malay Graves.",
              time: "",
              duration: "",
              type: "heritage",
              optional: false,
              image: "",
            },
            {
              id: "d3-zipline",
              title: "Mossel Bay Ocean Zipline",
              description:
                "The longest over-ocean zipline experience. Payable separately, subject to availability and weather.",
              time: "",
              duration: "",
              type: "adventure",
              optional: true,
              image: "",
            },
            {
              id: "d3-return",
              title: "Return to Cape Town",
              description:
                "Lunch, then the scenic return journey to Cape Town, arriving in the evening.",
              time: "Evening arrival",
              duration: "",
              type: "transfer",
              optional: false,
              image: "",
            },
          ],

          // QUERY CLIENT: Day 3 lunch is mentioned in the itinerary but not listed as included
          meals: { breakfast: true, lunch: false, dinner: false },

          images: [],
        },
      ],
    },

    stops: null,

    vehicle: null,

    securityAndLiability: null,

    accommodation: {
      included: true,
      type: "3-Star Guesthouse & Safari Lodge",
      description:
        "1 night at a guesthouse or lodge in Oudtshoorn and 1 night at the Garden Route Game Lodge (safari lodge or tented accommodation). Higher-category upgrades are available on request.",
    },

    needToKnow: [
      {
        text: "Adult rate is R17,000 per person sharing (2 guests), including 15% VAT",
      },
      {
        text: "Child rates when sharing with parents: R11,900 (3–5 years) and R12,750 (6–11 years)",
      },
      {
        text: "Family packages (2 adults): R45,900 with 1 child aged 3–5, R46,750 with 1 child aged 6–11, R57,800 with 2 children aged 3–5, R59,500 with 2 children aged 6–11, R69,700 with 3 children aged 3–5 and R72,250 with 3 children aged 6–11",
      },
      {
        text: "Rates are in ZAR and may change with supplier rate adjustments until the deposit is received and confirmed",
      },
      {
        text: "A 30% non-refundable deposit secures your booking; the balance is due 30 days before departure",
      },
      {
        text: "Bookings made within 30 days of departure require full payment on confirmation",
      },
      { text: "Payment can be made by EFT or an approved payment gateway" },
      {
        text: "Cancellation refunds: 90% (more than 30 days), 50% (15–30 days), 25% (7–14 days) and none (less than 7 days)",
      },
      {
        text: "Accommodation is 3-star; higher-category upgrades are available on request at extra cost",
      },
      {
        text: "Optional activities (zipline, Knysna Lagoon Boat Cruise, oyster tasting, Cango Wildlife Ranch) are paid separately and subject to availability",
      },
      {
        text: "Meals not listed in the itinerary, drinks and gratuities are not included",
      },
      { text: "Travel insurance is strongly recommended" },
      { text: "A valid passport is required for international visitors" },
      {
        text: "Special dietary requirements must be communicated before departure",
      },
    ],

    faqs: [
      {
        question: "How long is the tour?",
        answer:
          "This is a 3-day, 2-night guided tour departing from and returning to Cape Town.",
      },
      {
        question: "Where do we stay?",
        answer:
          "Night 1 is in a guesthouse or lodge in Oudtshoorn. Night 2 is at the Garden Route Game Lodge, in safari lodge or tented accommodation depending on the room category chosen. Accommodation is 3-star, with upgrades available on request.",
      },
      {
        question: "What is included in the tour price?",
        answer:
          "Private transport with a professional driver-guide, fuel, one night in Oudtshoorn and one night at the game lodge, breakfast in Oudtshoorn, breakfast, lunch and dinner at the game reserve (according to the selected package), the ostrich farm experience, a standard guided tour of the Cango Caves, Knysna Heads and Waterfront, a morning game drive, Mossel Bay sightseeing and the Bartolomeu Dias Museum Complex visit.",
      },
      {
        question: "What is not included?",
        answer:
          "Flights, travel and medical insurance, alcoholic and additional drinks, meals not listed in the itinerary, optional activities, gratuities, personal expenses, laundry, extra nights and any entry fees not listed as included.",
      },
      {
        question: "Which optional activities can I add?",
        answer:
          "The Mossel Bay Ocean Zipline, a Knysna Lagoon Boat Cruise, Knysna oyster tasting and the Cango Wildlife Ranch. These are paid separately and are subject to availability and weather. Please request them when you book.",
      },
      {
        question: "Is the Mossel Bay zipline included?",
        answer:
          "No. The Ocean Zipline is optional, payable separately and subject to availability and weather conditions.",
      },
      {
        question: "Is this tour suitable for children?",
        answer:
          "Yes. Family packages are available for children aged 3–11 sharing with their parents. Children must be accompanied by an adult at all times.",
      },
      {
        question: "How much do family packages cost?",
        answer:
          "For 2 adults: R45,900 with 1 child aged 3–5 and R46,750 with 1 child aged 6–11; R57,800 with 2 children aged 3–5 and R59,500 with 2 children aged 6–11; R69,700 with 3 children aged 3–5 and R72,250 with 3 children aged 6–11. Rates include 15% VAT.",
      },
      {
        question: "How do I pay and what is the cancellation policy?",
        answer:
          "A 30% non-refundable deposit secures your booking, with the balance due 30 days before departure (bookings within 30 days require full payment). Cancellations more than 30 days before departure receive a 90% refund less administration fees, 15–30 days 50%, 7–14 days 25%, and less than 7 days no refund. All cancellations must be in writing.",
      },
      {
        question: "What should I bring?",
        answer:
          "Comfortable walking shoes, a warm jacket, sunscreen, sunglasses and a camera. International visitors need a valid passport.",
      },
      {
        question: "Can the itinerary change?",
        answer:
          "Yes. The itinerary may be adjusted for weather, road conditions, wildlife sightings or other unforeseen circumstances, with guest safety as the priority.",
      },
    ],

    tags: [
      "Garden Route",
      "Route 62",
      "Oudtshoorn",
      "Ostrich Farm",
      "Cango Caves",
      "Knysna",
      "Safari",
      "Game Reserve",
      "Mossel Bay",
      "Zipline",
      "Multi-Day",
      "3 Day Tour",
      "Wildlife",
      "Family Friendly",
      "South Africa",
    ],
  },
  // 4-Day Cape Town Signature Explorer
  {
    id: null, // assign
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.MULTI_DAY,

    title: "4-Day Cape Town Signature Explorer",
    slug: "4-day-cape-town-signature-explorer",
    canonicalPath: "/tours/4-day-cape-town-signature-explorer",
    childFriendly: true, // family pricing offered (QUERY CLIENT: child age range; Day 4 includes wine tastings)
    daysInAdvance: 30,

    seo: {
      title:
        "4-Day Cape Town Signature Explorer Private Tour | Cape Frontier Tours",
      description:
        "4 days of private touring from Cape Town: city culture, Cape Point, penguins, a marine wildlife cruise, Two Oceans Aquarium and Stellenbosch wine.",
      keywords: [
        "4 day Cape Town tour",
        "Cape Town signature tour",
        "Cape Town multi-day tour",
        "Cape Town private tour",
        "Cape Peninsula tour",
        "Cape Point and Boulders Beach tour",
        "Table Mountain tour",
        "Bo-Kaap tour",
        "Two Oceans Aquarium tour",
        "Stellenbosch wine tasting tour",
        "Cape Town cheese and chocolate tour",
        "Cape Town family tour",
      ],
    },

    workflow: defaultWorkflow,

    image:
      "/src/assets/images/tours/packages/4-day-cape-town-signature-explorer/1.webp", // TODO
    images: getTourImages("packages/4-day-cape-town-signature-explorer", 5),
    imageFolder: "packages/4-day-cape-town-signature-explorer",
    videos: [],

    location:
      "Cape Town, Cape Peninsula, V&A Waterfront & Stellenbosch, Western Cape, South Africa",
    duration: "4 Days",

    priceBase: 12995,
    minPeople: 2,

    pricing: [
      {
        category: "Adult",
        pricePerPerson: 12995,
        note: "Per person sharing a vehicle (minimum 2 guests). Private exclusive experience: R25,990 per couple.",
      },

      // DERIVED from the family totals (total minus 2 x R12,995, divided by number of
      // children). The same figure comes out for 1, 2 and 3 children.
      // QUERY CLIENT: confirm the child rate and the age range it covers.
      {
        category: "Child (age range to be confirmed)",
        pricePerPerson: 10495,
        note: "Child rate when travelling with 2 adults.",
      },

      // QUERY CLIENT: left out on purpose (no rate supplied; null would render "R0.00" or "RNaN")
      // { category: "Solo Traveller", pricePerPerson: ???, note: "" },
    ],

    /*
     * FAMILY TOTALS (supplied by client, per family, ZAR):
     *   2 Adults + 1 Child    R36,485
     *   2 Adults + 2 Children R46,980
     *   2 Adults + 3 Children R57,475
     * The current schema has no field for fixed family totals, so these are stored in
     * the child rate above and in the FAQs / needToKnow.
     */

    additionalPricing: [
      {
        type: "request",
        category: "Group rates",
        price: null,
        unit: "per booking",
        currency: "ZAR",
        note: "Group rates available on request.",
      },
    ],

    groupPricing: {
      enabled: false, // group rates are "on request", no tiers supplied
      icon: "/icons/savemore.png",
      tiers: [],
    },

    rating: null,
    stars: null,
    mainReviewerName: "",
    mainReviewerCountry: "",
    reviewYear: null,
    otherReviews: null,
    mainReview: "",

    description:
      "Discover the very best of Cape Town in four unforgettable days, from the heart of the Mother City to the tip of Cape Point, from the ocean's depths to the endless vineyards of the Cape Winelands. This immersive private experience blends culture, heritage, breathtaking scenery, marine wildlife and world-class wines. Explore the colourful streets of Bo-Kaap and the historic Castle of Good Hope, ride the Table Mountain Cableway, drive the dramatic Cape Peninsula to Cape Point, meet the African penguins at Boulders Beach, set out on a marine wildlife excursion, visit the Two Oceans Aquarium, then finish in Stellenbosch with wine tasting, a cheese pairing and a hands-on chocolate-making workshop. Travel in comfort with a dedicated driver-guide and private air-conditioned transport, with daily hotel collection and return.",

    highlights: [
      { text: "Table Mountain Cableway experience" },
      { text: "Cape Town City & Cultural Discovery Tour" },
      { text: "Bo-Kaap exploration" },
      { text: "Castle of Good Hope visit" },
      { text: "Signal Hill and city viewpoints" },
      { text: "V&A Waterfront experience" },
      { text: "Chapman's Peak scenic drive" },
      { text: "Cape Point Nature Reserve" },
      { text: "Boulders Beach African penguin colony" },
      { text: "Simon's Town and the False Bay coastline" },
      { text: "Marine wildlife boat excursion" },
      { text: "Two Oceans Aquarium visit" },
      { text: "Stellenbosch wine region" },
      { text: "Wine tasting experience" },
      { text: "Cheese and wine pairing" },
      { text: "Hands-on chocolate-making workshop" },
      { text: "Scenic coastal and mountain drives" },
    ],

    included: [
      { text: "Private air-conditioned transportation daily for 4 days" },
      { text: "Professional driver-guide" },
      { text: "Daily hotel collection and return transfers" },
      { text: "Table Mountain Cableway return ticket" },
      { text: "Castle of Good Hope admission" },
      { text: "Cape Point Nature Reserve admission" },
      { text: "Boulders Beach penguin colony admission" },
      { text: "Marine wildlife boat excursion" },
      { text: "Two Oceans Aquarium admission" },
      { text: "Stellenbosch wine tasting" },
      { text: "Cheese and wine pairing" },
      { text: "Chocolate-making workshop" },
      { text: "Four lunches (one per touring day)" },
      { text: "Complimentary bottled water daily" },
      { text: "Fuel and road-related costs" },
      { text: "Tour coordination and reservations" },
      { text: "Scenic and photographic stops" },
    ],

    excluded: [
      { text: "Accommodation" },
      { text: "Flights" },
      { text: "Travel insurance" },
      { text: "Visa fees (if applicable)" },
      { text: "Personal expenses" },
      { text: "Gratuities and tips" },
      { text: "Additional meals not specified" },
      { text: "Additional beverages" },
      { text: "Optional activities not listed" },
      { text: "Premium wine purchases" },
      { text: "Souvenirs and personal shopping" },
      { text: "Items of a personal nature" },
    ],

    pickupOptions: ["Cape Town hotel or accommodation (agreed in advance)"], // QUERY CLIENT: pickup areas, if limited
    requirements: [], // QUERY CLIENT: wine-tasting age requirement, child age limits

    arrangements: {
      availability: "", // QUERY CLIENT: fixed dates or on request?
      duration: "4 Days",
      operatingTime: "Daily collection between 08:00 and 08:30",
      departure: "Daily collection from your Cape Town hotel or accommodation",
      return: "Daily return to your Cape Town hotel or accommodation",
      location:
        "Cape Town City Centre → Cape Peninsula → V&A Waterfront & Table Bay → Stellenbosch",

      clothing: [],
      thingsToBring: [],

      passengerPolicy: "",

      notes: [
        "Day 1: collection 08:30, return 17:00",
        "Day 2: collection 08:00, return 18:00",
        "Day 3: collection 08:30, return 16:30",
        "Day 4: collection 08:30, return 17:30",
        "Chapman's Peak Drive can occasionally close because of weather or maintenance; an alternative route is used",
        "A land-based alternative can be arranged if the marine excursion is affected by weather",
        "The chocolate-making workshop is pre-arranged; the chocolate and wine pairing is offered where available",
        "Accommodation is not included; guests stay at their own hotel or accommodation",
      ],
    },

    weatherPolicy: {
      summary:
        "Marine wildlife excursions, Table Mountain Cableway operations and certain outdoor activities are weather dependent. Where possible, suitable alternatives or itinerary adjustments will be offered.",
      items: [
        {
          text: "Marine wildlife excursions depend on sea conditions, weather and operator availability",
        },
        {
          text: "Wildlife sightings during marine excursions cannot be guaranteed",
        },
        {
          text: "A land-based alternative can be arranged if the boat excursion is affected by weather",
        },
        { text: "Table Mountain Cableway operations are weather dependent" },
        {
          text: "Chapman's Peak Drive can close because of weather or maintenance, in which case an alternative route is used",
        },
      ],
    },

    cancellationPolicy: {
      summary:
        "A 30% non-refundable deposit is required to confirm your booking. Cancellation fees increase as the travel date approaches.",
      items: [
        { text: "More than 30 days before travel: deposit forfeited" },
        { text: "15–30 days before travel: 50% cancellation fee applies" },
        {
          text: "14 days or less before travel: 100% cancellation fee applies",
        },
        {
          text: "No-shows, late arrivals, unused services and early departures are non-refundable",
        },
        {
          text: "Certain third-party suppliers may have separate cancellation policies, which will be communicated where applicable",
        },
      ],
    },

    safetyPolicy: null, // not supplied

    /*
     * MULTI-DAY ITINERARY
     */
    itinerary: {
      intro: {
        title: "Your 4-Day Cape Town Signature Journey",
        description:
          "Four themed days: city and heritage, the Cape Peninsula, marine life and ocean discovery, then the Stellenbosch winelands, all with daily hotel collection and return.",
      },

      route: {
        title:
          "Cape Town City → Cape Peninsula → V&A Waterfront → Stellenbosch",
        description: "",
      },

      days: [
        {
          day: 1,
          title: "Cape Town City, Culture & Heritage",
          route:
            "Hotel → Bo-Kaap → Signal Hill → Company's Garden → City Centre → Castle of Good Hope → Table Mountain → V&A Waterfront → Hotel",
          description:
            "Discover the history, culture and iconic landmarks of Cape Town: Bo-Kaap, Signal Hill, Company's Garden, the Castle of Good Hope, Table Mountain and the V&A Waterfront. Suggested duration 08:30–17:00.",

          activities: [
            {
              id: "d1-pickup",
              title: "Hotel Collection",
              description:
                "Collection from your Cape Town hotel with a welcome briefing and bottled water.",
              time: "08:30",
              duration: "30 min",
              type: "transfer",
              optional: false,
              image: "",
            },
            {
              id: "d1-bokaap",
              title: "Bo-Kaap",
              description:
                "Explore the colourful houses, cobbled streets, Cape Malay heritage and historical significance of this neighbourhood.",
              time: "09:00",
              duration: "45 min",
              type: "culture",
              optional: false,
              image: "",
            },
            {
              id: "d1-signal-hill",
              title: "Signal Hill",
              description:
                "A scenic drive and photo opportunity overlooking Cape Town, Table Bay and the Atlantic Ocean.",
              time: "09:45",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d1-companys-garden",
              title: "Company's Garden",
              description:
                "Explore this historic garden in the heart of Cape Town, surrounded by important heritage buildings.",
              time: "10:15",
              duration: "45 min",
              type: "heritage",
              optional: false,
              image: "",
            },
            {
              id: "d1-museum",
              title: "South African Museum / City Centre",
              description:
                "Discover Cape Town's historical and cultural landmarks.",
              time: "11:00",
              duration: "45 min",
              type: "heritage",
              optional: false,
              image: "",
            },
            {
              id: "d1-castle",
              title: "Castle of Good Hope",
              description:
                "Explore one of South Africa's most significant historical landmarks.",
              time: "11:45",
              duration: "45 min",
              type: "heritage",
              optional: false,
              image: "",
            },
            {
              id: "d1-lunch",
              title: "Lunch Break",
              description: "Lunch at a selected restaurant in the city centre.",
              time: "12:30",
              duration: "1 hour",
              type: "food",
              optional: false,
              image: "",
            },
            {
              id: "d1-table-mountain",
              title: "Table Mountain",
              description:
                "Travel to the Table Mountain Aerial Cableway station and ride the cableway to the summit, weather permitting.",
              time: "13:30",
              duration: "1 hr 15 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d1-scenic-drive",
              title: "Scenic Drive",
              description:
                "Views of the Atlantic Seaboard and the surrounding coastline.",
              time: "14:45",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d1-waterfront",
              title: "V&A Waterfront",
              description:
                "Explore the harbour, shopping areas, waterfront attractions and historical surroundings.",
              time: "15:15",
              duration: "1 hr 15 min",
              type: "leisure",
              optional: false,
              image: "",
            },
            {
              id: "d1-return",
              title: "Return to Hotel",
              description: "Transfer back to your hotel.",
              time: "16:30",
              duration: "30 min",
              type: "transfer",
              optional: false,
              image: "",
            },
          ],

          meals: { breakfast: false, lunch: true, dinner: false },
          images: [],
        },

        {
          day: 2,
          title: "Cape Peninsula Coastal Discovery",
          route:
            "Hotel → Camps Bay → Hout Bay → Chapman's Peak → Noordhoek → Cape Point → Simon's Town → Boulders Beach → Kalk Bay → Muizenberg → Hotel",
          description:
            "Explore spectacular coastal landscapes, natural wonders and marine wildlife along the Atlantic Seaboard and False Bay, from Chapman's Peak and Cape Point to the penguins at Boulders Beach. Suggested duration 08:00–18:00.",

          activities: [
            {
              id: "d2-pickup",
              title: "Hotel Collection",
              description:
                "Collection from your hotel with bottled water and a tour briefing.",
              time: "08:00",
              duration: "30 min",
              type: "transfer",
              optional: false,
              image: "",
            },
            {
              id: "d2-camps-bay",
              title: "Camps Bay",
              description:
                "A scenic coastal drive with views of the Twelve Apostles mountain range.",
              time: "08:30",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-hout-bay",
              title: "Hout Bay",
              description:
                "Visit the picturesque fishing harbour and enjoy the coastal scenery.",
              time: "09:00",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-chapmans-peak",
              title: "Chapman's Peak Drive",
              description:
                "Travel one of the most spectacular coastal roads in the Western Cape, with photo stops where permitted. An alternative route is used if the road is closed.",
              time: "09:30",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-noordhoek",
              title: "Noordhoek",
              description:
                "Views of the beach, mountain landscape and surrounding coastline.",
              time: "10:00",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-scenic-drive",
              title: "Scenic Drive",
              description:
                "Continue towards Cape Point through the southern peninsula.",
              time: "10:30",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-cape-point",
              title: "Cape Point Nature Reserve",
              description:
                "Explore the natural surroundings, visit the lighthouse viewpoint and enjoy the spectacular coastal scenery.",
              time: "11:00",
              duration: "1 hr 30 min",
              type: "nature",
              optional: false,
              image: "",
            },
            {
              id: "d2-lunch",
              title: "Lunch Break",
              description:
                "Lunch at Cape Point or a selected restaurant in the Simon's Town area.",
              time: "12:30",
              duration: "1 hour",
              type: "food",
              optional: false,
              image: "",
            },
            {
              id: "d2-boulders",
              title: "Boulders Beach",
              description:
                "Visit the famous African penguin colony and watch the penguins from the designated viewing areas.",
              time: "13:30",
              duration: "1 hour",
              type: "wildlife",
              optional: false,
              image: "",
            },
            {
              id: "d2-simons-town",
              title: "Simon's Town",
              description:
                "Explore this historic naval town and enjoy the coastal atmosphere.",
              time: "14:30",
              duration: "30 min",
              type: "heritage",
              optional: false,
              image: "",
            },
            {
              id: "d2-kalk-bay",
              title: "Kalk Bay",
              description:
                "A scenic coastal stop with fishing harbour views and photo opportunities.",
              time: "15:00",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-muizenberg",
              title: "Muizenberg",
              description:
                "See the famous colourful beach huts and the False Bay coastline.",
              time: "15:30",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-return",
              title: "Return to Cape Town",
              description:
                "Travel back to your hotel, allowing for traffic and comfort stops.",
              time: "16:00",
              duration: "2 hours",
              type: "transfer",
              optional: false,
              image: "",
            },
          ],

          meals: { breakfast: false, lunch: true, dinner: false },
          images: [],
        },

        {
          day: 3,
          title: "Eco-Marine & Ocean Discovery",
          route:
            "Hotel → V&A Waterfront → Table Bay boat excursion → Two Oceans Aquarium → Green Point / Sea Point → Hotel",
          description:
            "Discover the marine life, ocean ecosystems and coastal biodiversity of Cape Town, with a guided boat excursion and a visit to the Two Oceans Aquarium. Suggested duration 08:30–16:30.",

          activities: [
            {
              id: "d3-pickup",
              title: "Hotel Collection",
              description:
                "Collection from your hotel with bottled water and an introduction to the day's marine and ecological experiences.",
              time: "08:30",
              duration: "30 min",
              type: "transfer",
              optional: false,
              image: "",
            },
            {
              id: "d3-waterfront",
              title: "V&A Waterfront",
              description:
                "Arrive at the harbour and prepare for the scheduled marine excursion.",
              time: "09:00",
              duration: "30 min",
              type: "leisure",
              optional: false,
              image: "",
            },
            {
              id: "d3-boat",
              title: "Ocean Wildlife Excursion",
              description:
                "A guided boat experience exploring Cape Town's marine environment. Depending on conditions, you may see Cape fur seals, seabirds and other marine wildlife. Sightings cannot be guaranteed.",
              time: "09:30",
              duration: "1 hr 30 min",
              type: "wildlife",
              optional: false,
              image: "",
            },
            {
              id: "d3-harbour",
              title: "Harbour Experience",
              description:
                "Return to the harbour and enjoy the surrounding waterfront scenery.",
              time: "11:00",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d3-aquarium",
              title: "Two Oceans Aquarium",
              description:
                "Discover marine biodiversity, underwater ecosystems, conservation initiatives and fascinating marine species.",
              time: "11:30",
              duration: "1 hr 15 min",
              type: "wildlife",
              optional: false,
              image: "",
            },
            {
              id: "d3-lunch",
              title: "Lunch Break",
              description:
                "Lunch at a selected restaurant at the V&A Waterfront.",
              time: "12:45",
              duration: "1 hour",
              type: "food",
              optional: false,
              image: "",
            },
            {
              id: "d3-education",
              title: "Marine & Coastal Education",
              description:
                "A guided educational session on marine conservation, ocean pollution, coastal ecosystems and responsible tourism.",
              time: "13:45",
              duration: "1 hour",
              type: "nature",
              optional: false,
              image: "",
            },
            {
              id: "d3-green-point",
              title: "Green Point / Sea Point",
              description: "A scenic coastal drive with selected photo stops.",
              time: "14:45",
              duration: "45 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d3-coastal",
              title: "Coastal Exploration",
              description:
                "Explore selected coastal viewpoints, depending on weather and available time.",
              time: "15:30",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d3-return",
              title: "Return to Hotel",
              description: "Transfer back to your hotel.",
              time: "16:00",
              duration: "30 min",
              type: "transfer",
              optional: false,
              image: "",
            },
          ],

          meals: { breakfast: false, lunch: true, dinner: false },
          images: [],
        },

        {
          day: 4,
          title: "Stellenbosch Winelands, Cheese & Chocolate",
          route: "Hotel → Stellenbosch → Wine estates → Hotel",
          description:
            "Indulge in the flavours, heritage and culinary delights of the Cape Winelands: Stellenbosch town, a wine tasting, a cheese and wine pairing, and a hands-on chocolate-making workshop. Suggested duration 08:30–17:30.",

          activities: [
            {
              id: "d4-pickup",
              title: "Hotel Collection",
              description:
                "Collection from your hotel with a welcome briefing and bottled water.",
              time: "08:30",
              duration: "30 min",
              type: "transfer",
              optional: false,
              image: "",
            },
            {
              id: "d4-travel",
              title: "Travel to Stellenbosch",
              description: "A scenic journey towards the Cape Winelands.",
              time: "09:00",
              duration: "1 hour",
              type: "transfer",
              optional: false,
              image: "",
            },
            {
              id: "d4-town",
              title: "Stellenbosch Town",
              description:
                "Explore the historic town, its Cape Dutch architecture, oak-lined streets and cultural heritage.",
              time: "10:00",
              duration: "1 hour",
              type: "heritage",
              optional: false,
              image: "",
            },
            {
              id: "d4-wine-tasting",
              title: "Wine Estate 1: Wine Tasting",
              description:
                "A guided introduction to South African wines and the wine-making process.",
              time: "11:00",
              duration: "1 hour",
              type: "wine",
              optional: false,
              image: "",
            },
            {
              id: "d4-cheese-pairing",
              title: "Cheese & Wine Pairing",
              description:
                "A curated pairing of wine with locally produced cheeses.",
              time: "12:00",
              duration: "1 hour",
              type: "wine",
              optional: false,
              image: "",
            },
            {
              id: "d4-lunch",
              title: "Lunch Break",
              description: "Lunch at a selected wine estate or restaurant.",
              time: "13:00",
              duration: "1 hour",
              type: "food",
              optional: false,
              image: "",
            },
            {
              id: "d4-chocolate",
              title: "Chocolate-Making Experience",
              description:
                "A pre-arranged, hands-on chocolate-making workshop covering preparation, ingredients and techniques.",
              time: "14:00",
              duration: "1 hr 15 min",
              type: "food",
              optional: false,
              image: "",
            },
            {
              id: "d4-chocolate-wine",
              title: "Chocolate & Wine Experience",
              description:
                "A guided chocolate and wine pairing, where available.",
              time: "15:15",
              duration: "45 min",
              type: "wine",
              optional: false,
              image: "",
            },
            {
              id: "d4-estate",
              title: "Wine Estate Exploration",
              description:
                "Enjoy the vineyard scenery, take photos and browse the estate's wine shop.",
              time: "16:00",
              duration: "30 min",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d4-return",
              title: "Return to Cape Town",
              description: "Travel back to your hotel.",
              time: "16:30",
              duration: "1 hour",
              type: "transfer",
              optional: false,
              image: "",
            },
          ],

          meals: { breakfast: false, lunch: true, dinner: false },
          images: [],
        },
      ],
    },

    stops: null,

    vehicle: null,

    securityAndLiability: null,

    accommodation: {
      included: false,
      type: "",
      description:
        "Accommodation is not included. Guests stay at their own hotel or accommodation in Cape Town and are collected daily.",
    },

    needToKnow: [
      {
        text: "From R12,995 per person sharing a vehicle (minimum 2 guests), or R25,990 per couple for a private exclusive experience",
      },
      {
        text: "Family totals: R36,485 (2 adults + 1 child), R46,980 (2 adults + 2 children) and R57,475 (2 adults + 3 children)",
      },
      { text: "Group rates are available on request" },
      {
        text: "Accommodation is not included; guests are collected daily from their Cape Town hotel or accommodation",
      },
      {
        text: "Four lunches (one per touring day) are included; other meals and drinks are not",
      },
      {
        text: "Daily collection times: 08:30 (Day 1), 08:00 (Day 2), 08:30 (Day 3) and 08:30 (Day 4), with returns at 17:00, 18:00, 16:30 and 17:30",
      },
      {
        text: "A 30% non-refundable deposit confirms your booking; the balance is due 14 days before arrival",
      },
      {
        text: "Bookings made within 14 days of travel require full payment at confirmation",
      },
      { text: "Payment can be made by EFT or approved payment methods" },
      {
        text: "Marine excursions, the Table Mountain Cableway and some outdoor activities depend on the weather",
      },
      {
        text: "Marine wildlife sightings cannot be guaranteed; a land-based alternative can be arranged",
      },
      {
        text: "Chapman's Peak Drive can close because of weather or maintenance, in which case an alternative route is used",
      },
    ],

    faqs: [
      {
        question: "How long is the tour?",
        answer:
          "This is a 4-day private touring experience, with a full day of touring each day and daily hotel collection and return.",
      },
      {
        question: "What does each day cover?",
        answer:
          "Day 1 is Cape Town city, culture and heritage. Day 2 is the Cape Peninsula, including Cape Point and Boulders Beach. Day 3 is marine life and ocean discovery, with a boat excursion and the Two Oceans Aquarium. Day 4 is the Stellenbosch winelands with wine tasting, a cheese pairing and a chocolate-making workshop.",
      },
      {
        question: "What is included in the tour price?",
        answer:
          "Private air-conditioned transport with a professional driver-guide, daily hotel collection and return, fuel, bottled water, the Table Mountain Cableway ticket, admission to the Castle of Good Hope, Cape Point Nature Reserve, Boulders Beach and the Two Oceans Aquarium, the marine wildlife boat excursion, a wine tasting, a cheese and wine pairing, the chocolate-making workshop and four lunches.",
      },
      {
        question: "What is not included?",
        answer:
          "Accommodation, flights, travel insurance, visa fees, personal expenses, gratuities, additional meals and drinks, optional activities not listed, premium wine purchases and souvenirs.",
      },
      {
        question: "Is accommodation included?",
        answer:
          "No. You stay at your own Cape Town hotel or accommodation, and you are collected there each morning and returned each afternoon.",
      },
      {
        question: "How much does it cost?",
        answer:
          "From R12,995 per person sharing a vehicle (minimum 2 guests), or R25,990 per couple for a private exclusive experience. Group rates are available on request.",
      },
      {
        question: "Are there family rates?",
        answer:
          "Yes. For 2 adults: R36,485 with 1 child, R46,980 with 2 children and R57,475 with 3 children.",
      },
      {
        question: "Is lunch included?",
        answer:
          "Yes. One lunch is included on each of the four touring days. Additional meals and drinks are not included.",
      },
      {
        question: "What happens if the weather is bad?",
        answer:
          "The marine excursion, the Table Mountain Cableway and some outdoor activities depend on the weather. Where possible, we offer alternatives or adjust the itinerary, such as a land-based alternative to the boat trip or a different route if Chapman's Peak Drive is closed. Wildlife sightings cannot be guaranteed.",
      },
      {
        question: "How do I pay and what is the cancellation policy?",
        answer:
          "A 30% non-refundable deposit confirms your booking and the balance is due 14 days before arrival (bookings within 14 days require full payment). More than 30 days before travel the deposit is forfeited, 15–30 days before travel a 50% cancellation fee applies, and 14 days or less before travel a 100% fee applies. No-shows, late arrivals, unused services and early departures are non-refundable.",
      },
      {
        question: "Is this a private tour?",
        answer:
          "Yes. You travel with a dedicated driver-guide in a private air-conditioned vehicle.",
      },
    ],

    tags: [
      "Cape Town",
      "Multi-Day",
      "4 Day Tour",
      "Private Tour",
      "Cape Peninsula",
      "Cape Point",
      "Boulders Beach",
      "Table Mountain",
      "Bo-Kaap",
      "Two Oceans Aquarium",
      "Marine Wildlife",
      "Stellenbosch",
      "Wine Tasting",
      "Chocolate",
      "Family Friendly",
      "Culture",
      "Heritage",
      "South Africa",
    ],
  },
  // 4-Day Garden Route & Safari Explorer
  {
    id: null, // assign
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.MULTI_DAY,

    title: "4-Day Garden Route & Safari Explorer",
    slug: "4-day-garden-route-safari-explorer",
    canonicalPath: "/tours/4-day-garden-route-safari-explorer",
    childFriendly: true, // children aged 4–11 priced (QUERY CLIENT: other ages)
    daysInAdvance: 30,

    seo: {
      title:
        "4-Day Garden Route & Safari Explorer from Cape Town | Cape Frontier Tours",
      description:
        "4 days, 3 nights from Cape Town: Robertson wine tasting, Oudtshoorn ostrich farm and Cango Caves, Knysna, Tsitsikamma, Plettenberg Bay and a safari.",
      keywords: [
        "4 day Garden Route tour",
        "Garden Route and safari tour",
        "Cape Town to Garden Route tour",
        "Oudtshoorn ostrich farm tour",
        "Cango Caves tour",
        "Knysna Heads tour",
        "Tsitsikamma National Park tour",
        "Plettenberg Bay tour",
        "Mossel Bay safari tour",
        "Robertson wine tasting tour",
        "Cape Town multi-day tour",
        "Garden Route family tour",
      ],
    },

    workflow: defaultWorkflow,

    image:
      "/src/assets/images/tours/packages/4-day-garden-route-safari-explorer/1.webp", // TODO
    images: getTourImages("packages/4-day-garden-route-safari-explorer", 3),
    imageFolder: "packages/4-day-garden-route-safari-explorer",
    videos: [],

    location:
      "Oudtshoorn, Knysna, Tsitsikamma, Plettenberg Bay & Mossel Bay, Western Cape, South Africa",
    duration: "4 Days / 3 Nights",

    priceBase: 24000,
    minPeople: 2,
    minAge: 5,

    pricing: [
      {
        category: "Adult",
        pricePerPerson: 24000,
        note: "Per person, sharing a double or twin room.",
      },
      {
        category: "Child: 12–17 Years",
        pricePerPerson: 24000,
        note: "Same as adults.",
      },
      {
        category: "Child: 5–11 Years",
        pricePerPerson: 12000,
        note: "Child rate for guests aged 5–11 years.",
      },

      // QUERY CLIENT: left out on purpose (no rate supplied; null would render "R0.00" or "RNaN")
      // { category: "Solo Traveller", pricePerPerson: ???, note: "" },
    ],

    /*
     * PACKAGE TOTALS (supplied by client, ZAR):
     *   Couple (2 adults)               R48,000
     *   2 Adults + 1 Child (4–11)       R60,000
     *   2 Adults + 2 Children (4–11)    R72,000
     *   2 Adults + 3 Children (4–11)    R84,000
     *   4 Adults                        R96,000
     *   6 Adults                        R144,000
     *   8 Adults                        R192,000
     * All totals are simply R24,000 per adult and R12,000 per child, so they are covered
     * by the per-person rates above.
     */

    additionalPricing: [
      {
        type: "request",
        category: "Monkeyland entrance (optional)",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Optional. Entrance fee payable separately. Not part of the itinerary.", // QUERY CLIENT
      },
      {
        type: "request",
        category: "Birds of Eden entrance (optional)",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Optional. Entrance fee payable separately. Not part of the itinerary.", // QUERY CLIENT
      },
    ],

    /*
     * The source says "Discounted offers apply for 6 & 8 guests sharing at 10%", but the
     * totals it lists for 6 and 8 guests (R144,000 and R192,000) are undiscounted
     * (6 x R24,000 and 8 x R24,000). The tiers below assume 10% comes off on top
     * (R21,600 pp). QUERY CLIENT: confirm, then set enabled to true.
     */
    groupPricing: {
      enabled: false,
      icon: "/icons/savemore.png",
      tiers: [
        {
          minPeople: 6,
          maxPeople: 7,
          perPerson: 21600,
          label: "6–7 guests",
          note: "Adult rate with 10% group discount.",
        },
        {
          minPeople: 8,
          maxPeople: null,
          perPerson: 21600,
          label: "8+ guests",
          note: "Adult rate with 10% group discount.",
        },
      ],
    },

    rating: null,
    stars: null,
    mainReviewerName: "",
    mainReviewerCountry: "",
    reviewYear: null,
    otherReviews: null,
    mainReview: "",

    description:
      "Travel from Cape Town through the Cape Winelands and into the heart of the Klein Karoo, then along the Garden Route coastline on a private four-day journey. Enjoy a wine tasting in the Robertson Wine Valley, visit a working ostrich farm and the magnificent Cango Caves in Oudtshoorn, see the iconic Knysna Heads, explore the ancient forests and rugged coastline of Tsitsikamma National Park and the beaches of Plettenberg Bay, then finish with a safari game drive at a private game reserve near Mossel Bay before returning to Cape Town. Accommodation is in quality 3-star hotels and guesthouses, with hotel pick-up and drop-off.",

    highlights: [
      { text: "Wine tasting in the Robertson Wine Valley" },
      { text: "Oudtshoorn ostrich farm guided tour" },
      { text: "Cango Caves and their limestone formations" },
      { text: "Knysna Heads viewpoint and Knysna Waterfront" },
      { text: "Tsitsikamma National Park forests, cliffs and coastline" },
      { text: "Plettenberg Bay beaches" },
      { text: "Safari game drive at a private game reserve near Mossel Bay" },
      { text: "3 nights in quality 3-star hotels and guesthouses" },
      { text: "Hotel pick-up and drop-off" },
    ],

    included: [
      { text: "Return transport from Cape Town to the Garden Route and back" },
      { text: "Professional driver-guide throughout the tour" },
      { text: "Fuel and vehicle operating costs" },
      { text: "Luxury air-conditioned vehicle" },
      {
        text: "3 nights' accommodation in quality 3-star hotels and guesthouses",
      },
      { text: "Daily breakfast" },
      { text: "2 dinners and 1 lunch (as specified)" },
      { text: "Wine tasting experience in the Robertson Wine Valley" },
      { text: "Cango Caves entrance fee" },
      { text: "Ostrich farm guided tour and entrance fee" },
      { text: "Tsitsikamma National Park entrance fee" },
      { text: "Safari game drive at a private game reserve near Mossel Bay" },
      { text: "All attractions and entrance fees mentioned in the itinerary" },
      { text: "Hotel pick-up and drop-off" },
    ],

    excluded: [
      { text: "Lunches (unless specifically stated)" },
      { text: "Personal expenses" },
      { text: "Gratuities and tips" },
      { text: "Travel insurance" },
      { text: "Optional activities not listed in the itinerary" },
      { text: "Alcoholic beverages and additional drinks" },
      { text: "Items of a personal nature" },
      { text: "Monkeyland entrance fees (optional)" },
      { text: "Birds of Eden entrance fees (optional)" },
      { text: "Any meals not listed under inclusions" },
      { text: "Additional accommodation before or after the tour" },
      { text: "Items not specifically mentioned as included" },
    ],

    pickupOptions: ["Cape Town hotel pick-up and drop-off"], // QUERY CLIENT: pickup areas, if limited

    requirements: [
      {
        text: "Comfortable walking is required at Tsitsikamma National Park, Knysna Heads and the Cango Caves",
      },
    ],

    arrangements: {
      availability:
        "Subject to accommodation availability and seasonal rate fluctuations.", // QUERY CLIENT: fixed dates or on request?
      duration: "4 Days / 3 Nights",
      operatingTime: "",
      departure: "Cape Town hotel pick-up", // QUERY CLIENT: departure time
      return: "Cape Town hotel drop-off, Day 4",
      location:
        "Cape Town → Oudtshoorn → Knysna → Tsitsikamma & Plettenberg Bay → Mossel Bay → Cape Town",

      clothing: [
        "Comfortable clothing for daily touring",
        "Light fleece, jersey or windbreaker",
        "Comfortable walking or hiking shoes",
        "Lightweight waterproof jacket",
        "Neutral-coloured clothing (khaki, beige, green, brown) for the safari",
      ],

      thingsToBring: [
        "Hat, sunglasses and sunscreen",
        "Camera, phone and spare batteries",
        "Prescription medication and personal essentials",
        "Small backpack or day bag",
        "Reusable water bottle",
        "Swimming attire (optional, for beaches in Plettenberg Bay or Knysna)",
      ],

      passengerPolicy: "",

      notes: [
        "Night 1: 3-star guesthouse or hotel in Oudtshoorn (standard double or twin room, dinner and breakfast)",
        "Nights 2 and 3: Knysna Waterfront Lodge or a similar 3-star property (standard double or twin room, breakfast)",
        "All rooms are double or twin sharing with private en-suite facilities",
        "Day 4 has no accommodation; the tour concludes in Cape Town",
        "Final pricing is confirmed at the time of booking and is subject to accommodation availability and seasonal rate fluctuations",
        "Accommodation is subject to availability",
      ],
    },

    weatherPolicy: {
      summary:
        "Temperatures can vary between the coast, mountains and inland regions on the same day, and the weather can change unexpectedly, especially along the coast. Dress in layers.",
      items: [
        {
          text: "Mornings, evenings and mountain passes can be cool year-round",
        },
        {
          text: "Spring (Sep–Nov): light clothing with a warm layer for mornings and evenings",
        },
        {
          text: "Summer (Dec–Feb): lightweight clothing, hat, sunscreen and comfortable footwear",
        },
        {
          text: "Autumn (Mar–May): comfortable layered clothing and a light jacket",
        },
        {
          text: "Winter (Jun–Aug): warm jacket, jersey, long trousers and closed walking shoes",
        },
      ],
    },

    cancellationPolicy: {
      summary: "Refunds depend on how far ahead of departure you cancel.",
      items: [
        { text: "More than 14 days before departure: 100% refund" },
        { text: "7–13 days before departure: 50% refund" },
        { text: "Less than 7 days before departure: non-refundable" },
        { text: "No-show on departure day: non-refundable" },
      ],
    },

    safetyPolicy: null, // not supplied

    /*
     * MULTI-DAY ITINERARY
     */
    itinerary: {
      intro: {
        title: "Your 4-Day Garden Route & Safari Journey",
        description:
          "From the Cape Winelands and the Klein Karoo to Knysna, Tsitsikamma, Plettenberg Bay and a private game reserve near Mossel Bay.",
      },

      route: {
        title:
          "Cape Town → Oudtshoorn → Knysna → Tsitsikamma & Plettenberg Bay → Mossel Bay → Cape Town",
        description: "",
      },

      days: [
        {
          day: 1,
          title: "Cape Town → Oudtshoorn",
          route: "Cape Town → Cape Winelands → Robertson → Oudtshoorn",
          description:
            "Depart Cape Town and travel through the Cape Winelands into the heart of the Klein Karoo. Enjoy a wine tasting at a local vineyard en route, then arrive in Oudtshoorn, the ostrich capital of the world. Visit a working ostrich farm and the Cango Caves, then check in for a relaxing evening.",

          activities: [
            {
              id: "d1-depart",
              title: "Hotel Pick-up & Depart Cape Town",
              description:
                "Pick-up from your Cape Town hotel and a scenic drive through the Cape Winelands.",
              time: "",
              duration: "",
              type: "transfer",
              optional: false,
              image: "",
            },
            {
              id: "d1-wine-tasting",
              title: "Wine Tasting, Robertson Wine Valley",
              description:
                "A wine tasting experience at a local vineyard en route to Oudtshoorn.",
              time: "",
              duration: "",
              type: "wine",
              optional: false,
              image: "",
            },
            {
              id: "d1-ostrich",
              title: "Ostrich Farm, Oudtshoorn",
              description:
                "A guided visit to a working ostrich farm in the ostrich capital of the world.",
              time: "",
              duration: "",
              type: "wildlife",
              optional: false,
              image: "",
            },
            {
              id: "d1-cango",
              title: "Cango Caves",
              description:
                "Explore the magnificent caves, famous for their impressive limestone formations.",
              time: "",
              duration: "",
              type: "nature",
              optional: false,
              image: "",
            },
            {
              id: "d1-checkin",
              title: "Check in at your Oudtshoorn accommodation",
              description:
                "Check in and enjoy a relaxing evening. Dinner is included.",
              time: "",
              duration: "",
              type: "accommodation",
              optional: false,
              image: "",
            },
          ],

          meals: { breakfast: false, lunch: false, dinner: true },

          accommodation: {
            title: "3-Star Guesthouse / Hotel",
            location: "Oudtshoorn, Klein Karoo",
            availabilityNote: "Subject to availability.",
            options: [
              "Standard double or twin room",
              "Private en-suite",
              "Dinner & breakfast",
            ],
            image: "",
          },

          images: [],
        },

        {
          day: 2,
          title: "Oudtshoorn → Knysna",
          route: "Oudtshoorn → Garden Route coastline → Knysna",
          description:
            "After breakfast, journey across scenic mountain passes to the Garden Route coastline and the lagoon town of Knysna, surrounded by forests, waterways and coastal scenery. Visit the Knysna Heads, then explore the waterfront.",

          activities: [
            {
              id: "d2-passes",
              title: "Scenic Mountain Passes",
              description:
                "Leave Oudtshoorn and travel across scenic mountain passes towards the Garden Route coast.",
              time: "",
              duration: "",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-heads",
              title: "Knysna Heads",
              description:
                "Spectacular panoramic views from the iconic Knysna Heads.",
              time: "",
              duration: "",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-waterfront",
              title: "Knysna Waterfront",
              description:
                "Time to explore the lively waterfront with its restaurants, boutiques and attractions.",
              time: "",
              duration: "",
              type: "leisure",
              optional: false,
              image: "",
            },
          ],

          meals: { breakfast: true, lunch: false, dinner: false },

          accommodation: {
            title: "Knysna Waterfront Lodge (or similar 3-star property)",
            location: "Knysna, Garden Route",
            availabilityNote: "Subject to availability.",
            options: [
              "Standard double or twin room",
              "Private en-suite",
              "Breakfast",
            ],
            image: "",
          },

          images: [],
        },

        {
          day: 3,
          title: "Tsitsikamma National Park & Plettenberg Bay",
          route:
            "Knysna → Tsitsikamma National Park → Plettenberg Bay → Knysna",
          description:
            "Travel east along the Garden Route to Tsitsikamma National Park, known for its ancient indigenous forests, dramatic cliffs and rugged coastline. Continue to Plettenberg Bay, a seaside destination celebrated for its pristine beaches, then return to Knysna for another overnight stay.",

          activities: [
            {
              id: "d3-tsitsikamma",
              title: "Tsitsikamma National Park",
              description:
                "Explore ancient indigenous forests, dramatic cliffs and a rugged coastline.",
              time: "",
              duration: "",
              type: "nature",
              optional: false,
              image: "",
            },
            {
              id: "d3-plett",
              title: "Plettenberg Bay",
              description:
                "A popular seaside destination with pristine beaches and a relaxed atmosphere. Swimwear can be packed for free time at the beach.",
              time: "",
              duration: "",
              type: "beach",
              optional: false,
              image: "",
            },
            {
              id: "d3-return-knysna",
              title: "Return to Knysna",
              description: "Return to Knysna for a comfortable overnight stay.",
              time: "",
              duration: "",
              type: "transfer",
              optional: false,
              image: "",
            },
          ],

          meals: { breakfast: true, lunch: false, dinner: false },

          accommodation: {
            title: "Knysna Waterfront Lodge (or similar 3-star property)",
            location: "Knysna, Garden Route",
            availabilityNote: "Subject to availability.",
            options: [
              "Standard double or twin room",
              "Private en-suite",
              "Breakfast",
            ],
            image: "",
          },

          images: [],
        },

        {
          day: 4,
          title: "Mossel Bay Safari & Cape Town Return",
          route: "Knysna → Mossel Bay → Cape Town",
          description:
            "After check-out, travel west along the coast to Mossel Bay for a safari game drive at a private game reserve, then begin the scenic return journey to Cape Town.",

          activities: [
            {
              id: "d4-travel",
              title: "Travel to Mossel Bay",
              description:
                "Check out and travel west along the coast to Mossel Bay.",
              time: "",
              duration: "",
              type: "transfer",
              optional: false,
              image: "",
            },
            {
              id: "d4-safari",
              title: "Safari Game Drive",
              description:
                "A game drive at a private game reserve near Mossel Bay, where you may see a variety of African wildlife in a beautiful natural setting.",
              time: "",
              duration: "",
              type: "safari",
              optional: false,
              image: "",
            },
            {
              id: "d4-return",
              title: "Return to Cape Town",
              description:
                "The scenic return journey to Cape Town, with a last look at the Garden Route landscapes. Hotel drop-off.",
              time: "",
              duration: "",
              type: "transfer",
              optional: false,
              image: "",
            },
          ],

          meals: { breakfast: true, lunch: false, dinner: false },
          images: [],
        },
      ],
    },

    stops: null,

    vehicle: null,

    securityAndLiability: null,

    accommodation: {
      included: true,
      type: "3-Star Hotels & Guesthouses",
      description:
        "1 night in a 3-star guesthouse or hotel in Oudtshoorn and 2 nights at Knysna Waterfront Lodge (or similar 3-star property). Double or twin-sharing rooms with private en-suite facilities, subject to availability.",
    },

    needToKnow: [
      {
        text: "Adults are R24,000 per person and children aged 4–11 are R12,000 per person",
      },
      {
        text: "Package totals: R48,000 for a couple, R60,000 for 2 adults + 1 child, R72,000 for 2 adults + 2 children and R84,000 for 2 adults + 3 children",
      },
      {
        text: "Private group totals: R96,000 for 4 guests, R144,000 for 6 guests and R192,000 for 8 guests, with a 10% discount offered for groups of 6 and 8 sharing",
      },
      {
        text: "Final pricing is confirmed at booking and depends on accommodation availability and seasonal rates",
      },
      {
        text: "Daily breakfast, 2 dinners and 1 lunch (as specified) are included; other lunches and drinks are not",
      },
      {
        text: "Night 1 is in Oudtshoorn and nights 2 and 3 are at Knysna Waterfront Lodge (or similar); there is no accommodation on Day 4",
      },
      {
        text: "Monkeyland and Birds of Eden entrance fees are optional and not included",
      },
      {
        text: "Comfortable walking is required at Tsitsikamma National Park, Knysna Heads and the Cango Caves",
      },
      {
        text: "Dress in layers: temperatures vary between the coast, mountains and inland regions during the same day",
      },
      { text: "Neutral-coloured clothing is recommended for the safari" },
      {
        text: "Cancellations: 100% refund more than 14 days before departure, 50% refund 7–13 days before, and no refund less than 7 days before or for a no-show",
      },
    ],

    faqs: [
      {
        question: "How long is the tour?",
        answer:
          "This is a 4-day, 3-night tour departing from and returning to Cape Town, with hotel pick-up and drop-off.",
      },
      {
        question: "Where do we stay?",
        answer:
          "One night in a 3-star guesthouse or hotel in Oudtshoorn and two nights at Knysna Waterfront Lodge (or a similar 3-star property), in standard double or twin rooms with private en-suite facilities. There is no accommodation on Day 4.",
      },
      {
        question: "What is included in the tour price?",
        answer:
          "Return transport in a luxury air-conditioned vehicle with a professional driver-guide, fuel, 3 nights' accommodation, daily breakfast, 2 dinners and 1 lunch (as specified), the Robertson wine tasting, entrance fees for the Cango Caves, the ostrich farm and Tsitsikamma National Park, and a safari game drive near Mossel Bay.",
      },
      {
        question: "What is not included?",
        answer:
          "Other lunches and meals, drinks, personal expenses, gratuities, travel insurance, optional activities not in the itinerary (including Monkeyland and Birds of Eden entrance fees), and any additional accommodation before or after the tour.",
      },
      {
        question: "How much does the tour cost?",
        answer:
          "Adults are R24,000 per person and children aged 4–11 are R12,000. That makes R48,000 for a couple, and R60,000, R72,000 or R84,000 for 2 adults with 1, 2 or 3 children. Final pricing is confirmed at booking.",
      },
      {
        question: "Is there a group discount?",
        answer:
          "A 10% discount applies to groups of 6 and 8 guests sharing. Please contact us for a group quote.",
      },
      {
        question: "Is this tour suitable for children?",
        answer:
          "Yes. Children aged 4–11 are charged a child rate. Comfortable walking is needed at Tsitsikamma National Park, Knysna Heads and the Cango Caves.",
      },
      {
        question: "What is the cancellation policy?",
        answer:
          "You get a 100% refund if you cancel more than 14 days before departure, a 50% refund 7–13 days before, and no refund less than 7 days before departure or for a no-show on departure day.",
      },
      {
        question: "What should I pack?",
        answer:
          "Comfortable clothing, a warm layer, walking shoes, a lightweight waterproof jacket, a hat, sunglasses and sunscreen, a camera, any prescription medication and a small day backpack. Neutral-coloured clothing is best for the safari, and swimwear is optional for the beaches.",
      },
    ],

    tags: [
      "Garden Route",
      "Oudtshoorn",
      "Cango Caves",
      "Ostrich Farm",
      "Knysna",
      "Tsitsikamma",
      "Plettenberg Bay",
      "Mossel Bay",
      "Safari",
      "Wine Tasting",
      "Multi-Day",
      "4 Day Tour",
      "Family Friendly",
      "South Africa",
    ],
  },
  // 5-Day Garden Route & Gondwana Big 5 Safari Tour
  {
    id: null, // assign
    type: TOUR_TYPES.PACKAGES,
    category: TOUR_MODIFIERS.MULTI_DAY,

    title: "5-Day Garden Route & Gondwana Big 5 Safari Tour",
    slug: "5-day-garden-route-gondwana-big-5-safari",
    canonicalPath: "/tours/5-day-garden-route-gondwana-big-5-safari",
    // daysInAdvance: ???, // QUERY CLIENT (booking cut-off)

    seo: {
      title:
        "5-Day Garden Route & Gondwana Big 5 Safari Tour from Cape Town | Cape Frontier Tours",
      description:
        "5 days, 4 nights from Cape Town: Gondwana Big 5 safari, Route 62, Cango Caves, Knysna, Tsitsikamma, Hermanus whale coast and Betty's Bay penguins.",
      keywords: [
        "5 day Garden Route tour",
        "Gondwana Big 5 safari",
        "Gondwana Game Reserve tour",
        "Garden Route and safari tour",
        "Cape Town to Garden Route tour",
        "Route 62 tour",
        "Cango Caves tour",
        "Knysna Heads tour",
        "Storms River Suspension Bridge tour",
        "Hermanus whale watching tour",
        "Betty's Bay penguin colony tour",
        "Cape Town multi-day tour",
      ],
    },

    workflow: defaultWorkflow,

    image:
      "/src/assets/images/tours/packages/5-day-garden-route-gondwana-big-5-safari/1.webp", // TODO
    images: getTourImages("packages/5-day-garden-route-gondwana-big-5-safari", 5), 
    imageFolder: "packages/5-day-garden-route-gondwana-big-5-safari",
    videos: [],

    location:
      "Gondwana, Oudtshoorn, Knysna, Tsitsikamma, Hermanus & Betty's Bay, Western Cape, South Africa",
    duration: "5 Days / 4 Nights",

    priceBase: 46000, // total package price from the client; QUERY CLIENT: per person, per couple or per room?
    minPeople: 1, // QUERY CLIENT: source says solo travellers are welcome
    maxPeople: 1,
    childFriendly: true, // source says ideal for families (QUERY CLIENT: child rates and minimum age)

    pricing: [
      {
        category: "Standard package",
        pricePerPerson: 46000, // QUERY CLIENT: confirm what this covers (see note above)
        note: "Total package price. Includes 4 nights' accommodation, breakfast and the listed activities.",
      },

      // QUERY CLIENT: left out on purpose (no rate supplied; null would render "R0.00" or "RNaN")
      // { category: "Solo Traveller", pricePerPerson: ???, note: "" },
      // { category: "Children", pricePerPerson: ???, note: "" },
    ],

    additionalPricing: [
      {
        type: "request",
        category: "Cango Caves Adventure Tour upgrade",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Choose the Heritage Tour or the Adventure Tour. Any difference in price to be confirmed.", // QUERY CLIENT
      },
      {
        type: "request",
        category: "Ostrich Farm Experience (Oudtshoorn)",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Optional. Price on request.",
      },
      {
        type: "request",
        category:
          "Tsitsikamma adventure options (ziplining, kayak & lilo, forest hiking)",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Optional. Price on request.", // QUERY CLIENT: confirm these are extra
      },
      {
        type: "request",
        category: "Bloukrans Bungy Jump",
        price: null,
        unit: "per person",
        currency: "ZAR",
        note: "Optional. Not included. Price on request.",
      },
    ],

    groupPricing: {
      enabled: false, // QUERY CLIENT: turn on only if group discounts exist
      icon: "/icons/savemore.png",
      tiers: [],
    },

    rating: null,
    stars: null,
    mainReviewerName: "",
    mainReviewerCountry: "",
    reviewYear: null,
    otherReviews: null,
    mainReview: "",

    description:
      "A premium 5-day journey that combines a luxury Big 5 safari at Gondwana Game Reserve with the very best of the Garden Route. Enjoy mountain passes, forests, coastline, wine tasting and charming towns, all guided privately and comfortably. The tour begins with a luxury safari stay at Gondwana, followed by the scenic Route 62, the dramatic Cango Caves, the lagoon views of Knysna and adventure-rich Tsitsikamma National Park. The final day takes in Hermanus, Benguela Cove and the penguins of Betty's Bay before returning to Cape Town along the iconic Clarence Drive. With 4 nights of hand-selected accommodation, breakfast included and a dedicated driver-guide throughout, it is a complete Garden Route experience with the added value of a premium safari.",

    highlights: [
      { text: "Exclusive luxury Big 5 safari at Gondwana Game Reserve" },
      {
        text: "Route 62 scenic drive through mountain passes, orchards and Karoo landscapes",
      },
      { text: "Cango Caves guided tour (Heritage or Adventure)" },
      { text: "Outeniqua Pass, Knysna Heads and Knysna Waterfront" },
      {
        text: "Tsitsikamma National Park and the Storms River Suspension Bridge",
      },
      { text: "Hermanus whale coast (seasonal whale watching)" },
      { text: "Premium wine tasting at Benguela Cove Lagoon Wine Estate" },
      { text: "African penguins at Stony Point, Betty's Bay" },
      {
        text: "Clarence Drive (R44), one of South Africa's most scenic coastal roads",
      },
      {
        text: "4 nights in hand-selected guesthouses and lodges, breakfast included",
      },
      { text: "Dedicated private driver-guide throughout" },
    ],

    included: [
      {
        text: "4 nights' accommodation: Gondwana Game Reserve, De Zeekoe Guest Farm, Waterfront Lodge (Knysna) and At the Woods Guest House (Tsitsikamma)",
      },
      { text: "Gondwana conservation levy" },
      { text: "Breakfast included with accommodation" },
      { text: "Dedicated driver-guide throughout" },
      { text: "Mossel Bay zipline" }, // QUERY CLIENT: not in the itinerary text
      { text: "Cango Caves guided tour" },
      { text: "Lagoon cruise" }, // QUERY CLIENT: itinerary calls lagoon cruises optional
      { text: "Cheese and wine pairing" }, // QUERY CLIENT: not in the itinerary text
      { text: "Stony Point African penguin colony, Betty's Bay" },
      { text: "Tsitsikamma National Park entry" },
      { text: "Storms River Suspension Bridge" },
      { text: "Elephant Park" }, // QUERY CLIENT: not in the itinerary text
      { text: "Jukani Wildlife Sanctuary" }, // QUERY CLIENT: not in the itinerary text
    ],

    excluded: [
      { text: "Bloukrans Bungy Jump" },
      { text: "Lunches and selected dinners" },
      { text: "Travel insurance" },
      { text: "Personal expenses" },
      { text: "Alcoholic beverages" },
      { text: "Gratuities" },
    ],

    pickupOptions: [], // QUERY CLIENT: pickup points, if offered
    requirements: [],

    arrangements: {
      availability: "", // QUERY CLIENT: fixed dates or on request?
      duration: "5 Days / 4 Nights",
      operatingTime: "",
      departure: "Cape Town", // QUERY CLIENT: departure time and pickup
      return: "Cape Town, late afternoon of Day 5",
      location:
        "Cape Town → Gondwana → Oudtshoorn → Knysna → Tsitsikamma → Hermanus → Cape Town",

      clothing: [],
      thingsToBring: [],

      passengerPolicy: "",

      notes: [
        "Accommodation: 1 room available, the luxury Kwena room at Gondwana (as quoted by Gondwana Game Reserve)", // QUERY CLIENT
        "Night 1: Gondwana Game Reserve",
        "Night 2: De Zeekoe Guest Farm, Oudtshoorn",
        "Night 3: Waterfront Lodge, Knysna",
        "Night 4: Tsitsikamma: At the Woods Guest House (also listed: Tsitsikamma Village Inn and Tsitsikamma Manor)",
        "There is no overnight on Day 5; the tour ends in Cape Town",
        "Whale watching at Hermanus is seasonal",
        "Ideal for families, couples, solo travellers and small groups",
      ],
    },

    // null until supplied (empty objects are truthy and would
    // render empty sections in TourDetails)
    weatherPolicy: null,
    cancellationPolicy: null,
    safetyPolicy: null,

    /*
     * MULTI-DAY ITINERARY
     */
    itinerary: {
      intro: {
        title: "Your 5-Day Garden Route & Big 5 Safari Journey",
        description:
          "A luxury Big 5 safari, Route 62, Knysna, Tsitsikamma and the Hermanus whale coast, ending with the penguins of Betty's Bay and Clarence Drive.",
      },

      route: {
        title:
          "Cape Town → Gondwana → Oudtshoorn → Knysna → Tsitsikamma → Hermanus → Cape Town",
        description: "",
      },

      days: [
        {
          day: 1,
          title: "Cape Town → Gondwana Game Reserve",
          route: "Cape Town → Gondwana Game Reserve",
          description:
            "Your tour begins with an exclusive luxury Big 5 safari at Gondwana Game Reserve, one of the Garden Route's premier Big 5 destinations, followed by a night in a luxury lodge with panoramic views, private suites and exceptional hospitality.",

          activities: [
            {
              id: "d1-depart",
              title: "Depart Cape Town",
              description:
                "Travel along the Garden Route to Gondwana Game Reserve.",
              time: "",
              duration: "",
              type: "transfer",
              optional: false,
              image: "",
            },
            {
              id: "d1-zipline",
              title: "Mossel Bay Zipline",
              description:
                "Included in your quote, though the source does not say when it takes place. Placed here as the stop closest to the route.", // QUERY CLIENT: confirm the day
              time: "",
              duration: "",
              type: "adventure",
              optional: false,
              image: "",
            },
            {
              id: "d1-safari",
              title: "Exclusive Big 5 Safari",
              description:
                "A luxury safari at Gondwana Game Reserve. Expect sightings of lion, elephant, rhino, buffalo, giraffe, zebra and more.",
              time: "",
              duration: "",
              type: "safari",
              optional: false,
              image: "",
            },
            {
              id: "d1-lodge",
              title: "Luxury Lodge Stay",
              description:
                "Panoramic views, private suites and exceptional hospitality.",
              time: "",
              duration: "",
              type: "accommodation",
              optional: false,
              image: "",
            },
          ],

          // QUERY CLIENT: Day 1 meals not stated
          meals: { breakfast: false, lunch: false, dinner: false },

          accommodation: {
            title: "Gondwana Game Reserve",
            location: "Garden Route, Western Cape",
            availabilityNote:
              "As quoted by Gondwana: 1 room available, the luxury Kwena room. Conservation levy included.",
            options: ["Luxury Kwena room", "Panoramic views", "Private suites"],
            image: "",
          },

          images: [],
        },

        {
          day: 2,
          title: "Gondwana → Oudtshoorn (Route 62 & Cango Caves)",
          route: "Gondwana → Route 62 → Oudtshoorn",
          description:
            "After breakfast, travel inland along Route 62 through mountain passes, orchards and Karoo landscapes. Take a guided tour of the Cango Caves, with the choice of the Heritage Tour or the Adventure Tour, and overnight in Oudtshoorn.",

          activities: [
            {
              id: "d2-route62",
              title: "Route 62 Scenic Drive",
              description:
                "Travel inland through mountain passes, orchards and Karoo landscapes.",
              time: "",
              duration: "",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d2-cango",
              title: "Cango Caves: Guided Tour",
              description:
                "Choose between the Heritage Tour and the Adventure Tour.",
              time: "",
              duration: "",
              type: "nature",
              optional: false,
              image: "",
            },
            {
              id: "d2-ostrich",
              title: "Ostrich Farm Experience",
              description: "An optional ostrich farm experience.",
              time: "",
              duration: "",
              type: "wildlife",
              optional: true,
              image: "",
            },
          ],

          meals: { breakfast: true, lunch: false, dinner: false },

          accommodation: {
            title: "De Zeekoe Guest Farm",
            location: "Oudtshoorn, Klein Karoo",
            availabilityNote: "",
            options: ["Breakfast included"],
            image: "",
          },

          images: [],
        },

        {
          day: 3,
          title: "Oudtshoorn → Knysna (Lagoon & Heads)",
          route: "Oudtshoorn → Outeniqua Pass → Knysna",
          description:
            "After breakfast, take the scenic Outeniqua Pass into the Garden Route forests. Enjoy the panoramic views from the Knysna Heads viewpoint and explore the Knysna Waterfront.",

          activities: [
            {
              id: "d3-outeniqua",
              title: "Outeniqua Pass",
              description:
                "A scenic mountain drive into the Garden Route forests.",
              time: "",
              duration: "",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d3-heads",
              title: "Knysna Heads Viewpoint",
              description:
                "Panoramic views over the lagoon and the Indian Ocean.",
              time: "",
              duration: "",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d3-waterfront",
              title: "Knysna Waterfront",
              description: "Shops and cafés on the lagoon waterfront.",
              time: "",
              duration: "",
              type: "leisure",
              optional: false,
              image: "",
            },
            {
              id: "d3-lagoon-cruise",
              title: "Knysna Lagoon Cruise",
              description:
                "A cruise on the Knysna Lagoon. The quote lists it as included, while the itinerary calls lagoon cruises optional.", // QUERY CLIENT
              time: "",
              duration: "",
              type: "leisure",
              optional: false,
              image: "",
            },
          ],

          meals: { breakfast: true, lunch: false, dinner: false },

          accommodation: {
            title: "Waterfront Lodge",
            location: "Knysna, Garden Route",
            availabilityNote: "",
            options: ["Breakfast included"],
            image: "",
          },

          images: [],
        },

        {
          day: 4,
          title: "Knysna → Tsitsikamma (Forests & Adventure)",
          route: "Knysna → Tsitsikamma National Park",
          description:
            "After breakfast, head to Tsitsikamma National Park and walk the famous Storms River Suspension Bridge. Choose from adventure options including ziplining, kayak and lilo, and forest hiking.",

          activities: [
            {
              id: "d4-elephant-park",
              title: "Elephant Park",
              description:
                "Included in your quote, though the source does not say when it takes place.", // QUERY CLIENT: confirm the day
              time: "",
              duration: "",
              type: "wildlife",
              optional: false,
              image: "",
            },
            {
              id: "d4-jukani",
              title: "Jukani Wildlife Sanctuary",
              description:
                "Included in your quote, though the source does not say when it takes place.", // QUERY CLIENT: confirm the day
              time: "",
              duration: "",
              type: "wildlife",
              optional: false,
              image: "",
            },
            {
              id: "d4-tsitsikamma",
              title: "Tsitsikamma National Park",
              description:
                "Walk the famous Storms River Suspension Bridge in this forest and coastline park.",
              time: "",
              duration: "",
              type: "nature",
              optional: false,
              image: "",
            },
            {
              id: "d4-adventure",
              title: "Adventure Options",
              description: "Ziplining, kayak and lilo, or forest hiking.", // QUERY CLIENT: price and whether included
              time: "",
              duration: "",
              type: "adventure",
              optional: true,
              image: "",
            },
          ],

          meals: { breakfast: true, lunch: false, dinner: false },

          accommodation: {
            title: "At the Woods Guest House",
            location: "Tsitsikamma, Garden Route",
            availabilityNote:
              "Also listed in the source: Tsitsikamma Village Inn and Tsitsikamma Manor.", // QUERY CLIENT
            options: ["Breakfast included"],
            image: "",
          },

          images: [],
        },

        {
          day: 5,
          title: "Tsitsikamma → Hermanus → Cape Town",
          route:
            "Tsitsikamma → Hermanus → Benguela Cove → Betty's Bay → Clarence Drive → Cape Town",
          description:
            "After breakfast, visit the Hermanus whale coast, enjoy a premium wine tasting at Benguela Cove, see the penguins at Betty's Bay and return to Cape Town along Clarence Drive, arriving in the late afternoon. There is no overnight on Day 5.",

          activities: [
            {
              id: "d5-hermanus",
              title: "Hermanus Whale Coast",
              description: "Seasonal whale watching from the cliff paths.",
              time: "",
              duration: "",
              type: "wildlife",
              optional: false,
              image: "",
            },
            {
              id: "d5-benguela",
              title: "Benguela Cove Lagoon Wine Estate",
              description:
                "A premium wine tasting with lagoon views, including the cheese and wine pairing listed in your quote.", // QUERY CLIENT: confirm the pairing happens here
              time: "",
              duration: "",
              type: "wine",
              optional: false,
              image: "",
            },
            {
              id: "d5-penguins",
              title: "Betty's Bay Penguin Colony",
              description: "African penguins at Stony Point Nature Reserve.",
              time: "",
              duration: "",
              type: "wildlife",
              optional: false,
              image: "",
            },
            {
              id: "d5-clarence",
              title: "Clarence Drive (R44)",
              description: "One of South Africa's most scenic coastal roads.",
              time: "",
              duration: "",
              type: "scenic",
              optional: false,
              image: "",
            },
            {
              id: "d5-return",
              title: "Return to Cape Town",
              description:
                "Late afternoon arrival in Cape Town. No overnight; the tour ends on Day 5.",
              time: "Late afternoon",
              duration: "",
              type: "transfer",
              optional: false,
              image: "",
            },
          ],

          meals: { breakfast: true, lunch: false, dinner: false },
          images: [],
        },
      ],
    },

    stops: null,

    vehicle: null,

    securityAndLiability: null,

    accommodation: {
      included: true,
      type: "Luxury Safari Lodge & Guesthouses",
      description:
        "4 nights: Gondwana Game Reserve (luxury Kwena room), De Zeekoe Guest Farm in Oudtshoorn, Waterfront Lodge in Knysna and At the Woods Guest House in Tsitsikamma. Breakfast is included.",
    },

    needToKnow: [
      { text: "The total package price is R46,000" },
      {
        text: "4 nights' accommodation is included, with breakfast; there is no overnight on Day 5",
      },
      {
        text: "Accommodation at Gondwana is the luxury Kwena room, as quoted by Gondwana Game Reserve (1 room available)",
      },
      { text: "The Gondwana conservation levy is included" },
      { text: "Lunches and selected dinners are not included" },
      {
        text: "Choose between the Cango Caves Heritage Tour and Adventure Tour",
      },
      {
        text: "The ostrich farm experience and the Tsitsikamma adventure options (ziplining, kayak and lilo, forest hiking) are optional",
      },
      { text: "The Bloukrans Bungy Jump is not included" },
      { text: "Whale watching at Hermanus is seasonal" },
      {
        text: "Alcoholic beverages, gratuities, travel insurance and personal expenses are not included",
      },
    ],

    faqs: [
      {
        question: "How long is the tour?",
        answer:
          "This is a 5-day, 4-night private tour from Cape Town and back, with no overnight on Day 5.",
      },
      {
        question: "Where do we stay?",
        answer:
          "Night 1 at Gondwana Game Reserve (luxury Kwena room), night 2 at De Zeekoe Guest Farm in Oudtshoorn, night 3 at Waterfront Lodge in Knysna and night 4 at At the Woods Guest House in Tsitsikamma. Breakfast is included.",
      },
      {
        question: "What is included?",
        answer:
          "4 nights' accommodation with breakfast, the Gondwana conservation levy, a dedicated driver-guide, a Big 5 safari at Gondwana, the Cango Caves, a lagoon cruise, a cheese and wine pairing, the Stony Point penguin colony, Tsitsikamma National Park, the Storms River Suspension Bridge, Elephant Park, Jukani Wildlife Sanctuary and the Mossel Bay zipline.",
      },
      {
        question: "What is not included?",
        answer:
          "The Bloukrans Bungy Jump, lunches and selected dinners, travel insurance, personal expenses, alcoholic beverages and gratuities.",
      },
      {
        question: "Which animals can we see at Gondwana?",
        answer:
          "Expect sightings of lion, elephant, rhino, buffalo, giraffe, zebra and more on the Big 5 safari.",
      },
      {
        question: "Which Cango Caves tour do we do?",
        answer:
          "You can choose between the Heritage Tour and the Adventure Tour.",
      },
      {
        question: "What adventure activities are available at Tsitsikamma?",
        answer:
          "Ziplining, kayak and lilo, and forest hiking. You can also walk the famous Storms River Suspension Bridge.",
      },
      {
        question: "Can we see whales at Hermanus?",
        answer:
          "Whale watching from the Hermanus cliff paths is seasonal, so sightings depend on the time of year.",
      },
      {
        question: "Who is this tour suitable for?",
        answer:
          "It suits families, couples, solo travellers and small groups looking for a complete Garden Route experience with a premium safari.",
      },
    ],

    tags: [
      "Garden Route",
      "Gondwana Game Reserve",
      "Big 5 Safari",
      "Safari",
      "Multi-Day",
      "5 Day Tour",
      "Oudtshoorn",
      "Cango Caves",
      "Knysna",
      "Tsitsikamma",
      "Hermanus",
      "Betty's Bay",
      "Wine Tasting",
      "Wildlife",
      "Luxury Safari",
      "South Africa",
    ],
  },
];

export const getAllTourGalleryImages = (tour) => {
  if (!tour) return [];

  let destinationImages = [];

  if (Array.isArray(tour.destinationGalleries)) {
    destinationImages = tour.destinationGalleries.flatMap(
      (destination) => destination.images || [],
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
      .filter((stop) => stop.id !== "pickup" && stop.id !== "return")
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

export default tours;

// TEMAPLTE
// {
//   id: null,
//   type: TOUR_TYPES.PACKAGES,
//   category: TOUR_MODIFIERS.MULTI_DAY,

//   title: "",
//   slug: "",
//   canonicalPath: "",

//   seo: {
//     title: "",
//     description: "",
//     keywords: [],
//   },

//   workflow: defaultWorkflow,

//   image: "",
//   images: [],
//   imageFolder: "",
//   videos: [],

//   location: "",
//   duration: "",

//   priceBase: 0,
//   minPeople: 1,

//   pricing: [],

//   additionalPricing: [],

//   groupPricing: {
//     enabled: false,
//     icon: "",
//     tiers: [],
//   },

//   rating: null,
//   stars: null,
//   mainReviewerName: "",
//   mainReviewerCountry: "",
//   reviewYear: null,
//   otherReviews: null,
//   mainReview: "",

//   description: "",

//   highlights: [],
//   included: [],
//   excluded: [],

//   pickupOptions: [],
//   requirements: [],

//   arrangements: {
//     availability: "",
//     duration: "",
//     operatingTime: "",
//     departure: "",
//     return: "",
//     location: "",
//     clothing: [],
//     thingsToBring: [],
//     passengerPolicy: "",
//     notes: [],
//   },

//   weatherPolicy: {
//     summary: "",
//     items: [],
//   },

//   cancellationPolicy: {
//     summary: "",
//     items: [],
//   },

//   safetyPolicy: {
//     summary: "",
//     items: [],
//   },

//   itinerary: {
//     intro: {
//       title: "",
//       description: "",
//     },

//     route: {
//       title: "",
//       description: "",
//     },

//     days: [],
//   },

//   stops: null,

//   // routeInformation: {
//   //   title: "",
//   //   description: "",
//   //   items: [],
//   // },

//   vehicle: null,

//   securityAndLiability: null,

//   accommodation: {
//     included: false,
//     type: "",
//     description: "",
//   },

//   needToKnow: [],

//   faqs: [],

//   tags: [],
// },
