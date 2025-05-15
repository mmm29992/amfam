import React, { useState } from "react";
import axios from "axios"; // Import Axios for HTTP requests
import LoginForm from "./LoginForm"; // Import the LoginForm component
import SignUpModal from "./SignUpModal"; // Import SignUpModal

// Define the types for props passed to the Modal component
type ModalProps = {
  isOpen: boolean; // Indicates whether the modal is open or not
  onClose: () => void; // Function to close the modal
};

// UserTypeSelection component to handle Client/Employee selection
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
  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const [userType, setUserType] = useState<"client" | "employee">("client");
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false); // State to control Sign Up modal
  const [email, setEmail] = useState(""); // Email state
  const [password, setPassword] = useState(""); // Password state
  const [error, setError] = useState(""); // Error handling state

  const closeSignUpModal = () => setIsSignUpModalOpen(false);
  const openSignUpModal = () => setIsSignUpModalOpen(true);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill out both email and password");
      return;
    }

    try {
      // Send POST request with userType included
      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email,
          password,
          userType, // Include userType in the login request
        }
      );

      // On successful login, store the JWT token
      localStorage.setItem("token", response.data.token);

      // Redirect to dashboard or another page after login
      window.location.href = "/dashboard"; // You can replace this with your redirect logic
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "Login error:",
          err.response ? err.response.data : err.message
        );
      } else {
        console.error("Login error:", err);
      }
      setError("Invalid credentials"); // Set error message if login fails
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-xs bg-transparent"
      onClick={onClose} // Close modal when clicking outside of it
    >
      <div
        className="bg-white p-8 w-112 rounded-xl shadow-lg relative"
        onClick={handleModalClick} // Prevent closing when clicking inside the modal content
      >
        {/* Close button (Red X icon) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-3xl"
        >
          &times;
        </button>

        {/* Modal title */}
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
          Log in to My Account
        </h2>

        {/* User Type Selection: Client or Employee */}
        <UserTypeSelection userType={userType} setUserType={setUserType} />

        {/* Login form */}
        <LoginForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          handleLogin={handleLogin}
          error={error}
        />

        <div className="text-center mt-4">
          <p className="text-gray-400">
            Need to create an account?{" "}
            <a
              href="#"
              className="text-blue-500"
              onClick={openSignUpModal} // Open Sign Up modal when clicked
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>

      {/* Sign Up Modal Component */}
      {isSignUpModalOpen && (
        <SignUpModal
          isOpen={isSignUpModalOpen}
          onClose={closeSignUpModal} // Pass onClose to SignUpModal
        />
      )}
    </div>
  );
};

export default Modal;
