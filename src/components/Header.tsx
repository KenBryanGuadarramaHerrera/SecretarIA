"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function Header() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(ref.current, {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: "power3.out",
    });
  }, { scope: ref });

  return (
    <header ref={ref} className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
        {/* Banda color CDMX */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 bg-[#C8102E] rounded-full" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest leading-none">SEDECO CDMX</p>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Secretar<span className="text-[#C8102E]">IA</span>
            </h1>
          </div>
        </div>

        <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          Saptiva KAL activo
        </div>
      </div>
    </header>
  );
}
