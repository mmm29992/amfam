"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";

// Define expected user type
type User = {
  username: string;
  email: string;
  userType: "client" | "employee";
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("/auth/me");
        setUser(response.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/";
    }
  }, [loading, user]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="min-h-screen bg-blue-800">
      <header className="h-[150px] w-full bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Duluth, Ga
            </button>
            <span className="text-blue-800 font-extrabold">with</span>
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Mauricia Engle
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Find an Agent
            </button>
            <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              Contact Us
            </button>
            <button
              onClick={handleLogout}
              className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-blue-800 w-full"></div>

        <div className="flex-2 flex flex-col justify-center">
          <div className="flex justify-between items-center px-6">
            <div className="flex items-center space-x-4 lg:space-x-8">
              <img
                src="/amfam-logo.svg"
                alt="American Family Insurance Logo"
                className="h-[80px] w-auto mr-4"
              />
              <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
                Insurance
              </button>
              <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
                Claims
              </button>
              <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
                Customer Support
              </button>
              <button className="text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
                Resources
              </button>
            </div>

            <div className="flex space-x-4 items-center">
              <button className="flex items-center text-white bg-blue-800 hover:bg-blue-700 px-6 py-6 rounded-md font-extrabold">
                <img
                  src="/messageicon.svg"
                  alt="Message Icon"
                  className="w-5 h-5 mr-2"
                />
                Message Us
              </button>
              <button className="flex items-center text-blue-800 bg-transparent hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
                <img
                  src="/searchicon.svg"
                  alt="Search Icon"
                  className="w-5 h-5 mr-2"
                />
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="h-[2px] bg-red-600 w-full"></div>
      </header>

      {/* Dashboard content */}
      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h1>
        {user && (
          <div>
            <p className="text-lg">Hello, {user.username}!</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.userType}</p>
          </div>
        )}
      </div>
    </div>
  );
}
