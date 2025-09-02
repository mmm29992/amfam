"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";

type ChecklistItem = {
  _id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  deadline?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  category?: string;
  subcategory?: string;
};



const categoryOptions = [
  "Quote Follow Up",
  "Life",
  "Commercial",
  "PL Home",
  "PL Auto",
  "PL Renters",
];

const subcategoryOptions = [
  "Quotes Follow Up",
  "No Pay",
  "Cancel Status",
  "Cancel",
  "No Renewal",
  "Discount Remove",
  "Documents Needed",
];


interface ChecklistModalProps {
  onClose: () => void;
  onSuccess: (items: ChecklistItem[]) => void;
}

const ChecklistModal: React.FC<ChecklistModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [text, setText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  useEffect(() => {
    const nowPlusFiveMin = new Date(Date.now() + 5 * 60 * 1000);
    setDeadline(nowPlusFiveMin.toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanText = text.trim();
    if (!cleanText) {
      setError("Task description is required");
      return;
    }

    if (deadline && new Date(deadline) < new Date()) {
      setError("Deadline must be in the future.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/checklist", {
        text: cleanText,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        category,
        subcategory,
      });
      

      const res = await api.get("/checklist/me");
      onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error("Failed to add checklist item", err);
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 w-96 rounded-xl shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">
          New Checklist Item
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            autoFocus
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Task description"
            className="border px-4 py-2 rounded text-black"
          />

          <label className="text-sm text-gray-600">Deadline (optional)</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="border px-4 py-2 rounded text-black"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-4 py-2 rounded text-black"
            required
          >
            <option value="">Select Category</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="border px-4 py-2 rounded text-black"
            required
          >
            <option value="">Select Subcategory</option>
            {subcategoryOptions.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`py-2 rounded ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition`}
          >
            {isSubmitting ? "Adding..." : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChecklistModal;
