import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const policies = [
  // {
  //   id: "booking-policy",
  //   eyebrow: "Booking policy",
  //   title: "Customers book for their own group",
  //   summary:
  //     "Customers are booking their own party size, not empty seats in a shared vehicle.",
  //   points: [
  //     "Customers book for their own group only. They are not selecting empty seats in a shared vehicle.",
  //     "The number of participants selected at checkout must match the number of guests in the customer’s own party.",
  //     "Price tiers are based on the customer’s own booking group size.",
  //     "Lower per-person rates only apply when the customer books and pays for that full number of participants.",
  //     "Total booking price = selected tier price per person × selected number of participants.",
  //     "Example: if a customer selects 7 participants, they are booking and paying for 7 people, not 1 person using the 7-person discounted rate.",
  //     "If fewer guests arrive than booked, the original booking total still applies.",
  //     "Cape Frontier may use a smaller vehicle for smaller groups.",
  //     "Separate groups on the same tour/day may be combined operationally, but each group keeps its own separate booking price based on their own selected participant count.",
  //   ],
  // },
  {
    id: "pickup-policy",
    eyebrow: "Pickup policy",
    title: "Pickup is included unless stated otherwise",
    summary:
      "Customers choose their pickup location, usually their accommodation, and Cape Frontier confirms it manually.",
    points: [
      "Pickup is included in the tour pricing unless stated otherwise.",
      "Customers choose their own pickup location, usually their accommodation.",
      "Far pickup areas currently do not cost extra unless Cape Frontier later decides otherwise.",
      "Pickup location should be confirmed manually after booking.",
    ],
  },
  {
    id: "payment-policy",
    eyebrow: "Payment policy",
    title: "Pay-now booking flow",
    summary:
      "Customers pay online first, then receive operational confirmation for pickup, vehicle, and final arrangements.",
    points: [
      "Cape Frontier currently uses a pay-now booking flow.",
      "Customer selects tour → fills booking form → goes to checkout → pays online → receives confirmation.",
      "Booking confirmation is manual/operational after payment, especially for pickup details, vehicle details, and final arrangements.",
    ],
  },
  {
    id: "private-tour-policy",
    eyebrow: "Private tour policy",
    title: "Private tours are quoted with an extra fee",
    summary:
      "Private tours are booked per vehicle and may exclude external entrance or activity fees.",
    points: [
      "Private tours have an additional fee.",
      "Private tours are booked per vehicle.",
      "SANParks, entrance fees, venue fees, or activity fees are excluded unless clearly stated otherwise.",
    ],
  },
  {
    id: "cancellation-policy",
    eyebrow: "Cancellation policy",
    title: "Refunds depend on cancellation timing",
    summary:
      "The refund amount depends on when the customer cancels and whether the cancellation is weather-related.",
    points: [
      "Cancellation within 24 hours after booking allows a full refund.",
      "Cancellation 2–3 days before the trip has a 20% penalty.",
      "Cancellation within 24 hours before the trip has no refund.",
      "Weather-related cancellations allow either a refund or reschedule, depending on availability.",
    ],
  },
  {
    id: "reschedule-policy",
    eyebrow: "Reschedule policy",
    title: "Rescheduling depends on availability",
    summary:
      "Cape Frontier may allow rescheduling, but same-day or last-minute changes still need manual confirmation.",
    points: [
      "Rescheduling is allowed depending on availability.",
      "Weather-related rescheduling is allowed where possible.",
      "Same-day or last-minute rescheduling still needs final confirmation from Cape Frontier.",
    ],
  },
  // {
  //   id: "vehicle-policy",
  //   eyebrow: "Availability / vehicle policy",
  //   title: "Vehicles are arranged operationally",
  //   summary:
  //     "Customers do not select the vehicle. Cape Frontier decides the vehicle based on group size and operational needs.",
  //   points: [
  //     "Cape Frontier uses an on-demand vehicle hiring setup.",
  //     "Customers do not select the vehicle.",
  //     "Vehicle size/details are decided by Cape Frontier based on group size and operational needs.",
  //     "Two separate parties booking the same tour on the same day is not automatically a problem because Cape Frontier can combine groups operationally or arrange vehicles as needed.",
  //   ],
  // },
  {
    id: "still-to-confirm",
    eyebrow: "Still needs confirmation",
    title: "Items still awaiting final confirmation",
    summary:
      "These items should remain provisional until Nadeem confirms the final operating rules.",
    points: [
      "Child pricing still needs confirmation.",
      "Same-day booking policy still needs confirmation.",
      "Minimum advance booking time still needs confirmation.",
      "Private tour exact fee still needs confirmation.",
      "Whether far pickup areas should ever carry an extra charge still needs confirmation.",
      "All policies are still provisional until Nadeem confirms them.",
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
