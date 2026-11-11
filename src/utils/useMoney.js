// src/utils/useMoney.js
import { useCallback } from "react";
import { useCurrency } from "./currency";
import { convertPrice, formatMoney } from "./pricingEngine.js";

/** Returns money(zarAmount) -> "€254.10" etc. in the currently selected currency. */
export default function useMoney() {
  const { code, live } = useCurrency();

  // `live` is in the deps so values refresh when live rates arrive
  const money = useCallback(
    (zarAmount) => formatMoney(convertPrice(Number(zarAmount) || 0, code), code),
    [code, live],
  );

  return { money, currency: code };
}