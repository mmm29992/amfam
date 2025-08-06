"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

export default function EmployeeHeader() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<{
    username: string;
    userType: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        setUser(res.data.user);
      } catch {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="h-[150px] w-full bg-white flex flex-col">
      {/* Top Row */}
      <div className="flex-1 flex items-center justify-between px-6">
        {/* Left: Engle Agency + Mauricia */}
        <div className="flex items-center space-x-2">
          <button className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded">
            Engle Agency
          </button>
          <span className="text-blue-800 font-extrabold">with</span>
          <button className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded">
            Mauricia Engle
          </button>
        </div>

        {/* Right: Profile + Logout */}
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

      {/* Divider */}
      <div className="h-[1px] bg-blue-800 w-full"></div>

      {/* Main Nav Row */}
      <div className="flex-2 flex flex-col justify-center">
        <div className="relative flex justify-between items-center px-6">
          {/* Left: Nav Links */}
          <div className="flex items-center space-x-4 lg:space-x-8 z-10">
            <img
              src="/amfam-logo.svg"
              alt="Logo"
              className="h-[80px] w-auto mr-4"
            />
            <button
              onClick={() => router.push("/dashboard")}
              className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/scripts")}
              className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded"
            >
              View Scripts
            </button>
            <button
              onClick={() => router.push("/quotes")}
              className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded"
            >
              Quotes
            </button>
            <button
              onClick={() => router.push("/adminuserpage")}
              className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded"
            >
              Users
            </button>
          </div>

          {/* Center: Logo */}
          <div className="">
            <img
              src="/englelogo.png"
              alt="Engle Logo"
              className="h-[90px] max-w-[150px] object-contain"
            />
          </div>

          {/* Right: Message Button */}
          <div className="flex space-x-4 items-center z-10">
            <button
              onClick={() => router.push("/chat")} // Change if your chat page is different
              className="flex items-center text-white bg-blue-800 hover:bg-blue-700 px-6 py-6 rounded-md font-extrabold"
            >
              <img
                src="/messageicon.svg"
                alt="Message"
                className="w-5 h-5 mr-2"
              />
              Message Us
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Divider */}
      <div className="h-[2px] bg-red-600 w-full"></div>
    </header>
  );
}
