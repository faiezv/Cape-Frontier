// src/data/vehicles.js

export const VEHICLE_CATEGORIES = {
  COMPACT: "compact",
  PREMIUM: "premium",
  GROUP: "group",
};

export const vehicles = [
  {
    id: "mitsubishi-xpander",
    name: "Mitsubishi Xpander",
    category: VEHICLE_CATEGORIES.COMPACT,
    type: "Compact 7-seater tour vehicle",
    image: "/images/content/vehicles/mitsubishi-xpander.webp",
    capacity: "Up to 6 passengers",
    luggage: "Light luggage",
    transmission: "Automatic",
    color: "Silver",
    bestFor: ["Half-day tours", "Small families", "Private city trips"],
    description:
      "A compact and comfortable 7-seater vehicle suited for smaller groups, short tours, airport-style transfers, and flexible Cape Town travel days.",
    features: [
      "Air-conditioned cabin",
      "Comfortable seating",
      "Compact and easy for city routes",
      "Ideal for small private groups",
    ],
  },

  {
    id: "hyundai-staria-white",
    name: "Hyundai Staria",
    category: VEHICLE_CATEGORIES.PREMIUM,
    type: "Premium group transfer vehicle",
    image: "/images/content/vehicles/hyundai-staria-white.webp",
    capacity: "Up to 8 passengers",
    luggage: "Medium luggage",
    transmission: "Automatic",
    color: "White",
    bestFor: ["Group tours", "Private transfers", "Full-day tours"],
    description:
      "A modern, spacious people-carrier with a premium look and comfortable cabin space, ideal for group tours and private transfers around Cape Town.",
    features: [
      "Spacious interior",
      "Large tinted windows",
      "Sliding doors",
      "Comfortable for longer routes",
    ],
  },

  {
    id: "hyundai-staria-silver",
    name: "Hyundai Staria",
    category: VEHICLE_CATEGORIES.PREMIUM,
    type: "Premium group transfer vehicle",
    image: "/images/content/vehicles/hyundai-staria-silver.webp",
    capacity: "Up to 8 passengers",
    luggage: "Medium luggage",
    transmission: "Automatic",
    color: "Silver",
    bestFor: ["Group tours", "Wine routes", "Peninsula tours"],
    description:
      "A sleek silver Hyundai Staria suitable for premium private tours, wine routes, coastal drives, and comfortable group travel.",
    features: [
      "Modern premium design",
      "Air-conditioned cabin",
      "Good passenger space",
      "Ideal for full-day touring",
    ],
  }
];

export const getVehicleById = (id) => {
  return vehicles.find((vehicle) => vehicle.id === id);
};

export const getVehiclesByCategory = (category) => {
  return vehicles.filter((vehicle) => vehicle.category === category);
};

export default vehicles;