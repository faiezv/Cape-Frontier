import { useState } from "react";

const TourFAQ = ({ faqs = [] }) => {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs.length) return null;

  const toggleFAQ = (index) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6">
        <span className="mb-1 block font-bitter text-sm font-bold uppercase tracking-[0.12em] text-blue-600">
          Frequently Asked Questions
        </span>

        <h2 className="mt-2 font-bitter text-2xl leading-none  font-bold text-neutral-950 md:text-4xl">
          Good to Know
        </h2>
      </div>

      {/* FAQ LIST */}
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-blue-50/50">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={`${faq.question}-${index}`}
              className={`
                border-b
                border-blue-100
                last:border-b-0
                transition-colors
                duration-300

                ${
                  isOpen
                    ? "bg-white"
                    : "bg-transparent hover:bg-white/70"
                }
              `}
            >
              {/* QUESTION */}
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                className="
                  group
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-6
                  px-5
                  py-5
                  text-left
                  sm:px-6
                  sm:py-6
                "
              >
                {/* QUESTION TEXT */}
                <span
                  className={`
                    font-bitter
                    text-sm
                    font-bold
                    leading-6
                    transition-colors
                    duration-300
                    sm:text-[15px]

                    ${
                      isOpen
                        ? "text-blue-700"
                        : "text-neutral-900 group-hover:text-blue-700"
                    }
                  `}
                >
                  {faq.question}
                </span>

                {/* PLUS BUTTON */}
                <span
                  aria-hidden="true"
                  className={`
                    relative
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    transition-all
                    duration-300

                    ${
                      isOpen
                        ? "border-blue-600 bg-blue-600 text-white shadow-[0_6px_18px_rgba(37,99,235,0.22)]"
                        : "border-blue-100 bg-white text-blue-600 shadow-sm group-hover:border-blue-200 group-hover:bg-blue-50"
                    }
                  `}
                >
                  {/* HORIZONTAL */}
                  <span
                    className={`
                      absolute
                      left-1/2
                      top-1/2
                      h-px
                      w-3.5
                      -translate-x-1/2
                      -translate-y-1/2
                      bg-current
                      transition-transform
                      duration-300
                      ease-out
                    `}
                  />

                  {/* VERTICAL */}
                  <span
                    className={`
                      absolute
                      left-1/2
                      top-1/2
                      h-px
                      w-3.5
                      -translate-x-1/2
                      -translate-y-1/2
                      rotate-90
                      bg-current
                      transition-all
                      duration-300
                      ease-out

                      ${
                        isOpen
                          ? "rotate-0 opacity-0"
                          : "rotate-90 opacity-100"
                      }
                    `}
                  />
                </span>
              </button>

              {/* ANSWER */}
              <div
                id={`faq-answer-${index}`}
                className={`
                  grid
                  transition-[grid-template-rows]
                  duration-500
                  ease-[cubic-bezier(0.4,0,0.2,1)]

                  ${
                    isOpen
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }
                `}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={`
                      px-5
                      pr-16
                      sm:px-6
                      sm:pr-20
                      transition-all
                      duration-500
                      ease-out

                      ${
                        isOpen
                          ? "translate-y-0 pb-6 opacity-100"
                          : "-translate-y-2 pb-0 opacity-0"
                      }
                    `}
                  >
                    <div className="rounded-[1rem] border border-blue-100 bg-blue-50/60 px-4 py-3.5 sm:px-5 sm:py-4">
                      <p className="font-bitter text-sm leading-7 text-neutral-600">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TourFAQ;
