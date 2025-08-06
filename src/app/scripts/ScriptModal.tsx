"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Script {
  _id?: string;
  name: string;
  english: string;
  translation: string;
}

interface ScriptModalProps {
  onClose: () => void;
  onSuccess: () => void;
  existingScript?: Script | null;
}

const ScriptModal: React.FC<ScriptModalProps> = ({
  onClose,
  onSuccess,
  existingScript,
}) => {
  const [name, setName] = useState(existingScript?.name || "");
  const [english, setEnglish] = useState(existingScript?.english || "");
  const [translation, setTranslation] = useState(
    existingScript?.translation || ""
  );
  const [error, setError] = useState("");
  

  

  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !english || !translation) {
      setError("All fields are required");
      return;
    }

    try {
      if (existingScript?._id) {
        await axios.put(
          `http://localhost:5001/api/scripts/${existingScript._id}`,
          { name, english, translation },
          { withCredentials: true }
        );
      } else {
        await axios.post(
          "http://localhost:5001/api/scripts",
          { name, english, translation },
          { withCredentials: true }
        );
      }

      onClose();
      onSuccess();
    } catch (err) {
      console.error("Failed to save script", err);
      setError("Failed to save script");
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-xs bg-transparent"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 w-112 rounded-xl shadow-lg relative border border-black"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-3xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
          {existingScript ? "Edit Script" : "Add New Script"}
        </h2>

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Script Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-500 text-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
          <textarea
            placeholder="English Text"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-500 text-gray-600 focus:outline-none focus:border-blue-500"
            rows={4}
            required
          />
          <textarea
            placeholder="Spanish Text"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-500 text-gray-600 focus:outline-none focus:border-blue-500"
            rows={4}
            required
          />

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md"
            >
              {existingScript ? "Update Script" : "Create Script"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScriptModal;
