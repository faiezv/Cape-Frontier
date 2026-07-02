import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const policies = [
  {
    id: "pickup-window",
    eyebrow: "Pick-Up Window",
    title: "Pick-Up Window",
    summary:
      "Customers should be ready during the specified pickup window.",
    points: [
      'Your driver may arrive anytime within a 10–15 minute pickup window.',
      "Please be ready outside your accommodation before the start of your pickup window.",
    ],
  },

  {
    id: "waiting-time-limit",
    eyebrow: "Waiting Time Limit",
    title: "Waiting Time Limit",
    summary:
      "Drivers can only wait for a limited amount of time before continuing.",
    points: [
      "Our drivers will wait for a maximum of 10–15 minutes.",
      "After the waiting period has expired, the booking will be treated as a no-show and the tour will continue.",
    ],
  },

  {
    id: "no-show-policy",
    eyebrow: "No-Show Policy",
    title: "No-Show Policy",
    summary:
      "Failure to arrive for pickup may result in forfeiture of the booking.",
    points: [
      "If the guest is not present at the agreed pickup time and cannot be reached via WhatsApp or phone call, the booking will be considered a no-show.",
      "No refund will be issued unless a valid reason is accepted by Cape Frontier.",
      "Where appropriate, a partial refund may be considered at Cape Frontier's discretion.",
    ],
  },

  {
    id: "shared-vs-private-transfers",
    eyebrow: "Shared vs Private Transfers",
    title: "Shared vs Private Transfers",
    summary:
      "Pickup times may vary depending on the type of transfer booked.",
    points: [
      "Shared tours may include multiple pickups.",
      "Pickup times can vary depending on traffic, route planning, and other guests.",
      "Private tours generally have more direct pickup arrangements.",
    ],
  },

  {
    id: "communication-requirement",
    eyebrow: "Communication Requirement",
    title: "Communication Requirement",
    summary:
      "Guests must remain reachable on the morning of the tour.",
    points: [
      "Guests must be contactable via WhatsApp, SMS, or phone call on the morning of the tour.",
      "Please ensure your provided contact number is active.",
    ],
  },

  {
    id: "vehicle-identification",
    eyebrow: "Vehicle Identification",
    title: "Vehicle Identification",
    summary:
      "You'll receive information to help identify your driver and vehicle.",
    points: [
      "Cape Frontier will provide vehicle identification details where applicable.",
      "This may include the driver's name, vehicle registration number, or Cape Frontier branding.",
    ],
  },

  {
    id: "special-conditions",
    eyebrow: "Special Conditions",
    title: "Special Conditions",
    summary:
      "Certain tours require stricter pickup times.",
    points: [
      "Sunrise tours, early-morning hikes, and airport pickups may require stricter timing.",
      "Guests should be ready earlier where instructed.",
    ],
  },

  {
    id: "accessibility-notes",
    eyebrow: "Accessibility Notes",
    title: "Accessibility Notes",
    summary:
      "Some pickup locations may require alternative meeting points.",
    points: [
      "Certain accommodations may have restricted vehicle access.",
      "Examples include narrow streets, gated communities, and security-controlled properties.",
      "Where necessary, Cape Frontier will provide an alternative nearby pickup location.",
    ],
  },

  {
    id: "weather-safety-adjustments",
    eyebrow: "Weather & Safety Adjustments",
    title: "Weather or Safety Adjustments",
    summary:
      "Pickup times may change if operational conditions require it.",
    points: [
      "Pickup times may be adjusted due to severe weather.",
      "Road closures, public safety concerns, or other operational issues may also affect pickup schedules.",
      "Guests will be notified as soon as reasonably possible of any changes.",
    ],
  },
];

const Policies = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pageRef = useRef(null);
  const policyGridRef = useRef(null);
  const sidebarRef = useRef(null);

  const activeHash = location.hash?.replace("#", "") || "booking-policy";

  const activePolicy = useMemo(() => {
    return policies.find((policy) => policy.id === activeHash) || policies[0];
  }, [activeHash]);

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (!hash) return;

    const timer = window.setTimeout(() => {
      const element = document.getElementById(hash);
      if (!element) return;

      const offset = 92;
      const y = element.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: Math.max(0, y),
        behavior: "smooth",
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-policy-animate]",
        {
          opacity: 0,
          y: 24,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.045,
          ease: "power3.out",
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const section = policyGridRef.current;
    const sidebar = sidebarRef.current;

    if (!section || !sidebar) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const getPinTop = () => {
        const navClearance = 96;
        const centeredTop = (window.innerHeight - sidebar.offsetHeight) / 2;

        return Math.max(navClearance, centeredTop);
      };

      gsap.set(sidebar, {
        clearProps: "transform",
      });

      const pinTrigger = ScrollTrigger.create({
        trigger: section,
        start: () => `top top+=${getPinTop()}`,
        end: () => `bottom bottom-=${getPinTop()}`,
        pin: sidebar,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // markers: true,
      });

      ScrollTrigger.refresh();

      return () => pinTrigger.kill();
    });

    return () => mm.revert();
  }, []);

  const goToPolicy = (id) => {
    navigate(`/policies#${id}`);
  };

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-x-hidden bg-stone-50 text-neutral-950"
    >
      <section className="relative overflow-hidden bg-white pt-28">
        <img
          src="/assets/content/clip-art/section1-bg.png"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-stone-50/90 to-stone-50" />

        <div className="relative mx-auto max-w-7xl px-5 pb-10 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-green-200 hover:text-green-950"
          >
            ← Back home
          </button>

          <div data-policy-animate className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
              Cape Frontier
            </p>

            <h1 className="mt-3 font-frank text-5xl font-bold leading-[0.9] text-neutral-950 md:text-7xl">
              Policies before you book.
            </h1>

            <p className="mt-5 max-w-2xl font-bitter text-base leading-7 text-neutral-600">
              These are the current provisional Cape Frontier policies for booking,
              pickup, payment, cancellation, rescheduling, private tours, and vehicle
              arrangements. Final operational details should still be confirmed by
              Cape Frontier.
            </p>
          </div>

          <div
            data-policy-animate
            className="mt-8 rounded-[2rem] border border-black/5 bg-white/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.06)] backdrop-blur-md"
          >
            <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[1.5rem] bg-neutral-950 p-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                  Currently viewing
                </p>

                <h2 className="mt-2 font-frank text-3xl leading-none">
                  {activePolicy.eyebrow}
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/65">
                  {activePolicy.summary}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {policies.map((policy, index) => {
                  const active = policy.id === activeHash;

                  return (
                    <button
                      key={policy.id}
                      type="button"
                      onClick={() => goToPolicy(policy.id)}
                      className={`rounded-[1.25rem] border p-3 text-left transition ${active
                        ? "border-green-300 bg-green-200 text-green-950"
                        : "border-black/5 bg-neutral-50 text-neutral-650 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
                        }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-55">
                        0{index + 1}
                      </p>
                      <p className="mt-1 text-sm font-bold">{policy.eyebrow}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={policyGridRef}
        className="mx-auto grid max-w-7xl gap-6 px-5 pb-20 sm:px-6 lg:grid-cols-[16rem_1fr] lg:px-8"
      >
        <aside
          ref={sidebarRef}
          data-policy-animate
          className="hidden h-fit max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border border-black/5 bg-white/80 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.05)] backdrop-blur-md lg:block"
        >
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
            Policy menu
          </p>

          <div className="mt-1 flex flex-col gap-1">
            {policies.map((policy) => (
              <button
                key={policy.id}
                type="button"
                onClick={() => goToPolicy(policy.id)}
                className={`rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${policy.id === activeHash
                  ? "bg-blue-400 text-white"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                  }`}
              >
                {policy.eyebrow}
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-5">
          {policies.map((policy, index) => (
            <section
              key={policy.id}
              id={policy.id}
              data-policy-animate
              className="scroll-mt-28 rounded-[2rem] border border-black/5 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.05)] sm:p-7"
            >
              <div className="flex flex-col gap-4 border-b border-black/5 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-400">
                    {policy.eyebrow}
                  </p>

                  <h2 className="mt-2 font-frank text-3xl font-bold leading-none text-neutral-950 sm:text-4xl">
                    {policy.title}
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                    {policy.summary}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-500">
                  0{index + 1}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {policy.points.map((point) => (
                  <div
                    key={point}
                    className="flex gap-3 rounded-2xl border border-black/5 bg-neutral-50 p-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-200 text-xs font-bold text-green-950">
                      ✓
                    </span>

                    <p className="text-sm leading-6 text-neutral-650">{point}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Policies;
