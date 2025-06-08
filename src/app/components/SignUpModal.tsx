import React, { useState } from "react";
import axiosInstance from "../axiosInstance";
import { useRouter } from "next/navigation";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SignUpModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"client" | "employee">("client");
  const [employeeAccessCode, setEmployeeAccessCode] = useState("");

  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();

  const handleStartRegistration = async (e: React.FormEvent) => {
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

    try {
      await axiosInstance.post("/auth/start-registration", {
        firstName,
        lastName,
        username,
        email,
        password,
        userType,
        employeeAccessCode:
          userType === "employee" ? employeeAccessCode : undefined,
      });      
      setStep(2);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error sending verification code. Please try again."
      );
    }
  };

  const handleVerifyAndRegister = async () => {
    setError("");

    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit code sent to your email.");
      return;
    }

    try {
      await axiosInstance.post("/auth/verify-email-code", {
        firstName,
        lastName,
        username,
        email,
        password,
        userType,
        code,
        ...(userType === "employee" && { employeeAccessCode }),
      });

      router.push("/dashboard");
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Verification failed. Please try again."
      );
    }
  };

  const isFormValid =
    firstName &&
    lastName &&
    username &&
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword &&
    (userType !== "employee" || employeeAccessCode);


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
          {step === 1 ? "Create an Account" : "Verify Your Email"}
        </h2>

        {step === 1 && (
          <form
            className="flex flex-col space-y-4"
            onSubmit={handleStartRegistration}
          >
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-1/2 px-4 py-2 border rounded-md border-blue-800 placeholder-gray-300 text-black"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-1/2 px-4 py-2 border rounded-md border-blue-800 placeholder-gray-300 text-black"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-300 text-black"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-300 text-black
"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-300 text-black"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-300 text-black"
              required
            />
            {userType === "employee" && (
              <input
                type="text"
                placeholder="Enter Access Code"
                value={employeeAccessCode}
                onChange={(e) => setEmployeeAccessCode(e.target.value)}
                className="px-4 py-2 border rounded-md border-blue-800 placeholder-gray-300 text-black"
                required
              />
            )}

            <div>
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
              <input type="checkbox" className="mr-2" required />
              <span>
                I agree to the{" "}
                <a href="#" className="text-blue-500">
                  terms and conditions
                </a>
                .
              </span>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className={`px-6 py-2 rounded-md ${
                  isFormValid
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!isFormValid}
              >
                Send Verification Code
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Enter the 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="px-4 py-2 border rounded-md border-blue-800"
            />
            <button
              onClick={handleVerifyAndRegister}
              className="bg-blue-500 text-white px-6 py-2 rounded-md"
            >
              Verify Code & Register
            </button>

            {error && <p className="text-red-600">{error}</p>}
          </div>
        )}

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
