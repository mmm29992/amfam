"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";


type User = {
  _id: string;
  userType: string;
  firstName: string;
  lastName: string;
  email: string;
};

type Quote = {
  _id: string;
  quoteFileUrl: string;
  notes?: string;
  quoteType: string;
  createdAt: string;
  uploadedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  clientId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};


type Props = {
  user: User;
  onClose: () => void;
};

const QuotesModal: React.FC<Props> = ({ user, onClose }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/quotes")
      .then((res) => {
        const filtered = res.data.filter((q: Quote) => {
          if (user.userType === "client") return q.clientId?._id === user._id;
          return q.uploadedBy?.email === user.email;
        });
        setQuotes(filtered);
      })
      .catch((err) => console.error("Failed to fetch quotes", err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleBackgroundClick = () => onClose();
  const handleContentClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-white text-blue-800 w-[36rem] max-w-[95%] max-h-[90vh] p-6 rounded-xl shadow-xl overflow-y-auto relative"
        onClick={handleContentClick}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-3xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">
          Quotes {user.userType === "client" ? "for" : "by"} {user.firstName}{" "}
          {user.lastName}
        </h2>

        {loading ? (
          <p className="text-sm italic text-gray-600">Loading quotes...</p>
        ) : quotes.length === 0 ? (
          <p className="text-sm italic text-gray-600">
            No quotes found for this user.
          </p>
        ) : (
          <ul className="space-y-4">
            {quotes.map((q) => (
              <li key={q._id} className="border-b pb-4 border-gray-300">
                <p className="font-semibold">📄 Type: {q.quoteType}</p>
                {q.notes && <p className="text-sm">📝 Notes: {q.notes}</p>}
                <p className="text-sm">
                  📥 Uploaded by: {q.uploadedBy?.firstName}{" "}
                  {q.uploadedBy?.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  📅 Uploaded: {format(new Date(q.createdAt), "PPP p")}
                </p>
                <p className="text-sm">
                  👤 For client: {q.clientId?.firstName} {q.clientId?.lastName}{" "}
                  ({q.clientId?.email})
                </p>
                <a
                  href={q.quoteFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View PDF
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QuotesModal;
