// The form should calculate a live price, but the final amount must be recalculated again on the server before creating the Stripe payment. 
// Do not trust only the frontend price.

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import allTours from "../data/tours.js";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const DEFAULT_CENTER = [-33.9249, 18.4241];

const PRIVATE_TOUR_FEE_ZAR = 750;
const CUSTOM_TRIP_FEE_ZAR = 500;

const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const TOUR_FOLDER_ALIASES = {
  // adrenaline
  "shark": "adrenaline/shark-cage-diving",
  "shark-cage-diving": "adrenaline/shark-cage-diving",

  "gun": "adrenaline/gun-range",
  "gunrange": "adrenaline/gun-range",
  "gun-range": "adrenaline/gun-range",

  "paragliding": "adrenaline/paragliding",
  "para-gliding": "adrenaline/paragliding",

  "snorkel": "adrenaline/snorkelling",
  "snorkelling": "adrenaline/snorkelling",
  "snorkeling": "adrenaline/snorkelling",

  // hiking
  "lions-head": "hiking/lions-head",
  "lion-s-head": "hiking/lions-head",
  "lion-head": "hiking/lions-head",

  "platteklip": "hiking/platteklip",
  "platteklip-gorge": "hiking/platteklip",

  // historical
  "langa": "historical/langa",
  "langa-township": "historical/langa",

  "robben-island": "historical/robben-island",
  "robben-island-tour": "historical/robben-island",

  // packages
  "peninsula-tour-1": "packages/peninsula-tour-1",
  "peninsula-tour-2": "packages/peninsula-tour-2",

  // wine routes
  "delaire": "wine-routes/delaire",
  "delaire-graff": "wine-routes/delaire",

  "rust-en-vrede": "wine-routes/rest-en-vrede",
  "rest-en-vrede": "wine-routes/rest-en-vrede",

  "spier": "wine-routes/spier",

  "tokara": "wine-routes/tokara",
};

const SPECIAL_GALLERIES = {
  tokara: [
    "/images/tours/wine-routes/tokara/1%20(10).webp",
    "/images/tours/wine-routes/tokara/2%20(9).webp",
    "/images/tours/wine-routes/tokara/3%20(9).webp",
  ],
};

const getTourSlug = (tour) => {
  return tour?.slug || slugify(tour?.title || tour?.info || "");
};

const getTourFolder = (tour) => {
  const slug = getTourSlug(tour);
  const title = slugify(tour?.title || tour?.info || "");
  const category = slugify(tour?.category || "");

  if (TOUR_FOLDER_ALIASES[slug]) return TOUR_FOLDER_ALIASES[slug];
  if (TOUR_FOLDER_ALIASES[title]) return TOUR_FOLDER_ALIASES[title];

  if (title.includes("shark")) return "adrenaline/shark-cage-diving";
  if (title.includes("gun")) return "adrenaline/gun-range";
  if (title.includes("snorkel")) return "adrenaline/snorkelling";
  if (title.includes("para")) return "adrenaline/paragliding";

  if (title.includes("lion")) return "hiking/lions-head";
  if (title.includes("platteklip")) return "hiking/platteklip";

  if (title.includes("langa")) return "historical/langa";
  if (title.includes("robben")) return "historical/robben-island";

  if (title.includes("delaire")) return "wine-routes/delaire";
  if (title.includes("rust") || title.includes("rest")) return "wine-routes/rest-en-vrede";
  if (title.includes("spier")) return "wine-routes/spier";
  if (title.includes("tokara")) return "wine-routes/tokara";

  if (title.includes("peninsula") && title.includes("2")) {
    return "packages/peninsula-tour-2";
  }

  if (title.includes("peninsula")) {
    return "packages/peninsula-tour-1";
  }

  if (category.includes("adrenaline") || category.includes("adventure")) {
    return `adrenaline/${slug}`;
  }

  if (category.includes("hiking")) {
    return `hiking/${slug}`;
  }

  if (category.includes("historical")) {
    return `historical/${slug}`;
  }

  if (category.includes("package")) {
    return `packages/${slug}`;
  }

  if (
    category.includes("wine") ||
    category.includes("winery") ||
    category.includes("wine-route")
  ) {
    return `wine-routes/${slug}`;
  }

  return slug;
};

const getTourGallery = (tour) => {
  if (Array.isArray(tour?.images) && tour.images.length > 0) {
    return tour.images;
  }

  const slug = getTourSlug(tour);
  const title = slugify(tour?.title || tour?.info || "");

  if (SPECIAL_GALLERIES[slug]) return SPECIAL_GALLERIES[slug];
  if (SPECIAL_GALLERIES[title]) return SPECIAL_GALLERIES[title];

  const folder = getTourFolder(tour);

  return [
    `/images/tours/${folder}/1.webp`,
    `/images/tours/${folder}/2.webp`,
    `/images/tours/${folder}/3.webp`,
  ];
};

function FlyToLocation({ center, zoom = 13 }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo(center, zoom, { duration: 1.1 });
  }, [center, zoom, map]);

  return null;
}

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

function PickupMap({ center, markerPosition, onPick }) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      className="h-[260px] w-full overflow-hidden rounded-2xl border border-black/10"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onPick={onPick} />
      <FlyToLocation center={center} />

      {markerPosition && (
        <Marker position={[markerPosition.lat, markerPosition.lng]} />
      )}
    </MapContainer>
  );
}

function BookingField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </span>

      {children}

      {hint && (
        <span className="mt-1.5 block text-xs leading-5 text-neutral-400">
          {hint}
        </span>
      )}
    </label>
  );
}

function MiniAssurance({ title, text, icon = "✓" }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/75 p-4 shadow-[0_10px_26px_rgba(0,0,0,0.04)]">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-200 text-sm font-bold text-green-950">
          {icon}
        </span>

        <div>
          <p className="text-sm font-bold text-neutral-900">{title}</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">{text}</p>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ active, title, text, price, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex min-h-[7rem] flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-300 ${
        active
          ? "border-green-300 bg-green-200 text-green-950 shadow-[0_14px_34px_rgba(34,197,94,0.18)]"
          : "border-black/5 bg-white text-neutral-700 hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
            active ? "bg-white/70 text-green-950" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {icon}
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
            active ? "bg-white/70 text-green-950" : "bg-neutral-100 text-neutral-400"
          }`}
        >
          {active ? "Selected" : "Optional"}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-sm font-bold">{title}</p>
        <p className={`mt-1 text-xs leading-5 ${active ? "text-green-950/75" : "text-neutral-500"}`}>
          {text}
        </p>
        <p className={`mt-2 text-xs font-bold ${active ? "text-green-950" : "text-green-700"}`}>
          {price}
        </p>
      </div>
    </button>
  );
}

const Booking = ({ embeddedTour }) => {
  const nav = useNavigate();
  const location = useLocation();

  const tour = embeddedTour || location.state?.tour;

  const pageRef = useRef(null);
  const backRef = useRef(null);
  const cardRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const checkoutRef = useRef(null);
  const bottomRef = useRef(null);
  const priceRef = useRef(null);
  const activeImageRef = useRef(null);

  const initialCurrency = location.state?.selectedCurrency || "ZAR";
  const [currency, setCurrency] = useState(initialCurrency);

  const FX_RATES = {
    ZAR: 1,
    USD: 0.054,
    EUR: 0.05,
    GBP: 0.043,
  };

  const convertPrice = (baseAmount = 0, targetCurrency = "ZAR") => {
    return Number(baseAmount || 0) * (FX_RATES[targetCurrency] || 1);
  };

  const formatMoney = (amount, currencyCode) =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);

  const supportedCurrencies =
    tour?.supportedCurrencies?.length > 0
      ? tour.supportedCurrencies
      : ["ZAR", "USD", "EUR", "GBP"];

  const pricePerPerson = convertPrice(tour?.priceBase, currency);
  const displayPrice = formatMoney(pricePerPerson, currency);

  const gallery = useMemo(() => {
    return tour ? getTourGallery(tour) : [];
  }, [tour]);

  const relatedTours = useMemo(() => {
    if (!tour || !Array.isArray(allTours)) return [];

    const currentSlug = getTourSlug(tour);

    const sameType = allTours.filter((item) => {
      if (!item) return false;
      const itemSlug = getTourSlug(item);
      if (itemSlug === currentSlug || item.id === tour.id) return false;
      return item.type === tour.type || item.category === tour.category;
    });

    const fallback = allTours.filter((item) => {
      if (!item) return false;
      const itemSlug = getTourSlug(item);
      return itemSlug !== currentSlug && item.id !== tour.id;
    });

    return [...sameType, ...fallback]
      .filter(
        (item, index, array) =>
          array.findIndex((candidate) => getTourSlug(candidate) === getTourSlug(item)) === index
      )
      .slice(0, 3);
  }, [tour]);

  const [activeImage, setActiveImage] = useState(0);

  const activeImageSrc =
    gallery[activeImage] || tour?.image || "/images/content/random/1.webp";

  const fallbackImage = tour?.image || "/images/content/random/1.webp";

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    date: "",
    participants: "1",
    pickupLocation: "",
    pickupCoords: null,
    isPrivate: false,
    isCustom: false,
    ccParticipants: false,
    participantEmails: [],
  });

  const participantCount = Number(formData.participants || 1);
  const maxParticipantEmails = Math.max(participantCount - 1, 0);
  const privateFee = formData.isPrivate ? convertPrice(PRIVATE_TOUR_FEE_ZAR, currency) : 0;
  const customFee = formData.isCustom ? convertPrice(CUSTOM_TRIP_FEE_ZAR, currency) : 0;
  const estimatedTotal = pricePerPerson * participantCount + privateFee + customFee;
  const displayTotal = formatMoney(estimatedTotal, currency);
  const displayPrivateFee = formatMoney(convertPrice(PRIVATE_TOUR_FEE_ZAR, currency), currency);
  const displayCustomFee = formatMoney(convertPrice(CUSTOM_TRIP_FEE_ZAR, currency), currency);
  const normalizedParticipantEmails = (formData.participantEmails || [])
    .map((email) => email.trim())
    .filter(Boolean);

  const [mapCenter, setMapCenter] = useState({
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1],
  });

  const [markerPosition, setMarkerPosition] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleImageError = (e) => {
    if (e.currentTarget.src.includes(fallbackImage)) return;
    e.currentTarget.src = fallbackImage;
  };

  const handleBack = () => {
    if (window.lenis) {
      window.lenis.stop();
      window.lenis.scrollTo(window.scrollY, {
        immediate: true,
        force: true,
      });
    }

    requestAnimationFrame(() => {
      nav(-1);
    });
  };

  useEffect(() => {
    if (!tour) nav("/");
  }, [tour, nav]);

  useEffect(() => {
    setActiveImage(0);
  }, [tour]);

  useEffect(() => {
    if (location.state?.forceScrollTop) {
      window.scrollTo(0, 0);

      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true, force: true });
        window.lenis.start();
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (!gallery.length || gallery.length === 1) return;

    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % gallery.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [gallery]);

  useEffect(() => {
    if (!activeImageRef.current) return;

    gsap.fromTo(
      activeImageRef.current,
      { opacity: 0.65, scale: 1.02 },
      { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out" }
    );
  }, [activeImage]);

  useLayoutEffect(() => {
    if (!tour) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.fromTo(
        backRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.45 }
      )
        .fromTo(
          cardRef.current,
          { opacity: 0, y: 36, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.65 },
          "-=0.15"
        )
        .fromTo(
          leftRef.current,
          { opacity: 0, x: -34 },
          { opacity: 1, x: 0, duration: 0.55 },
          "-=0.45"
        )
        .fromTo(
          rightRef.current,
          { opacity: 0, x: 34 },
          { opacity: 1, x: 0, duration: 0.55 },
          "-=0.5"
        )
        .fromTo(
          checkoutRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.15"
        )
        .fromTo(
          bottomRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.12"
        );

      gsap.fromTo(
        priceRef.current,
        { opacity: 0.5, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          delay: 0.7,
          ease: "back.out(1.7)",
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [tour]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "participants") {
        const maxEmails = Math.max(Number(value || 1) - 1, 0);
        next.participantEmails = (prev.participantEmails || []).slice(0, maxEmails);
        if (maxEmails === 0) next.ccParticipants = false;
      }

      return next;
    });
  };

  const handleToggleOption = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const addParticipantEmail = () => {
    setFormData((prev) => {
      const existing = prev.participantEmails || [];
      if (existing.length >= maxParticipantEmails) return prev;

      return {
        ...prev,
        participantEmails: [...existing, ""],
        ccParticipants: true,
      };
    });
  };

  const updateParticipantEmail = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      participantEmails: (prev.participantEmails || []).map((email, emailIndex) =>
        emailIndex === index ? value : email
      ),
    }));
  };

  const removeParticipantEmail = (index) => {
    setFormData((prev) => {
      const nextEmails = (prev.participantEmails || []).filter(
        (_, emailIndex) => emailIndex !== index
      );

      return {
        ...prev,
        participantEmails: nextEmails,
        ccParticipants: nextEmails.length ? prev.ccParticipants : false,
      };
    });
  };

  const handleMapPick = async (coords) => {
    setMarkerPosition(coords);
    setMapCenter(coords);
    setLocationError("");

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`
      );

      const data = await res.json();

      setFormData((prev) => ({
        ...prev,
        pickupLocation:
          data?.display_name ||
          `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        pickupCoords: coords,
      }));
    } catch {
      setFormData((prev) => ({
        ...prev,
        pickupLocation: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        pickupCoords: coords,
      }));
    }
  };

  const handleFindAddress = async () => {
    const query = formData.pickupLocation.trim();

    if (!query) {
      setLocationError("Enter a pickup address first.");
      return;
    }

    try {
      setLocationLoading(true);
      setLocationError("");

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          query
        )}`
      );

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();

      if (!data.length) {
        setLocationError("No matching location found.");
        return;
      }

      const result = data[0];

      const coords = {
        lat: Number(result.lat),
        lng: Number(result.lon),
      };

      setMarkerPosition(coords);
      setMapCenter(coords);

      setFormData((prev) => ({
        ...prev,
        pickupLocation: result.display_name || prev.pickupLocation,
        pickupCoords: coords,
      }));
    } catch {
      setLocationError("Could not find that address.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      "fullName",
      "mobile",
      "email",
      "date",
      "participants",
      "pickupLocation",
    ];

    const missing = requiredFields.some((field) => !formData[field]);

    if (missing) {
      alert("Please fill in all fields");
      return;
    }

    if (!formData.pickupCoords) {
      alert("Please confirm your pickup point on the map.");
      return;
    }

    const invalidParticipantEmail = normalizedParticipantEmails.find(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (invalidParticipantEmail) {
      alert(`Please check this participant email: ${invalidParticipantEmail}`);
      return;
    }

    nav("/checkout", {
      state: {
        tour,
        bookingDetails: {
          ...formData,
          participantEmails: normalizedParticipantEmails,
          ccParticipantEmails: formData.ccParticipants ? normalizedParticipantEmails : [],
          pricingOptions: {
            isPrivate: formData.isPrivate,
            isCustom: formData.isCustom,
            privateFee,
            customFee,
            estimatedTotal,
            currency,
          },
        },
        selectedCurrency: currency,
      },
    });
  };

  if (!tour) return null;

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-stone-50 text-neutral-900"
    >
      <img
        src="/assets/content/clip-art/section1-bg.png"
        alt=""
        className="pointer-events-none absolute z-10 h-full w-full select-none object-contain opacity-90"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-stone-50/90 to-sky-100/80" />

      <div className="relative z-10 px-6 py-10 md:px-12 xl:px-20">
        <div ref={backRef} className="mx-auto mb-6 max-w-7xl">
          <button
            onClick={handleBack}
            className="group flex items-center gap-3 rounded-full border border-black/10 bg-white/90 px-5 py-3 text-neutral-800 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md"
          >
            <img
              src="/icons/upArrow.png"
              className="w-4 rotate-270 transition-transform duration-300 group-hover:-translate-x-1"
              alt=""
            />

            <span className="font-frank text-base">Back to tours</span>
          </button>
        </div>

        <div
          ref={cardRef}
          className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-black/5 bg-white/88 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-md"
        >
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div ref={leftRef} className="relative bg-neutral-100">
              <div className="relative h-[380px] overflow-hidden md:h-[460px] lg:h-[680px]">
                <img
                  ref={activeImageRef}
                  src={activeImageSrc}
                  alt={tour.title || tour.info}
                  className="h-full w-full object-cover"
                  onError={handleImageError}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/24 to-black/8" />

                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  {tour.duration && (
                    <span className="rounded-full border border-white/20 bg-white/16 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                      {tour.duration}
                    </span>
                  )}

                  {tour.rating && (
                    <span className="rounded-full border border-white/20 bg-green-200/95 px-3 py-1.5 text-xs font-bold text-green-950 backdrop-blur-md">
                      {tour.rating} rating
                    </span>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">
                    Selected Tour
                  </div>

                  <div className="mt-2 max-w-[12ch] font-frank text-4xl leading-[0.92] md:text-5xl">
                    {tour.title || tour.info}
                  </div>

                  {tour.location && (
                    <div className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                      {tour.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 md:p-7">
                <div className="mb-5 flex gap-3 overflow-x-auto pb-1">
                  {gallery.map((img, index) => (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-20 w-24 shrink-0 overflow-hidden rounded-2xl border transition-all duration-300 ${
                        activeImage === index
                          ? "border-neutral-900 ring-2 ring-neutral-900/10"
                          : "border-black/10 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${tour.title || tour.info} ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniAssurance
                    title="Pickup included"
                    text="Choose your accommodation or confirm a custom pickup point."
                    icon="⌖"
                  />

                  <MiniAssurance
                    title="Pay now, confirm after"
                    text="Final pickup and operational details are confirmed manually."
                    icon="✓"
                  />
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-black/5 bg-white/80 p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-400">
                    Tour overview
                  </div>

                  {tour.description && (
                    <p className="mt-3 leading-7 text-neutral-650">
                      {tour.description}
                    </p>
                  )}
                </div>

                {relatedTours.length > 0 && (
                  <div className="mt-4 rounded-[1.5rem] p-5">
                    <div className="mb-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-400">
                          Related tours
                        </p>
                        <h3 className="mt-1 font-frank text-2xl leading-none text-neutral-950">
                          You may also like
                        </h3>
                      </div>

                      <span className="rounded-full bg-green-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-green-950">
                        Explore
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {relatedTours.map((related) => {
                        const relatedImage =
                          related.image || getTourGallery(related)?.[0] || "/images/content/random/1.webp";
                        const relatedPrice = formatMoney(
                          convertPrice(related.priceBase, currency),
                          currency
                        );

                        return (
                          <button
                            key={related.slug || related.id}
                            type="button"
                            onClick={() => nav(`/tours/${related.slug}`)}
                            className="group flex items-center gap-3 rounded-2xl border border-black/5 bg-neutral-50 p-2 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)]"
                          >
                            <img
                              src={relatedImage}
                              alt={related.title}
                              className="h-16 w-20 shrink-0 rounded-xl object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = "/images/content/random/1.webp";
                              }}
                            />

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bitter text-sm font-bold text-neutral-950">
                                {related.title}
                              </p>

                              <p className="mt-1 line-clamp-1 text-xs text-neutral-500">
                                {related.duration || related.location || "Cape Town experience"}
                              </p>

                              <p className="mt-1 text-xs font-bold text-green-700">
                                From {relatedPrice} pp
                              </p>
                            </div>

                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-neutral-400 transition group-hover:bg-green-200 group-hover:text-green-950">
                              →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div ref={rightRef} className="group/right bg-gradient-to-br from-white via-white to-stone-50 p-5 transition-colors duration-500 hover:from-white hover:via-green-50/70 hover:to-blue-50/60 md:p-7 lg:p-8">
              <div className="mb-6 rounded-[1.75rem] border border-black/5 bg-neutral-50 p-4 transition-all duration-500 group-hover/right:border-green-200 group-hover/right:bg-white sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">
                      Booking details
                    </p>

                    <h2 className="mt-2 font-frank text-3xl leading-none text-neutral-950 md:text-4xl">
                      Secure your slot
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                      Complete the important details first. Your final amount is recalculated securely at checkout.
                    </p>
                  </div>

                  <div ref={priceRef} className="flex shrink-0 items-end justify-between gap-3 sm:justify-end">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                        From
                      </div>

                      <div className="font-frank text-3xl font-bold leading-none text-neutral-950 md:text-4xl">
                        {displayPrice}
                      </div>

                      <div className="mt-1 text-xs text-neutral-500">per person</div>
                    </div>

                    <div className="relative">
                      <select
                        aria-label="Select currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="h-14 w-20 appearance-none rounded-2xl border border-black/10 bg-white px-3 pr-7 text-center text-lg font-bold text-neutral-900 outline-none transition hover:border-green-300 hover:bg-green-200 focus:border-green-400 focus:bg-green-200"
                      >
                        {supportedCurrencies.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>

                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 rounded-2xl bg-white p-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      Guests
                    </p>
                    <p className="mt-1 text-sm font-bold text-neutral-900">
                      {participantCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      Est. total
                    </p>
                    <p className="mt-1 text-sm font-bold text-neutral-900">
                      {displayTotal}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-bold text-green-700">
                      {formData.isPrivate || formData.isCustom
                        ? "Adjusted estimate"
                        : "Pay-now flow"}
                    </p>
                  </div>
                </div>

                {(formData.isPrivate || formData.isCustom) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.isPrivate && (
                      <span className="rounded-full bg-green-200 px-3 py-1.5 text-xs font-bold text-green-950">
                        Private fee included: {formatMoney(privateFee, currency)}
                      </span>
                    )}

                    {formData.isCustom && (
                      <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                        Custom planning included: {formatMoney(customFee, currency)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <form id="booking-form" onSubmit={handleSubmit} className="grid gap-5">
                <div className="rounded-[1.75rem] border border-black/5 bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover/right:border-green-200/80 group-hover/right:shadow-[0_16px_42px_rgba(34,197,94,0.08)] sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-green-200 text-sm font-bold text-green-950">
                      1
                    </span>
                    <div>
                      <h3 className="font-frank text-2xl leading-none text-neutral-950">
                        Traveller details
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        Used for confirmation and support.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <BookingField label="Full name">
                      <input
                        name="fullName"
                        placeholder="Faiez Viljoen"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      />
                    </BookingField>

                    <BookingField label="Mobile number">
                      <input
                        name="mobile"
                        placeholder="081 000 0000"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      />
                    </BookingField>

                    <BookingField label="Email address">
                      <input
                        name="email"
                        type="email"
                        placeholder="name@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      />
                    </BookingField>

                    <BookingField label="Preferred date">
                      <input
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                      />
                    </BookingField>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-black/5 bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover/right:border-green-200/80 group-hover/right:shadow-[0_16px_42px_rgba(34,197,94,0.08)] sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-sm font-bold text-blue-700">
                      2
                    </span>
                    <div>
                      <h3 className="font-frank text-2xl leading-none text-neutral-950">
                        Group size
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        Select the number of guests in your own party.
                      </p>
                    </div>
                  </div>

                  <BookingField
                    label="Participants"
                    hint="Discount tiers only apply when you book and pay for that full number of guests."
                  >
                    <select
                      name="participants"
                      value={formData.participants}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    >
                      {[...Array(8).keys()].map((num) => (
                        <option key={num + 1} value={num + 1}>
                          {num + 1} Participant{num + 1 > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </BookingField>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <ToggleOption
                      active={formData.isPrivate}
                      title="Private tour"
                      text="Book this as a private vehicle-based experience."
                      price={`+ ${displayPrivateFee}`}
                      icon="P"
                      onClick={() => handleToggleOption("isPrivate")}
                    />

                    <ToggleOption
                      active={formData.isCustom}
                      title="Custom trip"
                      text="Request custom planning, route timing, or special adjustments."
                      price={`+ ${displayCustomFee}`}
                      icon="C"
                      onClick={() => handleToggleOption("isCustom")}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src="/icons/savemore.png"
                        className="mt-0.5 h-8 w-8 shrink-0 object-contain opacity-80"
                        alt=""
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />

                      <div>
                        <p className="text-sm font-bold text-green-950">
                          Save more as a group
                        </p>

                        <p className="mt-1 text-xs leading-5 text-green-900/75">
                          Lower per-person rates apply only when the customer books and pays
                          for the full selected group size.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-black/5 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-neutral-950">
                          Participant email CCs
                        </p>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          Optional. Add other guest emails so they can be CC’d after purchase.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addParticipantEmail}
                        disabled={!maxParticipantEmails || formData.participantEmails.length >= maxParticipantEmails}
                        className="rounded-2xl border border-black/10 bg-neutral-950 px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Add member email
                      </button>
                    </div>

                    {maxParticipantEmails === 0 && (
                      <p className="mt-3 rounded-xl bg-neutral-50 p-3 text-xs leading-5 text-neutral-500">
                        Select at least 2 participants to add extra guest emails.
                      </p>
                    )}

                    {formData.participantEmails.length > 0 && (
                      <div className="mt-4 grid gap-3">
                        <label className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700">
                          <input
                            type="checkbox"
                            checked={formData.ccParticipants}
                            onChange={() => handleToggleOption("ccParticipants")}
                            className="h-4 w-4 accent-green-500"
                          />
                          CC these participants after confirmed purchase
                        </label>

                        {formData.participantEmails.map((email, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => updateParticipantEmail(index, e.target.value)}
                              placeholder={`Participant ${index + 2} email`}
                              className="min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white p-3 text-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                            />

                            <button
                              type="button"
                              onClick={() => removeParticipantEmail(index)}
                              className="rounded-2xl border border-black/10 bg-white px-3 text-sm font-bold text-neutral-500 transition hover:bg-red-50 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-black/5 bg-stone-50 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover/right:border-blue-200/80 group-hover/right:bg-blue-50/40 group-hover/right:shadow-[0_16px_42px_rgba(59,130,246,0.08)] sm:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-950 text-sm font-bold text-white">
                      3
                    </span>
                    <div>
                      <h3 className="font-frank text-2xl leading-none text-neutral-950">
                        Pickup location
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        Enter an address and search, or click directly on the map.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-col gap-3 md:flex-row">
                    <input
                      name="pickupLocation"
                      placeholder="Hotel, guesthouse, Airbnb, or pickup point"
                      value={formData.pickupLocation}
                      onChange={handleChange}
                      className="flex-1 rounded-2xl border border-neutral-200 bg-white p-4 text-base outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
                    />

                    <button
                      type="button"
                      onClick={handleFindAddress}
                      disabled={locationLoading}
                      className="rounded-2xl bg-neutral-950 px-5 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {locationLoading ? "Searching..." : "Find on map"}
                    </button>
                  </div>

                  <PickupMap
                    center={[mapCenter.lat, mapCenter.lng]}
                    markerPosition={markerPosition}
                    onPick={handleMapPick}
                  />

                  {locationError && (
                    <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                      {locationError}
                    </p>
                  )}

                  {formData.pickupCoords && (
                    <div className="mt-3 rounded-2xl border border-green-200 bg-white p-4 text-sm text-neutral-600">
                      <div className="font-bold text-neutral-900">
                        Selected pickup point
                      </div>

                      <div className="mt-1 leading-6">{formData.pickupLocation}</div>

                      <div className="mt-1 text-xs text-neutral-500">
                        {formData.pickupCoords.lat.toFixed(6)},{" "}
                        {formData.pickupCoords.lng.toFixed(6)}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div
            ref={checkoutRef}
            className="border-t border-black/5 bg-white/92 px-4 py-4 md:px-8 md:py-5"
          >
            <div className="grid items-stretch gap-3 lg:grid-cols-[0.82fr_1fr_auto]">
              <div className="rounded-2xl bg-neutral-950 p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Estimated total
                </p>

                <div className="mt-1 font-frank text-3xl font-bold leading-none">
                  {displayTotal}
                </div>

                <p className="mt-2 text-xs leading-5 text-white/60">
                  {participantCount} guest{participantCount > 1 ? "s" : ""} · {currency}
                  {(formData.isPrivate || formData.isCustom) && " · extras included"}
                </p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-stone-50 p-4">
                <p className="text-sm font-bold text-neutral-900">
                  Secure checkout is next.
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Final price is recalculated on the server before payment. Pickup and
                  vehicle details are confirmed manually after payment.
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                  <span className="rounded-full bg-white px-3 py-1">Terms</span>
                  <span className="rounded-full bg-white px-3 py-1">Privacy</span>
                  <span className="rounded-full bg-green-200 px-3 py-1 text-green-950">
                    Powered by Stripe
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="booking-form"
                className="hero-gradient flex min-h-[5.5rem] w-full items-center justify-center rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl lg:w-[15rem]"
              >
                Continue to checkout
              </button>
            </div>
          </div>
        </div>

        <div
          ref={bottomRef}
          className="mx-auto mt-6 max-w-7xl rounded-2xl border border-black/5 bg-white/72 px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-md"
        >
          <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
            <p className="text-sm leading-6 text-neutral-600">
              <b className="text-neutral-900">Secure checkout powered by Stripe.</b>
              <br />
              Your final amount is verified before payment.
            </p>

            <div className="flex items-center gap-2 rounded-full bg-green-200 px-4 py-2 text-sm font-semibold text-green-950">
              <img
                src="/icons/savemore.png"
                className="h-5 w-5 object-contain"
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <span>Group pricing shown before checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;