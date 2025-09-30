"use client";
import LogoutHeader from "./components/Header/LogoutHeader";
import { JSX } from "react";

export default function Home(): JSX.Element {
  const goSignin = () => document.getElementById("signin-trigger")?.click();

  return (
    <div className="bg-white min-h-screen scroll-smooth text-gray-900">
      {/* Header */}
      <div className="bg-white">
        <LogoutHeader />
      </div>

      {/* Announcement bar */}
      <div className="w-full bg-blue-50 border-y border-blue-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 text-center text-sm text-blue-800">
          We speak English • Hablamos Español
        </div>
      </div>

      {/* 1) Families — single image */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-blue-800">
              Protection Starts at Home
            </h2>
            <p className="text-blue-900/70">La protección comienza en casa</p>

            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Our mission is rooted in protecting the families that make up our
              community. Because nothing matters more.
              <br />
              <span className="text-gray-600/90">
                Nuestra misión está basada en proteger a las familias que forman
                nuestra comunidad. Porque nada importa más.
              </span>
            </p>
          </header>

          <figure className="rounded-xl shadow-lg overflow-hidden bg-gray-100 max-w-5xl mx-auto">
            <img
              src="/familypark.JPG"
              alt="Family at the park with dog / Familia en el parque con su perrito"
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
            {/* Photo */}
            <figure className="rounded-xl bg-gray-50 p-3 md:p-4">
              <img
                src="/inglesoespanol.png"
                alt="Mauricia Engle — English & Spanish / Inglés y Español"
                className="w-full h-auto object-contain rounded-lg"
                loading="lazy"
              />
            </figure>

            {/* Copy + CTAs */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                English & Spanish • Inglés y Español
              </span>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-blue-900">
                Mauricia Engle Agency
              </h1>
              <p className="text-blue-900/70">Agencia de Mauricia Engle</p>

              <p className="text-lg text-gray-700">
                Your local insurance expert —{" "}
                <span className="whitespace-nowrap">Here to help.</span>
                <br />
                <span className="text-gray-700/90">
                  Su experta local en seguros —{" "}
                  <span className="whitespace-nowrap">Aquí para ayudarte.</span>
                </span>
                <br />
                We protect what matters most with personalized coverage and
                friendly, bilingual service.
                <br />
                <span className="text-gray-700/90">
                  Protegemos lo que más importa con coberturas personalizadas y
                  un servicio amable y bilingüe.
                </span>
              </p>

              <ul className="text-gray-700/90 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  Auto • Home • Renters • Life /{" "}
                  <span className="ml-1">Auto • Casa • Inquilinos • Vida</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  Fast quotes and clear guidance /{" "}
                  <span className="ml-1">
                    Cotizaciones rápidas y asesoría clara
                  </span>
                </li>
              </ul>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={goSignin}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white shadow hover:bg-blue-800"
                  aria-label="Request a Quote / Solicita una cotización"
                >
                  Request a Quote / Solicita una cotización
                </button>
                <button
                  onClick={goSignin}
                  className="inline-flex items-center justify-center rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                  aria-label="Sign in / Iniciar sesión"
                >
                  Sign in / Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3) Meet Mauricia */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <figure className="rounded-2xl shadow-lg overflow-hidden bg-gray-100/60 p-3">
            <img
              src="/meetmauricia.png"
              alt="Meet Mauricia — portrait / Conoce a Mauricia — retrato"
              loading="lazy"
              className="w-full h-auto max-h-[520px] object-contain rounded-xl"
            />
          </figure>
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-blue-800">
              Meet Mauricia
            </h2>
            <p className="text-blue-900/70">Conoce a Mauricia</p>

            <p className="mt-4 text-lg text-gray-700 leading-relaxed">
              Mauricia Engle is passionate about helping her community protect
              what matters most. As a bilingual agent who truly understands her
              clients’ needs, she brings years of experience and a heart full of
              care to every family she works with.
              <br />
              <span className="text-gray-700/90">
                Mauricia Engle tiene la pasión de ayudar a su comunidad a
                proteger lo que más importa. Como agente bilingüe que entiende
                realmente las necesidades de sus clientes, aporta años de
                experiencia y un corazón lleno de servicio a cada familia.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* 4) Why Clients Choose Us — split card */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl md:text-4xl font-semibold text-blue-800">
            Why Clients Choose Us
          </h2>
          <p className="text-center text-blue-900/70">
            Por qué los clientes nos eligen
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <figure className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
              <img
                src="/lastmauri.png"
                alt="Clients choose our agency / Los clientes eligen nuestra agencia"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </figure>

            <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-6 md:p-8 flex flex-col">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                Trusted • Bilingual • Local / De confianza • Bilingüe • Local
              </div>

              <p className="mt-4 text-lg text-gray-700">
                We combine personal guidance with coverage that fits real life —
                sin perder el lado humano. Here’s what our clients value most:
                <br />
                <span className="text-gray-700/90">
                  Combinamos asesoría personal con coberturas que se ajustan a
                  la vida real — sin perder el lado humano. Esto es lo que más
                  valoran nuestros clientes:
                </span>
              </p>

              <ul className="mt-6 space-y-4">
                {[
                  "Clear advice in English & Spanish / Asesoría clara en inglés y español",
                  "Fast, fair quotes with no pressure / Cotizaciones rápidas y justas, sin presión",
                  "Help choosing the right coverage (not just the cheapest) / Te ayudamos a elegir la cobertura correcta (no solo la más barata)",
                  "Easy claims support when you need it most / Apoyo sencillo con reclamaciones cuando más lo necesitas",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <span className="text-gray-800">{line}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-blue-50 py-3">
                  <div className="text-2xl font-bold text-blue-800">98%</div>
                  <div className="text-xs text-blue-900/70">
                    Client satisfaction / Satisfacción
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 py-3">
                  <div className="text-2xl font-bold text-blue-800">24h</div>
                  <div className="text-xs text-blue-900/70">
                    Avg. quote turnaround / Tiempo promedio
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 py-3">
                  <div className="text-2xl font-bold text-blue-800">15+</div>
                  <div className="text-xs text-blue-900/70">
                    Years helping families / Años ayudando familias
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={goSignin}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white shadow hover:bg-blue-800"
                  aria-label="Get a Free Quote / Obtén una cotización"
                >
                  Get a Free Quote / Obtén una cotización
                </button>
                <button
                  onClick={goSignin}
                  className="inline-flex items-center justify-center rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                  aria-label="Client Login / Acceso de clientes"
                >
                  Client Login / Acceso de clientes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5) Cars — above CTA */}
      <section className="py-16 bg-blue-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-white">
              Dependable. Local. Here for You.
            </h2>
            <p className="text-blue-100">Confiables. Locales. Aquí para ti.</p>

            <p className="mt-3 text-lg text-blue-100 max-w-2xl mx-auto">
              From city streets to family driveways — we’re part of your
              everyday life.
              <br />
              <span className="text-blue-100/90">
                De las calles de la ciudad a tu cochera — somos parte de tu día
                a día.
              </span>
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                src: "/carbuilding.JPG",
                alt: "Truck in front of building / Camioneta frente a un edificio",
              },
              {
                src: "/carsky.JPG",
                alt: "Truck under sunset sky / Camioneta bajo el atardecer",
              },
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
            Need a quote? / ¿Necesitas una cotización?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            We speak English & Spanish. Contact us today for personalized
            coverage.
            <br />
            <span className="text-blue-100/90">
              Hablamos inglés y español. Contáctanos hoy para una cobertura
              personalizada.
            </span>
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={goSignin}
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50"
              aria-label="Sign in / Iniciar sesión"
            >
              Sign in / Iniciar sesión
            </button>
            <button
              onClick={goSignin}
              className="inline-flex items-center justify-center rounded-lg border border-white/70 px-6 py-3 font-semibold text-white hover:bg-white/10"
              aria-label="Request a Quote / Solicita una cotización"
            >
              Request a Quote / Solicita una cotización
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
