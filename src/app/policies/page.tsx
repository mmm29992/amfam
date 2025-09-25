"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import DynamicHeader from "../components/Header/DynamicHeader";
import PolicyModal from "../components/PolicyModal";

type Policy = {
  _id: string;
  policyFileUrl: string;
  notes?: string;
  createdAt: string;
  policyType: string;
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

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await api.get("/policies");
        setPolicies(res.data);
      } catch (err) {
        console.error("Failed to fetch policies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const filteredPolicies = policies.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesType = typeFilter === "all" || p.policyType === typeFilter;

    let matchesSearch = false;

    switch (searchQuery) {
      case "uploadedBy":
        matchesSearch = !!(
          p.uploadedBy?.username?.toLowerCase().includes(term) ||
          p.uploadedBy?.firstName?.toLowerCase().includes(term) ||
          p.uploadedBy?.lastName?.toLowerCase().includes(term)
        );
        break;

      case "client":
        matchesSearch = !!(
          p.clientId?.email?.toLowerCase().includes(term) ||
          p.clientId?.firstName?.toLowerCase().includes(term) ||
          p.clientId?.lastName?.toLowerCase().includes(term)
        );
        break;

      case "policyType":
        matchesSearch = !!p.policyType?.toLowerCase().includes(term);
        break;

      case "notes":
        matchesSearch = !!p.notes?.toLowerCase().includes(term);
        break;

      case "date":
        matchesSearch = !!new Date(p.createdAt)
          .toLocaleDateString()
          .toLowerCase()
          .includes(term);
        break;

      case "all":
      default:
        matchesSearch = !!(
          p.notes?.toLowerCase().includes(term) ||
          p.policyType?.toLowerCase().includes(term) ||
          p.uploadedBy?.username?.toLowerCase().includes(term) ||
          p.uploadedBy?.firstName?.toLowerCase().includes(term) ||
          p.uploadedBy?.lastName?.toLowerCase().includes(term) ||
          p.clientId?.email?.toLowerCase().includes(term) ||
          p.clientId?.firstName?.toLowerCase().includes(term) ||
          p.clientId?.lastName?.toLowerCase().includes(term) ||
          new Date(p.createdAt)
            .toLocaleDateString()
            .toLowerCase()
            .includes(term)
        );
        break;
    }

    return matchesType && matchesSearch;
  });

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
            <div className="relative w-full">
              <img
                src="/searchicon.svg"
                alt="Search Icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search policies..."
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
                    {p.uploadedBy.lastName || ""} ({p.uploadedBy.username})
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
              api.get("/policies").then((res) => {
                setPolicies(res.data);
                setShowModal(false);
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
