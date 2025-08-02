"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { format } from "date-fns";

type ChecklistItem = {
  _id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  deadline?: string;
  category: string;
  subcategory: string;
};

type ChecklistModalProps = {
  user: {
    firstName: string;
    lastName: string;
    _id: string;
  };
  onClose: () => void;
};

const ChecklistModal: React.FC<ChecklistModalProps> = ({ user, onClose }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/checklist/user/${user._id}`) // 👈 Make sure this route is implemented or add a fallback using `.get("/checklist")` and filter manually
      .then((res) => setItems(res.data))
      .catch((err) => {
        console.error("Failed to fetch checklist", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [user._id]);

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
          🧾 Checklist for {user.firstName} {user.lastName}
        </h2>

        {loading ? (
          <p className="text-sm italic text-gray-600">Loading checklist...</p>
        ) : items.length === 0 ? (
          <p className="text-sm italic text-gray-600">
            No checklist items found for this user.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item._id}
                className="border-b border-gray-300 pb-3 text-sm text-gray-800"
              >
                <p className="font-semibold">📌 {item.text}</p>
                <p className="italic text-gray-600">
                  🗂️ {item.category} / {item.subcategory}
                </p>
                {item.deadline && (
                  <p className="text-gray-700">
                    ⏳ Deadline: {format(new Date(item.deadline), "PPP")}
                  </p>
                )}
                <p className="text-gray-700">
                  ✅ Status:{" "}
                  {item.completed
                    ? `Completed at ${format(
                        new Date(item.completedAt!),
                        "PPPp"
                      )}`
                    : "Incomplete"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChecklistModal;
