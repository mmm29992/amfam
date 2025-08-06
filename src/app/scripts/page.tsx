"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ScriptModal from "./ScriptModal";
import { useRouter } from "next/navigation";
import DynamicHeader from "../components/Header/DynamicHeader";

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

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const router = useRouter();

  const [user, setUser] = useState<{
    userType: "client" | "employee" | "owner";
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/auth/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch {
        console.error("Failed to fetch user.");
      }
    };

    fetchUser();
  }, []);

  const fetchScripts = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/scripts", {
        withCredentials: true,
      });
      setScripts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load scripts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleEdit = (script: Script) => {
    setEditingScript(script);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5001/api/scripts/${id}`, {
        withCredentials: true,
      });
      fetchScripts();
    } catch (err) {
      console.error("Failed to delete script.", err);
    }
  };

  const filteredScripts = scripts.filter((script) => {
    const term = debouncedSearchTerm;
    if (!term) return true;

    switch (searchField) {
      case "name":
        return script.name?.includes(term);
      case "english":
        return script.english?.includes(term);
      case "translation":
        return script.translation?.includes(term);
      case "createdBy":
        return script.createdBy?.username?.includes(term);
      case "updatedBy":
        return script.updatedBy?.username?.includes(term);
      case "createdAt":
        return script.createdAt?.includes(term);
      case "updatedAt":
        return script.updatedAt?.includes(term);
      case "all":
      default:
        return (
          script.name?.includes(term) ||
          script.english?.includes(term) ||
          script.translation?.includes(term) ||
          script.createdBy?.username?.includes(term) ||
          script.updatedBy?.username?.includes(term) ||
          script.createdAt?.includes(term) ||
          script.updatedAt?.includes(term)
        );
    }
  });

  return (
    <div className="min-h-screen bg-blue-800">
      <DynamicHeader />
      <div className="p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Script Library</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <img
                src="/searchicon.svg"
                alt="Search Icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search scripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-blue-700 px-3 py-2 rounded-md border bg-white border-gray-300"
              />
            </div>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="text-blue-700 px-3 py-2 rounded-md border bg-white border-gray-300"
            >
              <option value="all">All</option>
              <option value="name">Title</option>
              <option value="english">English</option>
              <option value="translation">Translation</option>
              <option value="createdBy">Created By</option>
              <option value="createdAt">Created Date</option>
              <option value="updatedBy">Updated By</option>
              <option value="updatedAt">Updated Date</option>
            </select>
          </div>
          {(user?.userType === "employee" || user?.userType === "owner") && (
            <button
              onClick={() => {
                setEditingScript(null);
                setShowModal(true);
              }}
              className="bg-white text-blue-800 px-4 py-2 rounded-md"
            >
              + New Script
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredScripts.length === 0 ? (
          <p>No scripts found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredScripts.map((script) => (
              <div
                key={script._id}
                className="bg-white text-blue-800 p-4 rounded-lg shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold mr-4 mt-1">{script.name}</h3>
                  <div className="flex space-x-2">
                    {(user?.userType === "employee" ||
                      user?.userType === "owner") && (
                      <button
                        onClick={() => handleEdit(script)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() =>
                        router.push(`/scripts/full?id=${script._id}`)
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      <img
                        src="/fullscreen.svg"
                        alt="Full Screen Icon"
                        className="w-5 h-5"
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white pt-2 items-center">
                  <div className="pr-2 border-r border-white flex items-center">
                    <span className="text-sm font-semibold w-24 mr-2">
                      English
                    </span>
                    <span className="text-sm whitespace-pre-wrap overflow-y-auto max-h-32 block p-2 rounded shadow-lg bg-white">
                      {script.english || "No English text provided."}
                    </span>
                  </div>
                  <div className="pl-2 flex items-center">
                    <span className="text-sm font-semibold w-24 mr-2">
                      Translated
                    </span>
                    <span className="text-sm whitespace-pre-wrap overflow-y-auto max-h-32 block p-2 rounded shadow-lg bg-white">
                      {script.translation || "No translated text provided."}
                    </span>
                  </div>
                </div>
                {(user?.userType === "employee" ||
                  user?.userType === "owner") && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleDelete(script._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ScriptModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchScripts}
          existingScript={editingScript}
        />
      )}
    </div>
  );
}
