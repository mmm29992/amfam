"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import DynamicHeader from "../components/Header/DynamicHeader";
import PolicyModal from "../components/PolicyModal"

type PersonRef = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  _id?: string;
};

export type Policy = {
  _id: string;
  policyFileUrl: string;
  notes?: string; // staff-only (server hides for clients)
  createdAt: string;
  policyType:
    | "Auto"
    | "Home"
    | "Life"
    | "Renters"
    | "Business"
    | "Other"
    | string;
  uploadedBy?: PersonRef;
  clientId?: PersonRef;
};

type SearchField =
  | "all"
  | "uploadedBy"
  | "client"
  | "policyType"
  | "notes"
  | "date";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<SearchField>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const fetchPolicies = async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await api.get<Policy[]>("/policies", { params });
      setPolicies(res.data ?? []);
    } catch (err) {
      console.error("Failed to fetch policies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPolicies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return policies.filter((p) => {
      const matchesType = typeFilter === "all" || p.policyType === typeFilter;

      let matchesSearch = false;
      switch (searchQuery) {
        case "uploadedBy": {
          const hay = `${p.uploadedBy?.username ?? ""} ${
            p.uploadedBy?.firstName ?? ""
          } ${p.uploadedBy?.lastName ?? ""}`.toLowerCase();
          matchesSearch = hay.includes(term);
          break;
        }
        case "client": {
          const hay = `${p.clientId?.email ?? ""} ${
            p.clientId?.firstName ?? ""
          } ${p.clientId?.lastName ?? ""}`.toLowerCase();
          matchesSearch = hay.includes(term);
          break;
        }
        case "policyType":
          matchesSearch = (p.policyType ?? "").toLowerCase().includes(term);
          break;
        case "notes":
          matchesSearch = (p.notes ?? "").toLowerCase().includes(term);
          break;
        case "date":
          matchesSearch = new Date(p.createdAt)
            .toLocaleDateString()
            .toLowerCase()
            .includes(term);
          break;
        case "all":
        default: {
          const hay = [
            p.notes ?? "",
            p.policyType ?? "",
            p.uploadedBy?.username ?? "",
            p.uploadedBy?.firstName ?? "",
            p.uploadedBy?.lastName ?? "",
            p.clientId?.email ?? "",
            p.clientId?.firstName ?? "",
            p.clientId?.lastName ?? "",
            new Date(p.createdAt).toLocaleDateString(),
          ]
            .join(" ")
            .toLowerCase();

          matchesSearch = hay.includes(term);
          break;
        }
      }

      return matchesType && (term ? matchesSearch : true);
    });
  }, [policies, searchQuery, searchTerm, typeFilter]);

  return (
    <div className="min-h-screen bg-blue-800 text-white">
      <DynamicHeader />

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Policy Management</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-blue-800 hover:bg-blue-100 px-6 py-3 rounded-md font-bold mb-6"
        >
          + New Policy
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2 w-full">
            {/* 🔎 Search input */}
            <div className="relative w-full">
              <img
                src="/searchicon.svg"
                alt="Search Icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-blue-700 w-full px-3 py-2 rounded-md border bg-white border-gray-300"
              />
            </div>

            {/* 🗂️ Type filter */}
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

            {/* 🔎 Field selector */}
            <select
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value as SearchField)}
              className="text-blue-700 px-3 py-2 rounded-md border bg-white border-gray-300"
            >
              <option value="all">All Fields</option>
              <option value="uploadedBy">Uploaded By</option>
              <option value="client">Client</option>
              <option value="policyType">Policy Type</option>
              <option value="notes">Notes</option>
              <option value="date">Upload Date</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading policies...</p>
        ) : policies.length === 0 ? (
          <p>No policies available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((p) => (
              <div
                key={p._id}
                className="bg-white text-blue-800 p-4 rounded-md shadow-sm"
              >
                <p className="text-sm italic text-gray-600 mb-1">
                  Uploaded on: {new Date(p.createdAt).toLocaleString()}
                </p>

                {p.uploadedBy ? (
                  <p className="text-sm italic text-gray-600 mb-1">
                    Uploaded by: {p.uploadedBy.firstName || ""}{" "}
                    {p.uploadedBy.lastName || ""}{" "}
                    {p.uploadedBy.username ? `(${p.uploadedBy.username})` : ""}
                  </p>
                ) : (
                  <p className="text-sm italic text-gray-400 mb-1">
                    Uploader unknown
                  </p>
                )}

                {p.clientId && (
                  <p className="text-sm mb-2">
                    For client: {p.clientId.firstName} {p.clientId.lastName} (
                    {p.clientId.email})
                  </p>
                )}

                {p.policyType && (
                  <p className="text-sm font-bold mb-2">
                    Type: <span className="capitalize">{p.policyType}</span>
                  </p>
                )}

                {p.notes && (
                  <p className="text-sm mb-2">
                    <strong>Notes:</strong> {p.notes}
                  </p>
                )}

                <a
                  href={p.policyFileUrl}
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
                      "Are you sure you want to delete this policy?"
                    );
                    if (!confirmed) return;

                    try {
                      await api.delete(`/policies/${p._id}`);
                      setPolicies((prev) =>
                        prev.filter((pol) => pol._id !== p._id)
                      );
                    } catch (err) {
                      console.error("Failed to delete policy:", err);
                      alert("Error deleting policy.");
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
          <PolicyModal
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              fetchPolicies().then(() => setShowModal(false));
            }}
          />
        )}
      </div>
    </div>
  );
}
