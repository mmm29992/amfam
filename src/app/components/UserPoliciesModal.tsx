"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";

type User = {
  _id: string;
  userType: string; // "client" | "employee" | "owner"
  firstName: string;
  lastName: string;
  email: string;
};

type Policy = {
  _id: string;
  policyFileUrl: string; // direct or signed URL to the PDF
  notes?: string; // staff-only if your API hides for clients
  policyType: string;
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

const UserPoliciesModal: React.FC<Props> = ({ user, onClose }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/policies")
      .then((res) => {
        // mirror your QuotesModal filtering:
        // - clients see policies where they are the client
        // - employees/owners see ones they uploaded (by email)
        const filtered = res.data.filter((p: Policy) => {
          if (user.userType === "client") return p.clientId?._id === user._id;
          return p.uploadedBy?.email === user.email;
        });
        setPolicies(filtered);
      })
      .catch((err) => console.error("Failed to fetch policies", err))
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
          Policies {user.userType === "client" ? "for" : "by"} {user.firstName}{" "}
          {user.lastName}
        </h2>

        {loading ? (
          <p className="text-sm italic text-gray-600">Loading policies...</p>
        ) : policies.length === 0 ? (
          <p className="text-sm italic text-gray-600">
            No policies found for this user.
          </p>
        ) : (
          <ul className="space-y-4">
            {policies.map((p) => (
              <li key={p._id} className="border-b pb-4 border-gray-300">
                <p className="font-semibold">📄 Type: {p.policyType}</p>
                {p.notes && <p className="text-sm">📝 Notes: {p.notes}</p>}
                <p className="text-sm">
                  📥 Uploaded by: {p.uploadedBy?.firstName}{" "}
                  {p.uploadedBy?.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  📅 Uploaded: {format(new Date(p.createdAt), "PPP p")}
                </p>
                <p className="text-sm">
                  👤 For client: {p.clientId?.firstName} {p.clientId?.lastName}{" "}
                  ({p.clientId?.email})
                </p>
                <a
                  href={p.policyFileUrl}
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

export default UserPoliciesModal;
