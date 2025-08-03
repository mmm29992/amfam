"use client";
import LogoutHeader from "./components/Header/LogoutHeader";
import { JSX } from "react";


export default function Home(): JSX.Element {
  return (
    <div className="bg-blue-800 min-h-screen scroll-smooth">
      {/* Header (white background only) */}
      <div className="bg-white">
        <LogoutHeader />
      </div>

      {/* SECTION 1 – Family Emotional First */}
      <section className="bg-white py-16 px-6 md:px-20">
        <h3 className="text-center text-3xl font-bold mb-2 text-blue-800">
          Protection Starts at Home
        </h3>
        <p className="text-center text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
          Our mission is rooted in protecting the families that make up our
          community. Because nothing matters more.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <img
            src="/familypark.JPG"
            alt="Family at park"
            className="rounded-lg shadow-lg object-cover w-full h-[300px] hover:scale-105 transition duration-300"
          />
          <img
            src="/familywalk.JPG"
            alt="Family walking together"
            className="rounded-lg shadow-lg object-cover w-full h-[300px] hover:scale-105 transition duration-300"
          />
          <img
            src="/familytrain.JPG"
            alt="Family on train tracks"
            className="rounded-lg shadow-lg object-cover w-full h-[300px] hover:scale-105 transition duration-300"
          />
        </div>
      </section>

      {/* SECTION 2 – Car Photos for Trust */}
      <section className="bg-blue-800 py-16 px-6 md:px-20">
        <h3 className="text-center text-3xl font-bold mb-2 text-white">
          Dependable. Local. Here for You.
        </h3>
        <p className="text-center text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
          From city streets to family driveways — we’re part of your everyday
          life.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <img
            src="/carbuilding.JPG"
            alt="Car in front of building"
            className="rounded-xl shadow-lg w-full h-[400px] object-cover hover:scale-105 transition duration-300"
          />
          <img
            src="/carsky.JPG"
            alt="Car under sunset"
            className="rounded-xl shadow-lg w-full h-[400px] object-cover hover:scale-105 transition duration-300"
          />
        </div>
      </section>

      {/* SECTION 3 – Mauricia Banner */}
      <section className="relative w-full h-[85vh]">
        <img
          src="/SoyAgentDeSegurosDraft3.png"
          alt="Mauricia Hero"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center px-6">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mauricia Engle Agency
            </h1>
            <p className="text-lg md:text-xl max-w-xl mx-auto">
              Your local insurance expert — Aquí para ayudarte.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4 – About Mauricia */}
      <section className="bg-blue-800 text-white py-16 px-6 md:px-20 flex flex-col md:flex-row items-center gap-10">
        <img
          src="/mauriciainchair.jpg"
          alt="Mauricia sitting in chair"
          className="w-full md:w-1/2 rounded-xl object-cover max-h-[500px]"
        />
        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold mb-4">Meet Mauricia</h2>
          <p className="text-lg">
            Mauricia Engle is passionate about helping her community protect
            what matters most. As a bilingual agent who truly understands her
            clients’ needs, she brings years of experience and a heart full of
            care to every family she works with.
          </p>
        </div>
      </section>

      {/* SECTION 5 – Promo Carousel */}
      <section className="bg-white py-16 px-6 md:px-20">
        <h3 className="text-center text-2xl font-bold mb-10 text-blue-800">
          Why Clients Choose Us
        </h3>
        <img
          src="/mauriciacarousel.png"
          alt="Promotional Carousel"
          className="rounded-xl shadow-md mx-auto w-full max-w-5xl"
        />
      </section>

      {/* SECTION 6 – Final CTA */}
      <section className="bg-blue-900 text-white py-20 px-6 text-center">
        <h3 className="text-3xl font-bold mb-4">¿Necesitas una cotización?</h3>
        <p className="text-lg max-w-2xl mx-auto mb-6">
          Hablamos Español e Inglés. Mándame un mensaje hoy para ayudarte con
          cotizaciones, cobertura personalizada, o simplemente responder tus
          preguntas.
        </p>
        <button
          onClick={() => {
            const signinBtn = document.getElementById("signin-trigger");
            if (signinBtn) {
              signinBtn.click();
            }
          }}
          className="inline-block bg-white text-blue-800 px-6 py-3 font-bold rounded hover:bg-gray-100 transition"
        >
          Sign in
        </button>
      </section>
    </div>
  );
}
