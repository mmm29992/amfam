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

      {/* SECTION 1 — Families (single image) */}
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
              src="/familypark.JPG" // ⬅️ only the far-left pic
              alt="Family at the park with dog"
              loading="lazy"
              className="h-[360px] md:h-[420px] w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
            />
          </figure>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <hr className="border-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent my-2" />

      {/* SECTION 3 — Mauricia banner */}
      <section className="relative w-full">
        <div className="relative h-[70vh] md:h-[80vh]">
          <img
            src="/SoyAgentDeSegurosDraft3.png"
            alt="Mauricia Engle agency banner"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
          <div className="relative z-10 h-full flex items-center justify-center px-4 text-center">
            <div className="text-white drop-shadow">
              <h1 className="text-4xl md:text-5xl font-bold">
                Mauricia Engle Agency
              </h1>
              <p className="mt-3 text-lg md:text-xl">
                Your local insurance expert — Aquí para ayudarte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — About Mauricia */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <figure className="rounded-2xl shadow-lg overflow-hidden">
            <img
              src="/mauriciainchair.jpg"
              alt="Mauricia sitting in chair"
              loading="lazy"
              className="w-full h-[480px] object-cover"
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

      {/* SECTION 5 — Promo / collage */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl md:text-4xl font-semibold text-blue-800">
            Why Clients Choose Us
          </h2>
          <div className="mt-10 rounded-2xl shadow-lg overflow-hidden bg-white">
            <img
              src="/mauriciacarousel.png"
              alt="Reasons clients choose our agency"
              loading="lazy"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* SECTION 6 — Final CTA */}
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

      {/* SECTION 7 — Cars (moved to the very end) */}
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
    </div>
  );
}
