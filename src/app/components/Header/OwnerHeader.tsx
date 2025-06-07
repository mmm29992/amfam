"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";

export default function EmployeeHeader() {
  const router = useRouter();
  const [user, setUser] = useState<{
    username: string;
    userType: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        setUser(res.data.user);
      } catch (err) {
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
      <div className="flex-1 flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <button className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded">
            Duluth, Ga
          </button>
          <span className="text-blue-800 font-extrabold">with</span>
          <button className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded">
            Mauricia Engle
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded">
            Find an Agent
          </button>
          <button className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded">
            Contact Us
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

      <div className="flex-2 flex flex-col justify-center">
        <div className="flex justify-between items-center px-6">
          <div className="flex items-center space-x-4 lg:space-x-8">
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
              onClick={() => router.push("/profile")}
              className="text-blue-800 font-extrabold hover:bg-blue-100 px-4 py-2 rounded"
            >
              My Profile
            </button>
          </div>

          <div className="flex space-x-4 items-center">
            <button className="flex items-center text-white bg-blue-800 hover:bg-blue-700 px-6 py-6 rounded-md font-extrabold">
              <img
                src="/messageicon.svg"
                alt="Message"
                className="w-5 h-5 mr-2"
              />
              Message Us
            </button>
            <button className="flex items-center text-blue-800 hover:bg-blue-100 px-4 py-2 rounded font-extrabold">
              <img
                src="/searchicon.svg"
                alt="Search"
                className="w-5 h-5 mr-2"
              />
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="h-[2px] bg-red-600 w-full"></div>
    </header>
  );
}
