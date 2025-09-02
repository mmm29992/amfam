"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import DynamicHeader from "../../components/Header/DynamicHeader";

type Quote = {
  _id: string;
  quoteFileUrl: string;
  notes?: string;
  createdAt: string;
  quoteType: string;
};

export default function ClientQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchClientQuotes = async () => {
      try {
        const res = await api.get("/quotes/me");
        setQuotes(res.data);
      } catch (err) {
        console.error("Failed to fetch client quotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientQuotes();
  }, []);

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    const matchesType = typeFilter === "all" || q.quoteType === typeFilter;

    const dateStr = new Date(q.createdAt)
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      .toLowerCase();

    const matchesSearch =
      q.notes?.toLowerCase().includes(term) ||
      q.quoteType?.toLowerCase().includes(term) ||
      dateStr.includes(term);

    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-blue-800 text-white">
      <DynamicHeader />

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Your Quotes</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2 w-full">
            {/* 🔍 Search input (notes + date + type) */}
            <div className="relative w-full">
              <img
                src="/searchicon.svg"
                alt="Search Icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search notes, type, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-blue-700 w-full px-3 py-2 rounded-md border bg-white border-gray-300"
              />
            </div>

            {/* 🗂️ Quote type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-blue-700 px-3 py-2 rounded-md border bg-white border-gray-300"
            >
              <option value="all">All Types</option>
              <option value="Auto">Auto</option>
              <option value="Home">Home</option>
              <option value="Life">Life</option>
              <option value="Renters">Renters</option>
              <option value="Business">Business</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading quotes...</p>
        ) : filteredQuotes.length === 0 ? (
          <p>No quotes found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map((q) => (
              <div
                key={q._id}
                className="bg-white text-blue-800 p-4 rounded-md shadow-sm"
              >
                <p className="text-sm italic text-gray-600 mb-1">
                  Uploaded on:{" "}
                  {new Date(q.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {q.quoteType && (
                  <p className="text-sm font-bold mb-2">
                    Type: <span className="capitalize">{q.quoteType}</span>
                  </p>
                )}

                {q.notes && (
                  <p className="text-sm mb-2">
                    <strong>Notes:</strong> {q.notes}
                  </p>
                )}

                <a
                  href={q.quoteFileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 transition"
                >
                  View / Download PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
