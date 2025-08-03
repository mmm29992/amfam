"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import DynamicHeader from "../components/Header/DynamicHeader";
import QuoteModal from "../components/QuoteModal";

type Quote = {
  _id: string;
  quoteFileUrl: string;
  notes?: string;
  createdAt: string;
  quoteType: string; // 🆕 Add this line
  uploadedBy?: {
    firstName?: string;
    lastName?: string;
    username: string;
  };
  clientId?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await axiosInstance.get("/quotes");
        setQuotes(res.data);
      } catch (err) {
        console.error("Failed to fetch quotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    const matchesType = typeFilter === "all" || q.quoteType === typeFilter;

    let matchesSearch = false;

    switch (searchQuery) {
      case "uploadedBy":
        matchesSearch =
          q.uploadedBy?.username?.toLowerCase().includes(term) ||
          q.uploadedBy?.firstName?.toLowerCase().includes(term) ||
          q.uploadedBy?.lastName?.toLowerCase().includes(term);
        break;

      case "client":
        matchesSearch =
          q.clientId?.email?.toLowerCase().includes(term) ||
          q.clientId?.firstName?.toLowerCase().includes(term) ||
          q.clientId?.lastName?.toLowerCase().includes(term);
        break;

      case "quoteType":
        matchesSearch = q.quoteType?.toLowerCase().includes(term);
        break;

      case "notes":
        matchesSearch = q.notes?.toLowerCase().includes(term);
        break;

      case "date":
        matchesSearch = new Date(q.createdAt)
          .toLocaleDateString()
          .toLowerCase()
          .includes(term);
        break;

      case "all":
      default:
        matchesSearch =
          q.notes?.toLowerCase().includes(term) ||
          q.quoteType?.toLowerCase().includes(term) ||
          q.uploadedBy?.username?.toLowerCase().includes(term) ||
          q.uploadedBy?.firstName?.toLowerCase().includes(term) ||
          q.uploadedBy?.lastName?.toLowerCase().includes(term) ||
          q.clientId?.email?.toLowerCase().includes(term) ||
          q.clientId?.firstName?.toLowerCase().includes(term) ||
          q.clientId?.lastName?.toLowerCase().includes(term) ||
          new Date(q.createdAt)
            .toLocaleDateString()
            .toLowerCase()
            .includes(term);
        break;
    }

    return matchesType && matchesSearch;
  });

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2 w-full">
            <div className="relative w-full">
              <img
                src="/searchicon.svg"
                alt="Search Icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-blue-700 w-full px-3 py-2 rounded-md border bg-white border-gray-300"
              />
            </div>

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
            <select
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-blue-700 px-3 py-2 rounded-md border bg-white border-gray-300"
            >
              <option value="all">All Fields</option>
              <option value="uploadedBy">Uploaded By</option>
              <option value="client">Client</option>
              <option value="quoteType">Quote Type</option>
              <option value="notes">Notes</option>
              <option value="date">Upload Date</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading quotes...</p>
        ) : quotes.length === 0 ? (
          <p>No quotes available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map((q) => (
              <div
                key={q._id}
                className="bg-white text-blue-800 p-4 rounded-md shadow-sm"
              >
                {/* keep your existing card layout here */}
                <p className="text-sm italic text-gray-600 mb-1">
                  Uploaded on: {new Date(q.createdAt).toLocaleString()}
                </p>

                {q.uploadedBy ? (
                  <p className="text-sm italic text-gray-600 mb-1">
                    Uploaded by: {q.uploadedBy.firstName || ""}{" "}
                    {q.uploadedBy.lastName || ""} ({q.uploadedBy.username})
                  </p>
                ) : (
                  <p className="text-sm italic text-gray-400 mb-1">
                    Uploader unknown
                  </p>
                )}

                {q.clientId && (
                  <p className="text-sm mb-2">
                    For client: {q.clientId.firstName} {q.clientId.lastName} (
                    {q.clientId.email})
                  </p>
                )}

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
                  Download PDF
                </a>

                <button
                  onClick={async () => {
                    const confirmed = window.confirm(
                      "Are you sure you want to delete this quote?"
                    );
                    if (!confirmed) return;

                    try {
                      await axiosInstance.delete(`/quotes/${q._id}`);
                      setQuotes((prev) =>
                        prev.filter((quote) => quote._id !== q._id)
                      );
                    } catch (err) {
                      console.error("Failed to delete quote:", err);
                      alert("Error deleting quote.");
                    }
                  }}
                  className="text-sm text-red-600 underline hover:text-red-800 ml-4"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <QuoteModal
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              // re-fetch the full list to get populated fields
              axiosInstance.get("/quotes").then((res) => {
                setQuotes(res.data);
                setShowModal(false);
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
