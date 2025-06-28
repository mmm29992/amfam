"use client";

import React from "react";
import axiosInstance from "../axiosInstance"; // adjust the path if needed

interface ChecklistItem {
  _id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  deadline?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  category?: string; // ← Add this
  subcategory?: string; // ← Add this
}

interface Props {
  item: ChecklistItem;
  onClose: () => void;
  onDeleteSuccess?: (updatedItems: ChecklistItem[]) => void;
}

const ChecklistDetailModal: React.FC<Props> = ({
  item,
  onClose,
  onDeleteSuccess,
}) => {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-xs bg-transparent"
      onClick={onClose}
    >
      <div
        className="bg-white text-blue-800 p-6 rounded-xl shadow-lg w-[90%] max-w-2xl relative"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-3">Task Details</h2>
        <p className="whitespace-pre-line mb-2">{item.text}</p>

        {item.category && item.subcategory && (
          <p className="text-sm text-gray-600 italic mb-2">
            Category: <span className="font-semibold">{item.category}</span> —
            Subcategory:{" "}
            <span className="font-semibold">{item.subcategory}</span>
          </p>
        )}

        {item.deadline && (
          <p className="text-sm italic mb-4">
            Deadline: {new Date(item.deadline).toLocaleString()}
          </p>
        )}

        <div className="text-right mt-4 flex justify-end gap-3">
          <button
            onClick={async () => {
              const confirmDelete = window.confirm(
                "Are you sure you want to delete this task?"
              );
              if (!confirmDelete) return;

              try {
                await axiosInstance.delete(`/checklist/${item._id}`);
                const updated = await axiosInstance.get("/checklist/me");
                onDeleteSuccess?.(updated.data);
                onClose();
              } catch (err) {
                console.error("Failed to delete checklist item", err);
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>

          <button
            onClick={onClose}
            className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistDetailModal;
