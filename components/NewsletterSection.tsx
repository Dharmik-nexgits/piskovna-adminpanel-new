import React from "react";

export default function NewsletterSection() {
  return (
    <div className="relative w-full max-w-300 mx-auto rounded-sm overflow-hidden h-122.5 mb-12">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url(/images/blog_email_bg.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative z-10 h-full flex flex-col justify-center w-full px-8 md:px-12">
        <h3 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] font-bold leading-tight">
          Získejte novinky
          <br />o projektu přímo do e-mailu
        </h3>
        <p className="text-sm md:text-base text-[#1A1A1A]/80 mb-8 max-w-md font-medium">
          Přihlaste se k odběru našeho newsletteru a dostávejte aktuální
          informace o našich projektech.
        </p>

        <div className="flex lg:flex-row justify-between flex-col gap-0 w-full">
          <input
            type="email"
            placeholder="jan.novak@seznam.cz"
            className="w-1/2 px-6 py-4 bg-[#EAE5DA]/60 border border-transparent focus:border-[#C95D46]/30 focus:bg-[#EAE5DA] placeholder:text-[#1A1A1A]/40 text-[#1A1A1A] text-sm outline-none transition-all"
          />
          <button className="bg-[#C95D46] hover:bg-[#B34E39] text-white px-10 py-4 text-sm font-bold uppercase tracking-wider transition-colors shadow-sm">
            Odebírat
          </button>
        </div>
      </div>
    </div>
  );
}
