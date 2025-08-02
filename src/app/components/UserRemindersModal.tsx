"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { format } from "date-fns";

type Reminder = {
  _id: string;
  title: string;
  message: string;
  scheduledTime: string;
  category: string;
  subcategory: string;
  forClient: boolean;
  targetEmail?: string;
  emailStatus: "queued" | "sent" | "failed";
  sent: boolean;
  creatorId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
};

type RemindersModalProps = {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
  };
  onClose: () => void;
};

const RemindersModal: React.FC<RemindersModalProps> = ({ user, onClose }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/reminders/user/${user._id}`)
      .then((res) => setReminders(res.data))
      .catch((err) => console.error("Error fetching reminders:", err))
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
          🗓️ Reminders for {user.firstName} {user.lastName}
        </h2>

        {loading ? (
          <p className="text-sm text-gray-600 italic">Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <p className="text-sm text-gray-600 italic">
            No reminders found for this user.
          </p>
        ) : (
          <ul className="space-y-5">
            {reminders.map((r) => (
              <li
                key={r._id}
                className="bg-blue-50 border border-blue-300 rounded-lg p-4 shadow-sm"
              >
                <p className="font-semibold text-lg mb-1">📝 {r.title}</p>
                <p className="text-sm text-gray-700 mb-1">
                  📂 {r.category} → {r.subcategory}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  🕒 {format(new Date(r.scheduledTime), "PPPp")}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  📧 Recipient:{" "}
                  {r.forClient
                    ? r.targetEmail || "Client"
                    : `${user.firstName} ${user.lastName}`}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  📬 Email Status:{" "}
                  {r.emailStatus.charAt(0).toUpperCase() +
                    r.emailStatus.slice(1)}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  📌 Sent: {r.sent ? "✅ Yes" : "❌ No"}
                </p>
                {r.creatorId && (
                  <p className="text-sm text-gray-700">
                    🧾 Created by: {r.creatorId.firstName}{" "}
                    {r.creatorId.lastName}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RemindersModal;
