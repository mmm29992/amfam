import { useState } from "react";
import axiosInstance from "../axiosInstance"; // Ensure axiosInstance is properly imported

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"client" | "employee">("client"); // Add userType state
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/register", {
        username,
        email,
        password,
        userType, // Send userType with the request
      });

      window.location.href = "/login"; // Redirect to login or another page after successful registration
    } catch (err) {
      setError("Server error or user already exists"); // Show error if sign-up fails
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* User Type Selection */}
        <div className="mb-4">
          <label className="mr-4">Select User Type:</label>
          <div className="flex items-center">
            <label className="mr-4">
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
            <label>
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

        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpForm;
