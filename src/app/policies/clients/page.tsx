"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import DynamicHeader from "../../components/Header/DynamicHeader";

type Policy = {
  _id: string;
  policyFileUrl: string;
  createdAt: string;
  policyType: string;
};

export default function ClientPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchClientPolicies = async () => {
      try {
        const res = await api.get<Policy[]>("/policies/me");
        setPolicies(res.data);
      } catch (err: unknown) {
        // keep type-safe logging
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: unknown }).message)
            : String(err);
        console.error("Failed to fetch client policies:", message);
      } finally {
        setLoading(false);
      }
    };
    fetchClientPolicies();
  }, []);

  const filteredPolicies = policies.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesType = typeFilter === "all" || p.policyType === typeFilter;

    const dateStr = new Date(p.createdAt)
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      .toLowerCase();

    const matchesSearch =
      p.policyType?.toLowerCase().includes(term) || dateStr.includes(term);

    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-blue-800 text-white">
      <DynamicHeader />

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Your Policies</h1>

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
                placeholder="Search by type or date..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10 text-blue-700 w-full px-3 py-2 rounded-md border bg-white border-gray-300"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setTypeFilter(e.target.value)
              }
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
          <p>Loading policies...</p>
        ) : filteredPolicies.length === 0 ? (
          <p>No policies found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((p) => (
              <div
                key={p._id}
                className="bg-white text-blue-800 p-4 rounded-md shadow-sm"
              >
                <p className="text-sm italic text-gray-600 mb-1">
                  Uploaded on:{" "}
                  {new Date(p.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {p.policyType && (
                  <p className="text-sm font-bold mb-2">
                    Type: <span className="capitalize">{p.policyType}</span>
                  </p>
                )}

                <a
                  href={p.policyFileUrl}
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
