"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ScriptModal from "./ScriptModal";
import { useRouter } from "next/navigation";

interface Script {
  _id: string;
  name: string;
  english: string;
  translation: string;
  createdBy?: string;
  updatedBy?: string;
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
    const term = debouncedSearchTerm.toLowerCase();
    if (!term) return true;

    switch (searchField) {
      case "name":
        return script.name?.toLowerCase().includes(term);
      case "english":
        return script.english?.toLowerCase().includes(term);
      case "translation":
        return script.translation?.toLowerCase().includes(term);
      case "createdBy":
        return script.createdBy?.toLowerCase().includes(term);
      case "updatedBy":
        return script.updatedBy?.toLowerCase().includes(term);
      case "createdAt":
        return script.createdAt?.toLowerCase().includes(term);
      case "updatedAt":
        return script.updatedAt?.toLowerCase().includes(term);
      case "all":
      default:
        return (
          script.name?.toLowerCase().includes(term) ||
          script.english?.toLowerCase().includes(term) ||
          script.translation?.toLowerCase().includes(term) ||
          script.createdBy?.toLowerCase().includes(term) ||
          script.updatedBy?.toLowerCase().includes(term) ||
          script.createdAt?.toLowerCase().includes(term) ||
          script.updatedAt?.toLowerCase().includes(term)
        );
    }
  });

  return (
    <div className="min-h-screen bg-blue-800">
      {/* HEADER */}
      <header className="h-[150px] w-full bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Duluth, Ga
            </button>
            <span className="text-blue-800 font-extrabold">with</span>
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Mauricia Engle
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Find an Agent
            </button>
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Contact Us
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-blue-800 w-full"></div>

        <div className="flex-2 flex flex-col justify-center">
          <div className="flex justify-between items-center px-6">
            <div className="flex items-center space-x-4 lg:space-x-8">
              <img
                src="/amfam-logo.svg"
                alt="American Family Insurance Logo"
                className="h-[80px] w-auto mr-4"
              />
              <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
                Insurance
              </button>
              <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
                Claims
              </button>
              <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
                Customer Support
              </button>
              <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
                Resources
              </button>
            </div>
            <div className="flex space-x-4 items-center">
              <button className="flex items-center text-white bg-blue-800 hover:bg-blue-700 px-6 py-6 rounded-md font-extrabold">
                <img
                  src="/messageicon.svg"
                  alt="Message Icon"
                  className="w-5 h-5 mr-2"
                />
                Message Us
              </button>
              <button className="flex items-center text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
                <img
                  src="/searchicon.svg"
                  alt="Search Icon"
                  className="w-5 h-5 mr-2"
                />
                Search
              </button>
            </div>
          </div>
        </div>
        <div className="h-[2px] bg-red-600 w-full"></div>
      </header>

      {/* MAIN CONTENT */}
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
          <button
            onClick={() => {
              setEditingScript(null);
              setShowModal(true);
            }}
            className="bg-white text-blue-800 px-4 py-2 rounded-md"
          >
            + New Script
          </button>
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
                    <button
                      onClick={() => handleEdit(script)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
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
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleDelete(script._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
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
