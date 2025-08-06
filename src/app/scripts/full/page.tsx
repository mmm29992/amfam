"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import ScriptModal from "../ScriptModal"; // adjust path if needed
import DynamicHeader from "../../components/Header/DynamicHeader"; // Adjust the path if needed

interface Script {
  _id: string;
  name: string;
  english: string;
  translation: string;
  createdBy?: { username: string };
  updatedBy?: { username: string };
  createdAt?: string;
  updatedAt?: string;
}

function formatDate(dateString?: string) {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleString();
}

export default function FullScreenScriptPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [script, setScript] = useState<Script | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchScript = async () => {
      if (!id) {
        setError("No script ID provided.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5001/api/scripts/${id}`, {
          withCredentials: true,
        });
        setScript(res.data);
      } catch {
        setError("Failed to load script.");
      } finally {
        setLoading(false);
      }
    };
    fetchScript();
  }, [id]);

  return (
    <div className="min-h-screen bg-blue-800">
      <DynamicHeader />

      {/* Fullscreen background */}

      <div className="p-8 text-white">
        {loading ? (
          <p>Loading...</p>
        ) : error || !script ? (
          <p>{error || "Script not found."}</p>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{script.name}</h2>
            <div>
              <h3 className="font-semibold mb-1">English:</h3>
              <p className="bg-white text-blue-800 p-4 rounded shadow whitespace-pre-wrap">
                {script.english}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Translation:</h3>
              <p className="bg-white text-blue-800 p-4 rounded shadow whitespace-pre-wrap">
                {script.translation}
              </p>
            </div>
            <div className="text-sm mt-4 space-y-1">
              <p>
                <strong>Created By:</strong>{" "}
                {script.createdBy?.username || "Unknown"}
              </p>
              <p>
                <strong>Created At:</strong> {formatDate(script.createdAt)}
              </p>
              <p>
                <strong>Updated By:</strong>{" "}
                {script.updatedBy?.username || "Unknown"}
              </p>
              <p>
                <strong>Updated At:</strong> {formatDate(script.updatedAt)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => router.push("/scripts")}
                className="bg-white text-blue-800 px-4 py-2 rounded-md font-semibold hover:bg-blue-100"
              >
                ← Back to Scripts
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-md font-semibold hover:bg-yellow-300"
              >
                ✏️ Edit Script
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && script && (
        <ScriptModal
          onClose={() => setShowModal(false)}
          onSuccess={() => window.location.reload()}
          existingScript={script}
        />
      )}
    </div>
  );
}
