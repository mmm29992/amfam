"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function ClientHeader() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<{
    username: string;
    userType: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="h-[150px] w-full bg-white flex flex-col">
      {/* Top Row */}
      <div className="flex-1 flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <button className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded">
            Engle Agency
          </button>
          <span className="text-blue-800 font-extrabold">with</span>
          <button className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded">
            Mauricia Engle
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/profile")}
            className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded"
          >
            My Profile
          </button>
          <button
            onClick={handleLogout}
            className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="h-[1px] bg-blue-800 w-full"></div>

      {/* Bottom Row: Nav left, Message right */}
      <div className="flex-2 flex justify-between items-center px-6">
        {/* Left Nav Buttons */}
        <div className="flex items-center space-x-4 lg:space-x-8">
          <img
            src="/amfam-logo.svg"
            alt="American Family Insurance Logo"
            className="h-[80px] w-auto mr-4"
          />
          <button
            onClick={() => router.push("/dashboard")}
            className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push("/quotes/clients")}
            className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded"
          >
            My Quotes
          </button>
          {/* ✅ New: My Policies */}
          <button
            onClick={() => router.push("/policies/clients")}
            className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded"
          >
            My Policies
          </button>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          <img
            src="/englelogo.png"
            alt="Engle Logo"
            className="h-[90px] max-w-[150px] object-contain"
          />
        </div>

        {/* Right Message Button */}
        <button
          onClick={() => router.push("/chat/clients")}
          className="flex items-center text-white bg-blue-800 hover:bg-blue-700 px-6 py-6 rounded-md font-extrabold"
        >
          <img
            src="/messageicon.svg"
            alt="Message Icon"
            className="w-5 h-5 mr-2"
          />
          Message Us
        </button>
      </div>

      <div className="h-[2px] bg-red-600 w-full"></div>
    </header>
  );
}
