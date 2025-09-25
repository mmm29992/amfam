"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type UserLite = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userType?: "client" | "employee" | "owner";
};

type Policy = {
  _id: string;
  clientId: string;
  policyType?: string;
  notes?: string;
  originalName?: string; // original filename
  publicId?: string; // Cloudinary public_id (e.g., client_policies/abc123.pdf)
  url?: string; // if your API returns a direct/signed URL
  createdAt?: string;
};

interface PoliciesModalProps {
  user: UserLite; // the user whose policies we’re managing
  currentUserType: "client" | "employee" | "owner";
  onClose: () => void;
}

export default function UserPoliciesModal({
  user,
  currentUserType,
  onClose,
}: PoliciesModalProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [policyType, setPolicyType] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const canUpload =
    currentUserType === "owner" || currentUserType === "employee";
  const canDelete = currentUserType === "owner";

  const displayName = useMemo(() => {
    const cap = (s?: string) =>
      s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
    return `${cap(user.firstName)} ${cap(user.lastName)}`.trim();
  }, [user.firstName, user.lastName]);

  // ---- Load policies for this user ----
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/policies", {
        params: { clientId: user._id },
      });
      setPolicies(res.data || []);
    } catch (err) {
      console.error("Failed to fetch policies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user._id]);

  // ---- Handlers ----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected && selected.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }
    setError("");
    setFile(selected);
  };

  const handleUpload = async () => {
    setError("");
    if (!canUpload) return;
    if (!file) return setError("Please choose a PDF file.");
    // If your backend expects a different field name than 'policyFile', change it here.
    // Common options: 'file' or 'policyFile'
    try {
      setUploading(true);
      const form = new FormData();
      form.append("clientId", user._id);
      form.append("policyFile", file); // 🔁 change to 'file' if your multer expects it
      if (policyType) form.append("policyType", policyType);
      if (notes) form.append("notes", notes);

      await api.post("/policies/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFile(null);
      setPolicyType("");
      setNotes("");
      await fetchPolicies();
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload policy.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (p: Policy) => {
    // Prefer direct URL if API provides it
    if (p.url) {
      window.open(p.url, "_blank");
      return;
    }
    if (!p.publicId) {
      setError("Missing file identifier for download.");
      return;
    }
    // Your Express router has: router.get("/download/*", downloadPolicyPdf)
    const safe = encodeURIComponent(p.publicId);
    window.open(`/api/policies/download/${safe}`, "_blank"); // change base if needed
  };

  const handleDelete = async (p: Policy) => {
    if (!canDelete) return;
    const confirmDelete = confirm("Delete this policy? This cannot be undone.");
    if (!confirmDelete) return;
    try {
      await api.delete(`/policies/${p._id}`);
      await fetchPolicies();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete policy.");
    }
  };

  const prettyDate = (s?: string) => (s ? new Date(s).toLocaleString() : "");

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
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-1 text-center">User Policies</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          {displayName
            ? `Viewing policies for ${displayName}`
            : "Client policies"}
        </p>

        {/* Upload Area (owners & employees) */}
        {canUpload && (
          <>
            {/* Policy Type */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Policy Type (optional):
              </label>
              <select
                className="w-full border p-2 rounded bg-white"
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
              >
                <option value="">-- Select Policy Type --</option>
                <option value="Auto">Auto</option>
                <option value="Home">Home</option>
                <option value="Renters">Renters</option>
                <option value="Life">Life</option>
                <option value="Umbrella">Umbrella</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Select PDF File:</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block mb-1 font-medium">
                Notes (optional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border p-2 rounded"
                rows={3}
                placeholder="E.g. Home policy renewals for 2026"
              />
            </div>

            <div className="flex justify-end space-x-3 mb-6">
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Policy"}
              </button>
            </div>
          </>
        )}

        {/* Error */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* List */}
        <div className="border rounded overflow-hidden">
          <div className="grid grid-cols-12 bg-blue-50 text-blue-900 font-semibold text-sm px-4 py-2">
            <div className="col-span-5">File</div>
            <div className="col-span-3">Type</div>
            <div className="col-span-3">Uploaded</div>
            <div className="col-span-1 text-right"> </div>
          </div>

          <div className="max-h-[45vh] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-gray-600">Loading…</div>
            ) : policies.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">No policies yet.</div>
            ) : (
              policies.map((p) => (
                <div
                  key={p._id}
                  className="grid grid-cols-12 items-center px-4 py-3 border-t text-sm"
                >
                  <div className="col-span-5 break-words">
                    {p.originalName || p.publicId || "Policy.pdf"}
                  </div>
                  <div className="col-span-3">{p.policyType || "—"}</div>
                  <div className="col-span-3">{prettyDate(p.createdAt)}</div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDownload(p)}
                      className="text-blue-800 hover:underline"
                    >
                      Download
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(p)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Close */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-blue-800 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
