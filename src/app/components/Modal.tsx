"use client";
import React, { useState } from "react";
import axios from "axios";
import LoginForm from "./LoginForm";
import SignUpModal from "./SignUpModal";
import { useRouter } from "next/navigation";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const UserTypeSelection: React.FC<{
  userType: "client" | "employee";
  setUserType: React.Dispatch<React.SetStateAction<"client" | "employee">>;
}> = ({ userType, setUserType }) => (
  <div className="flex justify-around mb-4">
    <button
      onClick={() => setUserType("client")}
      className={`px-4 py-2 rounded-md w-32 transition-all ${
        userType === "client"
          ? "bg-blue-500 text-white border border-red-600"
          : "bg-gray-400 text-gray-800 hover:bg-blue-100"
      }`}
    >
      Client
    </button>
    <button
      onClick={() => setUserType("employee")}
      className={`px-4 py-2 rounded-md w-32 transition-all ${
        userType === "employee"
          ? "bg-blue-500 text-white border border-red-600"
          : "bg-gray-400 text-gray-600 hover:bg-blue-100"
      }`}
    >
      Employee
    </button>
  </div>
);

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [userType, setUserType] = useState<"client" | "employee">("client");
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const isValidIdentifier = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return emailRegex.test(value) || usernameRegex.test(value);
  };

  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const closeSignUpModal = () => setIsSignUpModalOpen(false);
  const openSignUpModal = () => setIsSignUpModalOpen(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !password) {
      setError("Please fill out both fields");
      return;
    }

    if (!isValidIdentifier(identifier)) {
      setError("Enter a valid email or username");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        { identifier, password, userType },
        { withCredentials: true }
      );

      console.log("Login successful:", response.data);
      onClose();
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Login error:", err.response?.data || err.message);
      } else {
        console.error("Login error:", err);
      }
      setError("Invalid credentials");
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-xs bg-transparent"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 w-112 rounded-xl shadow-lg relative"
        onClick={handleModalClick}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-3xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
          Log in to My Account
        </h2>

        <UserTypeSelection userType={userType} setUserType={setUserType} />

        <LoginForm
          identifier={identifier}
          password={password}
          setIdentifier={setIdentifier}
          setPassword={setPassword}
          handleLogin={handleLogin}
          error={error}
        />

        <div className="text-center mt-4">
          <p className="text-gray-400">
            Need to create an account?{" "}
            <a href="#" className="text-blue-500" onClick={openSignUpModal}>
              Sign up here
            </a>
          </p>
        </div>
      </div>

      {isSignUpModalOpen && (
        <SignUpModal isOpen={isSignUpModalOpen} onClose={closeSignUpModal} />
      )}
    </div>
  );
};

export default Modal;
