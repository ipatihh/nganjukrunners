"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/data/faq";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#fbfbfb] border-t border-neutral-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="text-neutral-600 font-extrabold text-[10px] tracking-[0.2em] uppercase mb-3 block">
            Pertanyaan Umum
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight uppercase">
            FAQ
          </h2>
          <p className="text-neutral-500 mt-3 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Segala hal yang perlu kamu ketahui sebelum mengikat tali sepatu dan berlari bersama kami.
          </p>
        </div>

        <div className="flex flex-col border-t border-neutral-100">
          {faqItems?.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-neutral-100">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center text-left py-6 text-neutral-950 hover:text-neutral-500 transition-colors duration-200 focus:outline-none"
                >
                  <span className="text-base sm:text-lg font-bold pr-6">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-600 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-neutral-900" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-60 pb-6 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
