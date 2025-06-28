"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import DynamicHeader from "../components/Header/DynamicHeader";
import QuoteModal from "../components/QuoteModal"; // adjust path if needed


type Quote = {
  _id: string;
  quoteType: "personal" | "business";
  finalQuoteText: string;
  createdBy?: {
    firstName?: string;
    lastName?: string;
    username: string;
  };
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await axiosInstance.get("/quotes");

        const personalWithType = (res.data.personal || []).map((q: any) => ({
          ...q,
          quoteType: "personal",
        }));

        const businessWithType = (res.data.business || []).map((q: any) => ({
          ...q,
          quoteType: "business",
        }));

        const combinedQuotes = [...personalWithType, ...businessWithType];

        setQuotes(combinedQuotes);
      } catch (err) {
        console.error("Failed to fetch quotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);
  

  return (
    <div className="min-h-screen bg-blue-800 text-white">
      <DynamicHeader />

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Quote Management</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-blue-800 hover:bg-blue-100 px-6 py-3 rounded-md font-bold mb-6"
        >
          + New Quote
        </button>

        {loading ? (
          <p>Loading quotes...</p>
        ) : quotes.length === 0 ? (
          <p>No quotes available.</p>
        ) : (
          <ul className="space-y-6">
            {quotes.map((q) => (
              <li
                key={q._id}
                className="bg-white text-blue-800 p-6 rounded-md shadow-md"
              >
                <h2 className="text-xl font-bold capitalize mb-2">
                  {q.quoteType} Quote
                </h2>

                {q.createdBy ? (
                  <p className="text-sm italic text-gray-600 mb-2">
                    Created by: {q.createdBy.firstName || ""}{" "}
                    {q.createdBy.lastName || ""} ({q.createdBy.username})
                  </p>
                ) : (
                  <p className="text-sm italic text-gray-400 mb-2">
                    Creator unknown
                  </p>
                )}

                <pre className="whitespace-pre-wrap text-sm">
                  {q.finalQuoteText}
                </pre>
              </li>
            ))}
          </ul>
        )}
        {showModal && (
          <QuoteModal
            onClose={() => setShowModal(false)}
            onSuccess={(newQuote) => {
              setQuotes((prev) => [newQuote, ...prev]);
              setShowModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
