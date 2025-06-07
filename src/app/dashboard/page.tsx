"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import ReminderModal from "./ReminderModal";
import DynamicHeader from "../components/Header/DynamicHeader"; // Adjust path if needed

interface Reminder {
  _id: string;
  title: string;
  message: string;
  scheduledTime: string;
  creatorId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  emailSubject?: string;
  emailBody?: string;
  targetEmail?: string;
  deleted?: boolean;
}

const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

type User = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  userType: "client" | "employee" | "owner";
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentFilter, setSentFilter] = useState<
    "all" | "sent" | "unsent" | "deleted"
  >("all");
  const [sortOption, setSortOption] = useState<"newest" | "oldest">("newest");

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
    } else if (user) {
      fetchReminders();
    }
  }, [loading, user]);

  const fetchReminders = async () => {
    try {
      const res = await axiosInstance.get("/reminders/me");
      setReminders(res.data);
    } catch (err) {
      console.error("Error loading reminders:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchReminders();
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this reminder?"
    );
    if (!confirm) return;

    try {
      await axiosInstance.delete(`/reminders/${id}`);
      fetchReminders();
    } catch (err) {
      console.error("Failed to delete reminder:", err);
    }
  };

  const handleUndoDelete = async (id: string) => {
    try {
      await axiosInstance.patch(`/reminders/${id}/restore`);
      fetchReminders();
    } catch (err) {
      console.error("Failed to restore reminder:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const isPrivileged =
    user?.userType === "employee" || user?.userType === "owner";

  return (
    <div className="min-h-screen bg-blue-800">
      <DynamicHeader />

      <div className="p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h1>
        {user && (
          <div>
            <p className="text-xl">
              Hello, {capitalize(user.firstName)} {capitalize(user.lastName)}!
            </p>

            {isPrivileged && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => (window.location.href = "/scripts")}
                  className="bg-white text-blue-800 hover:bg-blue-100 px-6 py-3 rounded-md font-extrabold transition"
                >
                  View Scripts
                </button>
                <button
                  onClick={() => {
                    setSelectedReminder(null);
                    setShowModal(true);
                    setIsCreating(true);
                  }}
                  className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 rounded-md font-bold"
                >
                  + New Reminder
                </button>
              </div>
            )}

            {isPrivileged && (
              <div className="mt-10">
                <h2 className="text-xl font-bold mb-3">Your Reminders</h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search reminders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 rounded border w-full sm:w-1/2"
                  />

                  <div className="flex gap-2 w-full sm:w-1/2">
                    <select
                      value={sentFilter}
                      onChange={(e) =>
                        setSentFilter(
                          e.target.value as
                            | "all"
                            | "sent"
                            | "unsent"
                            | "deleted"
                        )
                      }
                      className="px-4 py-2 border rounded w-1/2"
                    >
                      <option value="all">All</option>
                      <option value="sent">Sent</option>
                      <option value="unsent">Unsent</option>
                    </select>

                    <select
                      value={sortOption}
                      onChange={(e) =>
                        setSortOption(e.target.value as "newest" | "oldest")
                      }
                      className="px-4 py-2 border rounded w-1/2"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </div>
                </div>

                {reminders.length === 0 ? (
                  <p>No reminders found.</p>
                ) : (
                  <ul className="space-y-4">
                    {reminders
                      .filter((r) => {
                        const matchesSearch =
                          r.title
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          r.message
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase());

                        const isPast = new Date(r.scheduledTime) < new Date();
                        const matchesFilter =
                          sentFilter === "all" ||
                          (sentFilter === "sent" && isPast) ||
                          (sentFilter === "unsent" && !isPast);

                        return matchesSearch && matchesFilter;
                      })
                      .sort((a, b) => {
                        const aTime = new Date(a.scheduledTime).getTime();
                        const bTime = new Date(b.scheduledTime).getTime();
                        return sortOption === "newest"
                          ? bTime - aTime
                          : aTime - bTime;
                      })
                      .map((r) => (
                        <li
                          key={r._id}
                          className="bg-white text-blue-800 px-4 py-3 rounded-md shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <div
                              className="cursor-pointer"
                              onClick={() => {
                                setSelectedReminder(r);
                                setShowModal(true);
                                setIsCreating(false);
                              }}
                            >
                              <h3 className="font-bold">{r.title}</h3>
                              <p>{r.message.slice(0, 40)}...</p>
                              <p>
                                Due:{" "}
                                {new Date(r.scheduledTime).toLocaleString()}
                              </p>
                              {isPrivileged && r.creatorId?.username && (
                                <p className="text-sm italic text-gray-500">
                                  Created by:{" "}
                                  {r.creatorId.firstName
                                    ? `${capitalize(
                                        r.creatorId.firstName
                                      )} ${capitalize(
                                        r.creatorId?.lastName ?? ""
                                      )}`
                                    : r.creatorId.username}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedReminder(r);
                                  setShowModal(true);
                                  setIsCreating(false);
                                }}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-bold"
                              >
                                View
                              </button>

                              {sentFilter === "deleted" ? (
                                <button
                                  onClick={() => handleUndoDelete(r._id)}
                                  className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md text-sm font-bold"
                                >
                                  Undo
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDelete(r._id)}
                                  className="bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-bold"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && user && (
        <ReminderModal
          reminder={selectedReminder}
          isCreating={isCreating}
          onClose={() => {
            setShowModal(false);
            setSelectedReminder(null);
            fetchReminders();
          }}
          userType={user.userType === "owner" ? "employee" : user.userType}
          userEmail={user.email}
        />
      )}
    </div>
  );
}
