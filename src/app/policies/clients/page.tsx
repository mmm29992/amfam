"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

type Client = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type Policy = {
  _id: string;
  policyFileUrl: string;
  notes?: string;
  policyType: string;
  createdAt: string;
};

interface PolicyModalProps {
  onClose: () => void;
  onSuccess: (policy: Policy) => void;
}

export default function PolicyModal({ onClose, onSuccess }: PolicyModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/auth/clients");
        setClients(res.data);
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      }
    };
    fetchClients();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }
    setFile(f);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    if (!selectedClientId || !file || !policyType) {
      setError("Client, policy type, and a PDF file are required.");
      return;
    }

    const formData = new FormData();
    formData.append("clientId", selectedClientId);
    formData.append("policyType", policyType);
    formData.append("notes", notes);
    formData.append("policyFile", file); // <- field name matches multer single("policyFile")

    setLoading(true);
    try {
      const res = await api.post("/policies/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess(res.data.policy || res.data); // depending on your controller shape
    } catch (err: any) {
      console.error("Upload failed:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Failed to upload policy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 w-[700px] max-w-[95vw] rounded-xl shadow-lg relative text-blue-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-3xl"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Policy PDF
        </h2>

        {/* Client */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Client:</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">-- Select Client --</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.firstName} {c.lastName} ({c.email})
              </option>
            ))}
          </select>
        </div>

        {/* Policy Type */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Policy Type:</label>
          <select
            className="w-full border p-2 rounded"
            value={policyType}
            onChange={(e) => setPolicyType(e.target.value)}
          >
            <option value="">-- Select Policy Type --</option>
            <option value="Auto">Auto</option>
            <option value="Home">Home</option>
            <option value="Life">Life</option>
            <option value="Renters">Renters</option>
            <option value="Business">Business</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* File */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select PDF File:</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Notes (staff-only) */}
        <div className="mb-2">
          <label className="block mb-1 font-medium">Notes (optional):</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
            placeholder="E.g. renewal docs, binder issued, etc."
          />
          <p className="text-xs text-gray-500 mt-1">
            Notes are visible to employees/owner only (clients will not see
            this).
          </p>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-blue-800 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
