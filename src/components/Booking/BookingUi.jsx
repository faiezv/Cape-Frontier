// src/components/Booking/BookingUi.jsx
import React from "react";

import {
  SEATS_PER_VEHICLE,
  MAX_VEHICLES,
  BAND_INITIAL,
  BAND_COLORS,
} from "./BookingConstants.js";

// ─── Form field wrapper ──────────────────────────────────────────
export function BookingField({ label, hint, children }) {
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

export function MiniAssurance({ title, text, icon = "✓" }) {
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

export function HomeIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m3 10.8 9-7 9 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CheckoutCartIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 6h14l-1.4 7.2a2 2 0 0 1-2 1.6H9.1a2 2 0 0 1-2-1.6L5.6 3.8H3" />
      <path d="M9 20.2h.01" />
      <path d="M17 20.2h.01" />
      <path d="M10 10.5h6" />
    </svg>
  );
}

export function PersonGlyph({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4 21c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5v.5H4z" />
    </svg>
  );
}

export function WheelIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2" />
      <path d="M3.5 10.5 10 12M20.5 10.5 14 12M12 14v7" />
    </svg>
  );
}

export function ToggleOption({ active, title, text, price, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex min-h-[7rem] w-full flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-300 ${active ? "border-green-300 bg-green-200 text-green-950 shadow-[0_14px_34px_rgba(34,197,94,0.18)]" : "border-black/5 bg-white text-neutral-700 hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${active ? "bg-white/70 text-green-950" : "bg-neutral-100 text-neutral-500"}`}
        >
          {icon}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${active ? "bg-white/70 text-green-950" : "bg-neutral-100 text-neutral-400"}`}
        >
          {active ? "Selected" : "Optional"}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-sm font-bold">{title}</p>
        <p
          className={`mt-1 text-xs leading-5 ${active ? "text-green-950/75" : "text-neutral-500"}`}
        >
          {text}
        </p>
        <p
          className={`mt-2 text-xs font-bold ${active ? "text-green-950" : "text-green-700"}`}
        >
          {price}
        </p>
      </div>
    </button>
  );
}

export function BandFlipSwitch({ band, checked, disabled, onToggle }) {
  const c = BAND_COLORS[band.key];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${checked ? "Disable" : "Enable"} ${band.singular} brush`}
      disabled={disabled}
      onClick={() => onToggle(band.key)}
      className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition ${
        checked
          ? "border-neutral-300 bg-white shadow-sm"
          : "border-transparent bg-neutral-50 hover:bg-white"
      } ${disabled ? "cursor-not-allowed opacity-40 hover:bg-neutral-50" : ""}`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${c.dot}`} />
        <span className="truncate text-xs font-bold text-neutral-800">
          {band.singular}
        </span>
        <span className="text-[10px] text-neutral-400">{band.range}</span>
      </span>
      <span
        className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
          checked ? c.track : "bg-neutral-300"
        }`}
      >
        <span
          className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Seat({ seatIndex, band, onClick, locked }) {
  const taken = Boolean(band);
  const blocked = locked && !taken;
  const c = taken ? BAND_COLORS[band] : null;
  const initial = taken ? BAND_INITIAL[band] : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={blocked}
      aria-label={
        taken
          ? `Remove seat ${seatIndex + 1} (${band})`
          : blocked
            ? "Group is full"
            : `Add a guest to seat ${seatIndex + 1}`
      }
      className={`relative flex h-8 w-full min-w-0 items-center justify-center rounded-md border text-[11px] font-black transition-all duration-150 active:scale-95 ${
        taken
          ? c.seat
          : blocked
            ? "cursor-not-allowed border-dashed border-neutral-200 bg-neutral-50 text-neutral-200 active:scale-100"
            : "border-dashed border-neutral-300 bg-neutral-50 text-neutral-300 hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-500"
      }`}
    >
      {taken ? initial : "+"}
    </button>
  );
}

function Vehicle({
  vehicleIndex,
  seatAssignments,
  onSeatTap,
  label,
  disabled,
  locked,
}) {
  const startIdx = vehicleIndex * SEATS_PER_VEHICLE;
  const cols = SEATS_PER_VEHICLE / 2;

  const seatAt = (row, col) => {
    const seatIdx = startIdx + col * 2 + row;
    return (
      <Seat
        key={`${row}-${col}`}
        seatIndex={seatIdx}
        band={seatAssignments[seatIdx] || null}
        locked={locked}
        onClick={() => onSeatTap(seatIdx)}
      />
    );
  };

  const taken = Array.from({ length: SEATS_PER_VEHICLE }).reduce(
    (n, _, i) => (seatAssignments[startIdx + i] ? n + 1 : n),
    0,
  );

  return (
    <div className={disabled ? "opacity-50" : ""}>
      {label && (
        <p className="mb-1 text-xs font-semibold text-neutral-500">
          {label}
          <span className="ml-1.5 font-normal text-neutral-400">
            {taken} of {SEATS_PER_VEHICLE}
          </span>
        </p>
      )}
      <div className="flex min-w-0 items-stretch overflow-hidden rounded-l-[1.75rem] rounded-r-xl border-2 border-neutral-200 bg-white shadow-sm">
        <div className="w-[12%] shrink-0 bg-gradient-to-r from-neutral-200 to-neutral-100 p-1">
          <div className="h-full rounded-l-[1.25rem] rounded-r-md bg-neutral-700/80" />
        </div>

        <div
          className="grid flex-1 grid-rows-2 gap-1.5 p-2"
          style={{ gridTemplateColumns: `repeat(${cols + 1}, minmax(0, 1fr))` }}
        >
          <div className="flex h-8 items-center justify-center rounded-md border border-neutral-900 bg-neutral-800 text-white">
            <WheelIcon className="h-4 w-4" />
          </div>
          {Array.from({ length: cols }, (_, c) => seatAt(0, c))}

          <div aria-hidden="true" />
          {Array.from({ length: cols }, (_, c) => seatAt(1, c))}
        </div>
      </div>
    </div>
  );
}

export function VehicleSeating({
  seatAssignments,
  onSeatTap,
  maxGuests = MAX_VEHICLES * SEATS_PER_VEHICLE,
}) {
  const taken = (seatAssignments || []).filter(Boolean).length;
  const locked = taken >= maxGuests;
  const vehiclesNeeded = Math.min(
    MAX_VEHICLES,
    Math.max(1, Math.ceil(maxGuests / SEATS_PER_VEHICLE)),
  );
  const vehiclesShown = Math.min(
    vehiclesNeeded,
    Math.floor(taken / SEATS_PER_VEHICLE) + 1,
  );
  const multi = vehiclesShown > 1;

  return (
    <div className="mx-auto w-full min-w-0 max-w-sm">
      {Array.from({ length: MAX_VEHICLES }, (_, v) => {
        const visible = v < vehiclesShown;
        return (
          <div
            key={v}
            aria-hidden={!visible}
            className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              visible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-3 opacity-0"
                }`}
              >
                <div className={v > 0 ? "pt-2" : ""}>
                  <Vehicle
                    vehicleIndex={v}
                    seatAssignments={seatAssignments}
                    onSeatTap={onSeatTap}
                    label={multi ? `Vehicle ${v + 1}` : ""}
                    disabled={!visible}
                    locked={locked}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
