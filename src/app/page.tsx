"use client";
import LogoutHeader from "./components/Header/LogoutHeader";
import { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <div className="bg-white min-h-screen scroll-smooth text-gray-900">
      {/* Header */}
      <div className="bg-white">
        <LogoutHeader />
      </div>
      {/* Announcement bar */}
      <div className="w-full bg-blue-50 border-y border-blue-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 text-center text-sm text-blue-800">
          Hablamos Español • We speak English
        </div>
      </div>
      {/* 1) Families — single image */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-blue-800">
              Protection Starts at Home
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Our mission is rooted in protecting the families that make up our
              community. Because nothing matters more.
            </p>
          </header>

          <figure className="rounded-xl shadow-lg overflow-hidden bg-gray-100 max-w-5xl mx-auto">
            <img
              src="/familypark.JPG"
              alt="Family at the park with dog"
              loading="lazy"
              className="h-[360px] md:h-[420px] w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
            />
          </figure>
        </div>
      </section>
      <hr className="border-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent my-2" />
      {/* 2) Agency hero — card layout (no banner) */}
      <section className="py-14 bg-gradient-to-b from-white to-blue-50/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-5 md:p-7">
            {/* Photo — contained, not cropped */}
            <figure className="rounded-xl bg-gray-50 p-3 md:p-4">
              <img
                src="/inglesoespanol.png"
                alt="Mauricia Engle — bilingual (Inglés / Español)"
                className="w-full h-auto object-contain rounded-lg"
                loading="lazy"
              />
            </figure>

            {/* Copy + CTAs */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm0 18a8 8 0 0 1-7.75-6h6.25v6h1.5v-6h6.25A8 8 0 0 1 12 20Zm7.75-7h-6.25V7h-1.5v6H4.25a8 8 0 0 1 0-2H12V5h1.5v6h6.25a8 8 0 0 1 0 2Z"
                  />
                </svg>
                Inglés / Español
              </span>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-blue-900">
                Mauricia Engle Agency
              </h1>

              <p className="text-lg text-gray-700">
                Your local insurance expert —{" "}
                <span className="whitespace-nowrap">Aquí para ayudarte.</span>
                We protect what matters most with personalized coverage and
                friendly, bilingual service.
              </p>

              <ul className="text-gray-700/90 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600"></span>
                  Auto • Home • Renters • Life
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600"></span>
                  Fast quotes and clear guidance
                </li>
              </ul>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white shadow hover:bg-blue-800"
                >
                  Request a Quote
                </a>
                <button
                  onClick={() =>
                    document.getElementById("signin-trigger")?.click()
                  }
                  className="inline-flex items-center justify-center rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*
  3) Meet Mauricia — uses meetmauricia.png
*/}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <figure className="rounded-2xl shadow-lg overflow-hidden bg-gray-100/60 p-3">
            <img
              src="/meetmauricia.png"
              alt="Meet Mauricia — portrait"
              loading="lazy"
              className="w-full h-auto max-h-[520px] object-contain rounded-xl"
            />
          </figure>
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-blue-800">
              Meet Mauricia
            </h2>
            <p className="mt-4 text-lg text-gray-700 leading-relaxed">
              Mauricia Engle is passionate about helping her community protect
              what matters most. As a bilingual agent who truly understands her
              clients’ needs, she brings years of experience and a heart full of
              care to every family she works with.
            </p>
          </div>
        </div>
      </section>
      {/*
  4) Why Clients Choose Us — uses lastmauri.png
*/}{" "}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl md:text-4xl font-semibold text-blue-800">
            Why Clients Choose Us
          </h2>
          <div className="mt-10 mx-auto rounded-2xl shadow-lg overflow-hidden bg-white p-3">
            <img
              src="/lastmauri.png"
              alt="Why clients choose our agency"
              loading="lazy"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>
        </div>
      </section>
      {/* 5) Cars — moved ABOVE the CTA */}
      <section className="py-16 bg-blue-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-white">
              Dependable. Local. Here for You.
            </h2>
            <p className="mt-3 text-lg text-blue-100 max-w-2xl mx-auto">
              From city streets to family driveways — we’re part of your
              everyday life.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                src: "/carbuilding.JPG",
                alt: "Chevy truck in front of building",
              },
              { src: "/carsky.JPG", alt: "Truck under sunset sky" },
            ].map((img) => (
              <figure
                key={img.src}
                className="rounded-2xl shadow-xl overflow-hidden bg-blue-900/30 ring-1 ring-white/10"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-[380px] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>
      {/* 6) Final CTA */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold">
            ¿Necesitas una cotización?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Hablamos Español e Inglés. Contáctanos hoy para ayudarte con
            cotizaciones y cobertura personalizada.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById("signin-trigger");
                if (el) el.click();
              }}
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50"
              aria-label="Sign in to request a quote"
            >
              Sign in
            </button>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-lg border border-white/70 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Request a Quote
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
