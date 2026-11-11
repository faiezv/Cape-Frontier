// src/components/Booking/Booking.jsx
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";

import CheckoutSummary from "./CheckoutSummary";
import TourOptions from "../TourDetails/TourOptions.jsx";
import KidsActivities from "../TourDetails/KidsActivities.jsx";
import { KIDS_ACTIVITIES } from "../../data/kidsActivities.js";
import SiteFooter from "../SiteFooter.jsx";
import CurrencySelector from "../Tours/CurrencySelector.jsx";

import {
  computePricing,
  convertPrice,
  formatMoney,
  getFee,
} from "../../utils/pricingEngine.js";
import { useCurrency } from "../../utils/currency";

import {
  ageToBand,
  BAND_AGE,
  getTourSlug,
  getTourGallery,
  MAX_GUESTS,
} from "./BookingConstants.js";

import { ToggleOption, CheckoutCartIcon } from "./BookingUi.jsx";
import { resolveImage } from "../../utils/ImageLoader";

import {
  TourGallery,
  TravellerDetailsSection,
  GroupSizeSection,
  PickupLocationSection,
} from "./BookingSections.jsx";

const DEFAULT_CENTER = [-33.9249, 18.4241];

const buildSeatAssignments = (adults, childAges, maxGuests = MAX_GUESTS) => {
  const assignments = Array(maxGuests).fill(null);
  let i = 0;
  const adultN = Math.max(Number(adults || 0), 0);
  for (let n = 0; n < adultN && i < maxGuests; n++) {
    assignments[i++] = "adult";
  }
  for (const raw of childAges || []) {
    if (i >= maxGuests) break;
    assignments[i++] = ageToBand(Number(raw));
  }
  return assignments;
};

const deriveSeatState = (assignments) => {
  const bandCounts = { adult: 0, teen: 0, child: 0, toddler: 0 };
  const childAgesArr = [];
  let participantCount = 0;
  for (const band of assignments || []) {
    if (!band) continue;
    bandCounts[band] = (bandCounts[band] || 0) + 1;
    participantCount++;
    const age = BAND_AGE[band];
    if (age !== undefined) childAgesArr.push(age);
  }
  return {
    bandCounts,
    adults: Math.max(bandCounts.adult, 1),
    childAges: childAgesArr,
    children: bandCounts.child,
    teens: bandCounts.teen,
    toddlers: bandCounts.toddler,
    participantCount,
  };
};

const clampAssignments = (assignments, limit) => {
  let kept = 0;
  return (assignments || []).map((band) => {
    if (!band) return null;
    if (kept < limit) {
      kept++;
      return band;
    }
    return null;
  });
};

const Booking = ({ embeddedTour, bookingData }) => {
  const nav = useNavigate();
  const location = useLocation();

  const tour = embeddedTour || location.state?.tour;
  const isEmbedded = Boolean(embeddedTour);

  // ─── Refs ────────────────────────────────────────────────────
  const pageRef = useRef(null);
  const backRef = useRef(null);
  const cardRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const checkoutRef = useRef(null);
  const bottomRef = useRef(null);
  const pickupFeedbackRef = useRef(null);
  const activeImageRef = useRef(null);

  // ─── Currency (global store shared with every CurrencySelector) ───
  const { code: currency, setCode: setCurrency, live } = useCurrency();

  // ─── Gallery ─────────────────────────────────────────────────
  const gallery = useMemo(() => (tour ? getTourGallery(tour) : []), [tour]);
  const [activeImage, setActiveImage] = useState(0);

  const fallbackImage = tour?.image || "/images/content/random/1.webp";

  // ─── Form state ──────────────────────────────────────────────
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    date: "",
    selectedExtras: {},
    seatAssignments: Array(MAX_GUESTS).fill(null),
    adults: "1",
    children: "0",
    childAges: [],
    participants: "0",
    pickupLocation: "",
    pickupCoords: null,
    isPrivate: false,
    isCustom: false,
    ccParticipants: false,
    participantEmails: [],
    selectedKidsActivity: null,
    selectedOption: null,
  });

  const [activeBrush, setActiveBrush] = useState("adult");

  const [travellerSnapshot, setTravellerSnapshot] = useState(null);
  const [groupSnapshot, setGroupSnapshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [verifyStatus, setVerifyStatus] = useState("idle");
  const [verifyError, setVerifyError] = useState("");
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [verifyRetry, setVerifyRetry] = useState(0);

  // ─── Derived seat state ──────────────────────────────────────
  const seatDerived = useMemo(
    () => deriveSeatState(formData.seatAssignments),
    [formData.seatAssignments],
  );

  const adultCount = seatDerived.adults;
  const childAges = seatDerived.childAges;
  const bandCounts = seatDerived.bandCounts;
  const participantCount = seatDerived.participantCount;
  const toddlers = seatDerived.toddlers;
  const childCount = seatDerived.children;
  const teens = seatDerived.teens;

  const minPeople = tour?.minPeople ?? 1;
  const childFriendly = tour?.childFriendly !== false;

  // Tour-specific cap (tour.maxPeople), never above vehicle capacity.
  // Ignored when missing or lower than minPeople.
  const rawMaxPeople = Number(tour?.maxPeople);
  const tourMaxPeople =
    Number.isFinite(rawMaxPeople) &&
    Math.floor(rawMaxPeople) >= Math.max(minPeople, 1)
      ? Math.floor(rawMaxPeople)
      : null;
  const maxPeople = Math.min(MAX_GUESTS, tourMaxPeople ?? MAX_GUESTS);

  // ─── Seat helpers ────────────────────────────────────────────
  const syncSeatDerived = (prev, assignments) => {
    const d = deriveSeatState(assignments);
    const maxEmails = Math.max(d.participantCount - 1, 0);
    return {
      ...prev,
      seatAssignments: assignments,
      adults: String(d.adults),
      children: String(d.children),
      childAges: d.childAges,
      participants: String(d.participantCount),
      participantEmails: (prev.participantEmails || []).slice(0, maxEmails),
      ccParticipants: maxEmails === 0 ? false : prev.ccParticipants,
    };
  };

  const handleSeatTap = (seatIndex) => {
    if (seatIndex < 0 || seatIndex >= MAX_GUESTS) return;

    const assignments =
      formData.seatAssignments || Array(MAX_GUESTS).fill(null);
    const current = assignments[seatIndex];

    if (current) {
      if (participantCount - 1 < Math.max(minPeople, 1)) return;
      if (current === "adult") {
        const adultSeats = assignments.filter((a) => a === "adult").length;
        if (adultSeats <= 1) return;
      }

      setFormData((prev) => {
        const p = prev.seatAssignments || Array(MAX_GUESTS).fill(null);
        if (p.filter(Boolean).length >= maxPeople) return prev;
        const next = [...p];
        next[seatIndex] = band;
        return syncSeatDerived(prev, next);
      });
      return;
    }

    const band =
      activeBrush === "adult" || (activeBrush && childFriendly)
        ? activeBrush
        : "adult";

    setFormData((prev) => {
      const p = prev.seatAssignments || Array(MAX_GUESTS).fill(null);
      const next = [...p];
      next[seatIndex] = band;
      return syncSeatDerived(prev, next);
    });
  };

  const handleBrushToggle = (bandKey) => {
    if (bandKey !== "adult" && !childFriendly) return;
    setActiveBrush((prev) => (prev === bandKey ? null : bandKey));
  };

  const handleResetSeats = () => {
    const start = Math.max(1, Math.min(minPeople, maxPeople));
    const assignments = Array(MAX_GUESTS).fill(null);
    for (let i = 0; i < start; i++) assignments[i] = "adult";
    setFormData((prev) => syncSeatDerived(prev, assignments));
    setActiveBrush("adult");
  };

  useEffect(() => {
    if (!childFriendly && activeBrush && activeBrush !== "adult") {
      setActiveBrush("adult");
    }
  }, [childFriendly, activeBrush]);

  // ─── Pricing ─────────────────────────────────────────────────
  const pricing = useMemo(
    () =>
      computePricing({
        tour,
        childAges,
        adultCount,
        currency,
        live,
        selectedOption: formData.selectedOption,
        selectedExtras: formData.selectedExtras || {},
        formData,
        kidsActivities: KIDS_ACTIVITIES,
      }),
    [
      tour,
      childAges,
      adultCount,
      currency,
      formData.selectedOption,
      formData.selectedExtras,
      formData.isPrivate,
      formData.isCustom,
      formData.selectedKidsActivity,
    ],
  );

  const displayPrivateFeeAmount = formatMoney(
    convertPrice(getFee(tour, "private"), currency),
    currency,
  );
  const displayCustomFeeAmount = formatMoney(
    convertPrice(getFee(tour, "custom"), currency),
    currency,
  );

  // ─── Completion flags ────────────────────────────────────────
  const normalizedParticipantEmails = (formData.participantEmails || [])
    .map((email) => email.trim())
    .filter(Boolean);

  const contactDetailsComplete = Boolean(
    formData.fullName.trim() && formData.mobile.trim() && formData.email.trim(),
  );
  const dateDetailsComplete = Boolean(formData.date);
  const travellerDetailsComplete =
    contactDetailsComplete && dateDetailsComplete;
  const pickupDetailsComplete = Boolean(formData.pickupCoords);

  // ─── Map state ───────────────────────────────────────────────
  const [mapCenter, setMapCenter] = useState({
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1],
  });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showPickupPicker, setShowPickupPicker] = useState(true);
  const [pendingPickup, setPendingPickup] = useState(null);
  const [showTravellerEditor, setShowTravellerEditor] = useState(true);
  const [showGroupEditor, setShowGroupEditor] = useState(true);

  // ─── Handlers ────────────────────────────────────────────────
  const handleBack = () => {
    if (window.lenis) {
      window.lenis.stop();
      window.lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    }
    requestAnimationFrame(() => nav(-1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleOption = (name) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleTravellerEdit = () => {
    setTravellerSnapshot({
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      date: formData.date,
    });
    setShowTravellerEditor(true);
  };

  const handleTravellerSave = () => {
    setTravellerSnapshot(null);
    setShowTravellerEditor(false);
  };

  const handleTravellerCancel = () => {
    if (travellerSnapshot) {
      setFormData((prev) => ({ ...prev, ...travellerSnapshot }));
    }
    setTravellerSnapshot(null);
    setShowTravellerEditor(false);
  };

  const handleResetTraveller = () => {
    setFormData((prev) => ({
      ...prev,
      fullName: "",
      mobile: "",
      email: "",
      date: "",
    }));
  };

  const openGroupEditor = () => {
    setGroupSnapshot({
      seatAssignments: [...(formData.seatAssignments || [])],
      adults: formData.adults,
      children: formData.children,
      childAges: [...(formData.childAges || [])],
      participants: formData.participants,
      participantEmails: [...(formData.participantEmails || [])],
      ccParticipants: formData.ccParticipants,
    });
    setShowGroupEditor(true);
  };

  const cancelGroupEdit = () => {
    if (groupSnapshot) {
      setFormData((prev) => ({ ...prev, ...groupSnapshot }));
    }
    setGroupSnapshot(null);
    setShowGroupEditor(false);
  };

  const confirmGroup = () => {
    setGroupSnapshot(null);
    setShowGroupEditor(false);
  };

  const handlePickupInputChange = (e) => {
    const { value } = e.target;
    setPendingPickup(null);
    setMarkerPosition(null);
    setShowPickupPicker(true);
    setFormData((prev) => ({
      ...prev,
      pickupLocation: value,
      pickupCoords: null,
    }));
  };

  const handleConfirmPickupLocation = () => {
    if (!pendingPickup?.coords) return;
    setFormData((prev) => ({
      ...prev,
      pickupLocation: pendingPickup.location,
      pickupCoords: pendingPickup.coords,
    }));
    setPendingPickup(null);
    setShowPickupPicker(false);
  };

  const handleMapPick = async (coords) => {
    setMarkerPosition(coords);
    setMapCenter(coords);
    setLocationError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`,
      );
      const data = await res.json();
      setPendingPickup({
        location:
          data?.display_name ||
          `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        coords,
      });
    } catch {
      setPendingPickup({
        location: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
        coords,
      });
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
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      if (!data.length) {
        setLocationError("No matching location found.");
        return;
      }
      const result = data[0];
      const coords = { lat: Number(result.lat), lng: Number(result.lon) };
      setMarkerPosition(coords);
      setMapCenter(coords);
      setPendingPickup({
        location: result.display_name || formData.pickupLocation,
        coords,
      });
    } catch {
      setLocationError("Could not find that address.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePickupReset = () => {
    setPendingPickup(null);
    setMarkerPosition(null);
    setFormData((prev) => ({
      ...prev,
      pickupLocation: "",
      pickupCoords: null,
    }));
    setLocationError("");
  };

  const handlePickupChange = () => {
    setPendingPickup(null);
    setMarkerPosition(null);
    setShowPickupPicker(true);
    setFormData((prev) => ({
      ...prev,
      pickupLocation: "",
      pickupCoords: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const requiredFields = [
      "fullName",
      "mobile",
      "email",
      "date",
      "pickupLocation",
    ];
    if (requiredFields.some((field) => !formData[field])) {
      alert("Please fill in all fields");
      return;
    }
    if (!formData.pickupCoords) {
      alert("Please confirm your pickup point on the map.");
      return;
    }
    const invalidParticipantEmail = normalizedParticipantEmails.find(
      (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    );
    if (invalidParticipantEmail) {
      alert(`Please check this participant email: ${invalidParticipantEmail}`);
      return;
    }

    if (verifyStatus === "failed") {
      setVerifyRetry((n) => n + 1);
      return;
    }

    if (verifyStatus !== "verified" && !pricing.isCustomQuote) {
      setSubmitError("Please wait for the price to be verified.");
      return;
    }

    const bookingDetails = {
      ...formData,
      adults: adultCount,
      children: childCount,
      toddlers,
      teens,
      childAges,
      participants: String(participantCount),
      participantEmails: normalizedParticipantEmails,
      ccParticipantEmails: formData.ccParticipants
        ? normalizedParticipantEmails
        : [],
      selectedExtras: formData.selectedExtras || {},
      selectedKidsActivity: formData.selectedKidsActivity,
      kidsActivityFee: pricing.kidsActivityTotal,
      seatAssignments: formData.seatAssignments,
      pricingOptions: {
        isPrivate: formData.isPrivate,
        isCustom: formData.isCustom,
        privateFee: pricing.privateFee,
        customFee: pricing.customFee,
        groupDiscountPercent: pricing.groupDiscountPercent,
        groupDiscountAmount: pricing.groupDiscountAmount,
        subtotalBeforeGroupDiscount: pricing.originalSubtotal,
        discountedTourSubtotal: pricing.discountedSubtotal,
        extrasTotal: pricing.extrasTotal,
        kidsActivityFee: pricing.kidsActivityTotal,
        estimatedTotal: pricing.finalTotal,
        currency,
      },
    };

    setSubmitting(true);
    try {
      nav("/checkout", {
        state: {
          tour,
          bookingDetails,
          selectedCurrency: currency,
          priceToken: verifiedToken || undefined,
          isCustomQuote: pricing.isCustomQuote || undefined,
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setActiveImage(0);
  }, [tour]);

  const prevTourSlugRef = useRef(null);
  useEffect(() => {
    if (!tour) return;
    const tourSlug = getTourSlug(tour);
    const isTourSwitch =
      prevTourSlugRef.current !== null && prevTourSlugRef.current !== tourSlug;
    if (isTourSwitch && tour.childFriendly === false) {
      setFormData((prev) => {
        const current = prev.seatAssignments || Array(MAX_GUESTS).fill(null);
        const next = current.map((b) => (b === "adult" ? "adult" : null));
        return syncSeatDerived(prev, next);
      });
      setActiveBrush("adult");
    }
    prevTourSlugRef.current = tourSlug;
  }, [tour]);

  const prevBookingDataRef = useRef();
  useEffect(() => {
    if (!bookingData) return;
    const currentKey = JSON.stringify(bookingData);
    if (prevBookingDataRef.current === currentKey) return;

    const bd = bookingData;
    const updates = {};

    if (bd.fullName !== undefined) updates.fullName = bd.fullName;
    if (bd.mobile !== undefined) updates.mobile = bd.mobile;
    if (bd.email !== undefined) updates.email = bd.email;
    if (bd.date) {
      const dateObj = new Date(bd.date);
      updates.date = isNaN(dateObj.getTime())
        ? bd.date
        : dateObj.toISOString().split("T")[0];
    }

    let nextAssignments = null;
    if (Array.isArray(bd.seatAssignments)) {
      nextAssignments = Array(MAX_GUESTS)
        .fill(null)
        .map((_, i) => bd.seatAssignments[i] || null);
    } else if (
      bd.adults !== undefined ||
      Array.isArray(bd.childAges) ||
      bd.children !== undefined
    ) {
      const incomingChildAges = Array.isArray(bd.childAges)
        ? bd.childAges
            .map((age) => Number(age))
            .filter((age) => Number.isFinite(age))
        : Array.from({ length: Number(bd.children || 0) }, () => 8);
      nextAssignments = buildSeatAssignments(
        Number(bd.adults || 1),
        incomingChildAges,
      );
    }
    if (nextAssignments) {
      updates.seatAssignments = nextAssignments;
      const d = deriveSeatState(nextAssignments);
      updates.adults = String(d.adults);
      updates.children = String(d.children);
      updates.childAges = d.childAges;
      updates.participants = String(d.participantCount);
    }

    if (bd.pickupLocation !== undefined)
      updates.pickupLocation = bd.pickupLocation;
    if (bd.pickupCoords?.lat && bd.pickupCoords?.lng) {
      updates.pickupCoords = {
        lat: bd.pickupCoords.lat,
        lng: bd.pickupCoords.lng,
      };
    }
    if (bd.isPrivate !== undefined) updates.isPrivate = bd.isPrivate;
    if (bd.isCustom !== undefined) updates.isCustom = bd.isCustom;
    if (bd.ccParticipants !== undefined)
      updates.ccParticipants = bd.ccParticipants;
    if (Array.isArray(bd.participantEmails))
      updates.participantEmails = bd.participantEmails;
    if (bd.selectedOption !== undefined)
      updates.selectedOption = bd.selectedOption;
    if (bd.selectedKidsActivity !== undefined)
      updates.selectedKidsActivity = bd.selectedKidsActivity;
    if (bd.selectedExtras !== undefined)
      updates.selectedExtras = bd.selectedExtras;

    if (Object.keys(updates).length) {
      setFormData((prev) => ({ ...prev, ...updates }));
    }

    if (updates.pickupCoords) {
      setMarkerPosition(updates.pickupCoords);
      setMapCenter(updates.pickupCoords);
      setShowPickupPicker(false);
      setPendingPickup(null);
    }

    if (updates.seatAssignments) {
      setShowGroupEditor(false);
    }

    const preferredCurrency =
      bd.selectedCurrency || bd.pricingOptions?.currency;
    if (preferredCurrency) {
      setCurrency(preferredCurrency);
    }

    prevBookingDataRef.current = currentKey;
  }, [bookingData]);

  const defaultInitializedRef = useRef(false);
  useEffect(() => {
    if (!tour || bookingData || defaultInitializedRef.current) return;
    defaultInitializedRef.current = true;
    const start = Math.max(1, Math.min(minPeople, maxPeople));
    const assignments = Array(MAX_GUESTS).fill(null);
    for (let i = 0; i < start; i++) assignments[i] = "adult";
    setFormData((prev) => syncSeatDerived(prev, assignments));
  }, [tour, bookingData, minPeople]);

  useEffect(() => {
    if (!tour) nav("/");
  }, [tour, nav]);

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
    if (gallery.length < 2) return;
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
      { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out" },
    );
  }, [activeImage]);

  useEffect(() => {
    if (!formData.pickupCoords || !pickupFeedbackRef.current) return;
    gsap.fromTo(
      pickupFeedbackRef.current,
      { y: 10, scale: 0.985, autoAlpha: 0.82 },
      { y: 0, scale: 1, autoAlpha: 1, duration: 0.42, ease: "back.out(1.7)" },
    );
  }, [formData.pickupCoords]);

  useLayoutEffect(() => {
    if (!tour) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (!isEmbedded && backRef.current) {
        tl.fromTo(
          backRef.current,
          { opacity: 0, x: -18 },
          { opacity: 1, x: 0, duration: 0.45 },
        );
      }
      if (cardRef.current) {
        tl.fromTo(
          cardRef.current,
          {
            opacity: 0,
            y: isEmbedded ? 18 : 36,
            scale: isEmbedded ? 1 : 0.985,
          },
          { opacity: 1, y: 0, scale: 1, duration: isEmbedded ? 0.45 : 0.65 },
          isEmbedded ? 0 : "-=0.15",
        );
      }
      if (!isEmbedded && leftRef.current) {
        tl.fromTo(
          leftRef.current,
          { opacity: 0, x: -34 },
          { opacity: 1, x: 0, duration: 0.55 },
          "-=0.45",
        );
      }
      if (rightRef.current) {
        tl.fromTo(
          rightRef.current,
          { opacity: 0, x: isEmbedded ? 0 : 34, y: isEmbedded ? 14 : 0 },
          { opacity: 1, x: 0, y: 0, duration: isEmbedded ? 0.42 : 0.55 },
          isEmbedded ? "-=0.2" : "-=0.5",
        );
      }
      if (checkoutRef.current) {
        tl.fromTo(
          checkoutRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.15",
        );
      }
      if (bottomRef.current) {
        tl.fromTo(
          bottomRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.12",
        );
      }
    }, pageRef);
    return () => ctx.revert();
  }, [tour, isEmbedded]);

  useEffect(() => {
    if (!tour) return;

    if (pricing.isCustomQuote) {
      setVerifyStatus("idle");
      setVerifyError("");
      setVerifiedToken(null);
      return;
    }

    const readyToVerify =
      contactDetailsComplete &&
      dateDetailsComplete &&
      pickupDetailsComplete &&
      (!pricing.hasOptions || formData.selectedOption);

    if (!readyToVerify) {
      setVerifyStatus("idle");
      setVerifyError("");
      setVerifiedToken(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setVerifyStatus("pending");
    setVerifyError("");
    setVerifiedToken(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/verify-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            tourId: tour.id ?? getTourSlug(tour),
            adultCount,
            childAges,
            currency,
            selectedOption: formData.selectedOption,
            selectedExtras: formData.selectedExtras || {},
            isPrivate: formData.isPrivate,
            isCustom: formData.isCustom,
            selectedKidsActivity: formData.selectedKidsActivity,
          }),
        });

        if (cancelled) return;

        const contentType = res.headers.get("content-type") || "";
        const looksLikeHtml = contentType.includes("text/html");

        if (res.status === 404 || res.status === 405 || looksLikeHtml) {
          console.warn(
            "[Booking] /api/verify-price unavailable; using client-side price.",
          );
          setVerifyStatus("verified");
          setVerifiedToken(null);
          return;
        }

        if (!res.ok) {
          let detail = "";
          try {
            const errBody = await res.json();
            detail = errBody?.error || errBody?.message || "";
          } catch {
            /* body wasn't JSON */
          }
          throw new Error(detail || `HTTP ${res.status}`);
        }

        const data = await res.json();
        if (cancelled) return;

        if (data?.isCustomQuote) {
          setVerifyStatus("idle");
          return;
        }

        setVerifyStatus("verified");
        setVerifiedToken(data?.token || null);
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        console.error("[Booking] Price verification failed:", err);
        setVerifyStatus("failed");
        setVerifyError(err?.message || "Price verification failed");
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    tour,
    adultCount,
    JSON.stringify(childAges),
    currency,
    formData.selectedOption,
    JSON.stringify(formData.selectedExtras),
    formData.isPrivate,
    formData.isCustom,
    formData.selectedKidsActivity,
    contactDetailsComplete,
    dateDetailsComplete,
    pickupDetailsComplete,
    pricing.isCustomQuote,
    pricing.hasOptions,
    verifyRetry,
  ]);

  if (!tour) return null;

  return (
    <div
      ref={pageRef}
      className={`relative overflow-hidden text-neutral-900 ${
        isEmbedded ? "min-h-0 bg-transparent" : "min-h-screen bg-stone-50"
      }`}
    >
      <img
        src="/assets/content/clip-art/section1-bg.png"
        alt=""
        className={`pointer-events-none absolute z-10 h-full w-full select-none object-contain opacity-90 ${
          isEmbedded ? "hidden" : ""
        }`}
      />

      <div
        className={`absolute inset-0 bg-gradient-to-b from-white/70 via-stone-50/90 to-sky-100/80 ${
          isEmbedded ? "hidden" : ""
        }`}
      />

      <div
        className={`relative z-10 ${
          isEmbedded
            ? "px-4 py-0 sm:px-5"
            : "px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-20"
        }`}
      >
        <div
          ref={backRef}
          className={`mx-auto mb-6 max-w-7xl ${isEmbedded ? "hidden" : ""}`}
        >
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
          className={`mx-auto border border-black/5 bg-white/92 backdrop-blur-md ${
            isEmbedded
              ? "max-w-6xl rounded-[1.5rem] shadow-[0_16px_48px_rgba(37,99,235,0.08)]"
              : "max-w-7xl rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.10)] overflow-hidden"
          }`}
        >
          <div
            className={`min-w-0 grid grid-cols-1 ${
              isEmbedded ? "" : "lg:grid-cols-[0.95fr_1.05fr]"
            }`}
          >
            {!isEmbedded && (
              <div ref={leftRef} className="relative min-w-0 bg-neutral-100">
                <TourGallery
                  tour={tour}
                  gallery={gallery}
                  activeImage={activeImage}
                  setActiveImage={setActiveImage}
                  activeImageRef={activeImageRef}
                  fallbackImage={fallbackImage}
                  currency={currency}
                />
              </div>
            )}

            <div
              ref={rightRef}
              className={`group/right relative w-full min-w-0 ${
                isEmbedded
                  ? "p-3 sm:p-5 md:p-6 lg:p-7"
                  : "p-4 sm:p-5 md:p-7 lg:p-8"
              }`}
            >
              <div className="relative z-10 w-full min-w-0">
                {/* Compact Tour Header */}
                <div className="mb-6 flex flex-col items-center text-center">
                  <h2 className="max-w-3xl font-frank text-3xl font-bold leading-tight text-neutral-950 sm:text-4xl drop-shadow-sm">
                    {tour.title || tour.info}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                    {tour.duration && <span>{tour.duration}</span>}
                    {tour.duration && tour.location && (
                      <span className="opacity-50 text-black">•</span>
                    )}
                    {tour.location && <span>{tour.location}</span>}
                  </div>
                </div>

                <div className="mb-5 flex items-center justify-center gap-3">
                  <span className="font-bitter text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Currency
                  </span>
                  <CurrencySelector className="!w-auto" />
                </div>

                {Array.isArray(tour?.options) && tour.options.length > 0 && (
                  <TourOptions
                    tour={tour}
                    selectedOption={formData?.selectedOption}
                    onOptionChange={(optionId) =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedOption: optionId,
                      }))
                    }
                  />
                )}

                <form
                  id="booking-form"
                  onSubmit={handleSubmit}
                  className="mt-5 grid grid-cols-1 gap-5 min-w-0"
                >
                  <TravellerDetailsSection
                    formData={formData}
                    onChange={handleChange}
                    complete={travellerDetailsComplete}
                    isEditing={showTravellerEditor}
                    hasSnapshot={Boolean(travellerSnapshot)}
                    onRequestEdit={handleTravellerEdit}
                    onSaveEdit={handleTravellerSave}
                    onCancelEdit={handleTravellerCancel}
                    onResetTraveller={handleResetTraveller}
                  />

                  <GroupSizeSection
                    tour={tour}
                    seatAssignments={formData.seatAssignments}
                    activeBrush={activeBrush}
                    bandCounts={bandCounts}
                    participantCount={participantCount}
                    minPeople={minPeople}
                    maxGuests={maxPeople}
                    tourMaxPeople={tourMaxPeople}
                    childFriendly={childFriendly}
                    isEditing={showGroupEditor}
                    hasSnapshot={Boolean(groupSnapshot)}
                    onSeatTap={handleSeatTap}
                    onBrushToggle={handleBrushToggle}
                    onResetSeats={handleResetSeats}
                    onOpenEditor={openGroupEditor}
                    onCancelEdit={cancelGroupEdit}
                    onConfirm={confirmGroup}
                  />

                  <PickupLocationSection
                    formData={formData}
                    onInputChange={handlePickupInputChange}
                    showPicker={showPickupPicker}
                    pendingPickup={pendingPickup}
                    markerPosition={markerPosition}
                    mapCenter={mapCenter}
                    locationLoading={locationLoading}
                    locationError={locationError}
                    onConfirm={handleConfirmPickupLocation}
                    onFind={handleFindAddress}
                    onMapPick={handleMapPick}
                    onReset={handlePickupReset}
                    onChangeClick={handlePickupChange}
                    pickupFeedbackRef={pickupFeedbackRef}
                  />

                  {/* MOVED HERE: KidsActivities as the 4th block */}
                  <KidsActivities
                    childFriendly={tour?.childFriendly === true}
                    adultCount={adultCount}
                    childCount={childCount}
                    toddlerCount={toddlers}
                    selectedActivity={formData.selectedKidsActivity}
                    onActivityChange={(activityId) =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedKidsActivity: activityId,
                      }))
                    }
                  />
                </form>

                <div ref={checkoutRef} className="mt-6 w-full min-w-0">
                  <CheckoutSummary
                    tour={tour}
                    adultCount={adultCount}
                    childCount={childCount}
                    toddlerCount={toddlers}
                    currency={currency}
                    selectedOption={formData?.selectedOption}
                    selectedExtras={formData.selectedExtras}
                    formData={formData}
                    contactDetailsComplete={contactDetailsComplete}
                    dateDetailsComplete={dateDetailsComplete}
                    pickupDetailsComplete={pickupDetailsComplete}
                    isEmbedded={isEmbedded}
                    CheckoutCartIcon={CheckoutCartIcon}
                    checkoutRef={checkoutRef}
                    submitting={submitting}
                    submitError={submitError}
                    verifyStatus={verifyStatus}
                    verifyError={verifyError}
                    onExtrasChange={(newExtras) =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedExtras: newExtras,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isEmbedded && (
          <div className="mx-auto mt-12 w-full min-w-0 max-w-7xl">
            <SiteFooter />
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
