import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

export const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#60a5fa",
    colorBackground: "#ffffff",
    colorText: "#1e293b",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    fontFamily: "Bitter, Arial, sans-serif",
    borderRadius: "16px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      backgroundColor: "#ffffff",
      border: "1px solid #dbeafe",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #60a5fa",
      boxShadow: "0 0 0 3px rgba(96,165,250,0.12)",
    },
    ".Tab": {
      backgroundColor: "#ffffff",
      border: "1px solid #e0f2fe",
      boxShadow: "none",
    },
    ".Tab--selected": {
      backgroundColor: "#eff6ff",
      border: "1px solid #60a5fa",
      boxShadow: "none",
    },
    ".Label": {
      color: "#64748b",
    },
    ".Error": {
      color: "#ef4444",
    },
    ".Block": {
      backgroundColor: "#ffffff",
      boxShadow: "none",
    },
  },
};