import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useRouter } from "next/navigation";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SignUpModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"client" | "employee">("client");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword || !userType) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    console.log("Registering user:", { username, email, userType });

    try {
      const response = await axiosInstance.post(
        "/auth/register",
        { username, email, password, userType },
        { withCredentials: true }
      );

      if (response.status === 201) {
        onClose(); // ✅ Close the modal
        router.push("/dashboard"); // ✅ Redirect to dashboard
      } else {
        setError("Error registering user. Please try again.");
      }
    } catch (err: any) {
      if (err.response) {
        console.error("Signup error:", err.response.data);
        setError(
          err.response.data.message ||
            "Error registering user. Please try again."
        );
      } else {
        console.error("axios error:", err.message);
        setError("Network error. Check your connection and try again.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-xs bg-transparent"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 w-112 rounded-xl shadow-lg relative border border-black"
        onClick={handleModalClick}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-3xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
          Create an Account
        </h2>

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-500 text-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-500 text-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-500 text-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-500 text-gray-600 focus:outline-none focus:border-blue-500"
            required
          />

          <div className="mb-4">
            <label className="text-gray-800 mr-4">Select User Type:</label>
            <div className="flex items-center">
              <label className="mr-4 text-gray-600">
                <input
                  type="radio"
                  name="userType"
                  value="client"
                  checked={userType === "client"}
                  onChange={() => setUserType("client")}
                  className="mr-2"
                />
                Client
              </label>
              <label className="text-gray-600">
                <input
                  type="radio"
                  name="userType"
                  value="employee"
                  checked={userType === "employee"}
                  onChange={() => setUserType("employee")}
                  className="mr-2"
                />
                Employee
              </label>
            </div>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex items-center text-gray-400">
            <input type="checkbox" className="mr-2" required />I agree to the{" "}
            <a href="#" className="text-blue-500">
              terms and conditions
            </a>
            .
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-400">
            Already have an account?{" "}
            <a href="#" className="text-blue-500" onClick={onClose}>
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
