"use client";
import React from "react";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string; // ✅ added this
  userType: "client" | "employee" | "owner";
};

type InfoModalProps = {
  user: User;
  onClose: () => void;
  currentUserType: "client" | "employee" | "owner"; // ✅ Add this line
};

const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const InfoModal: React.FC<InfoModalProps> = ({ user, onClose }) => {
  const handleBackgroundClick = () => {
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-white text-blue-800 w-[28rem] max-w-[90%] p-8 rounded-xl shadow-xl relative"
        onClick={handleContentClick}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-3xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-2">👤 Personal Info</h2>

        <div className="space-y-2 mt-4 text-sm text-gray-800">
          <p>
            <strong>Name:</strong> {capitalize(user.firstName)}{" "}
            {capitalize(user.lastName)}
          </p>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong>{" "}
            <span className="capitalize">{user.userType}</span>
          </p>
          <p>
            <strong>User ID:</strong> {user._id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
