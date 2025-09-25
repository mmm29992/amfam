"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import DynamicHeader from "../components/Header/DynamicHeader";
import InfoModal from "../components/InfoModal";
import RemindersModal from "../components/UserRemindersModal"; // ⬅️ add this if not already
import ChecklistModal from "../components/UserChecklistModal";
import QuotesModal from "../components/UserQuotesModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PoliciesModal from "../components/UserPoliciesModal";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: "client" | "employee" | "owner";
};

const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "client" | "employee">("All");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [infoModal, setInfoModal] = useState<{ user: User } | null>(null);
  const [remindersModal, setRemindersModal] = useState<{ user: User } | null>(
    null
  );
  const [checklistModal, setChecklistModal] = useState<{ user: User } | null>(
    null
  );
  const [quotesModal, setQuotesModal] = useState<{ user: User } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [adminCode, setAdminCode] = useState("");
  const [currentUser, setCurrentUser] = useState<{ userType: string } | null>(
    null
  );
  const [policiesModal, setPoliciesModal] = useState<{ user: User } | null>(
    null
  );

  useEffect(() => {
    const fetchCurrentUserAndUsers = async () => {
      try {
        const userRes = await api.get("/auth/me");
        const me = userRes.data.user;
        setCurrentUser(me);

        const usersRes = await api.get("/auth/users");
        const allUsers = usersRes.data;

        // 🔍 If employee, show only clients
        const filtered =
          me.userType === "employee"
            ? allUsers.filter((u: User) => u.userType === "client")
            : allUsers;

        setUsers(filtered);
      } catch (err) {
        console.error("Error fetching users or current user", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUserAndUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    try {
      console.log("Attempting delete...");
      await api.delete(`/auth/users/${userId}`, {
        data: { adminCode },
      });

      console.log("Delete success");
      toast.success("User deleted successfully");
      setShowDeleteModal(null);
      setAdminCode(""); // ✅ after success

      const refreshed = await api.get("/auth/users");
      console.log("Users refreshed");
      setUsers(refreshed.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg =
        error?.response?.data?.message || "Failed to delete user. Try again.";
      toast.error(msg);
      console.error("Delete error:", err);
    }
  };

  const filteredUsers = users
    .filter((u) => {
      const matchesFilter = filter === "All" || u.userType === filter;
      const matchesSearch =
        u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(
        parseInt(a._id.toString().substring(0, 8), 16) * 1000
      );
      const dateB = new Date(
        parseInt(b._id.toString().substring(0, 8), 16) * 1000
      );

      return sortOrder === "newest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="min-h-screen bg-blue-800 text-white">
      <DynamicHeader />

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">👥 All Users</h1>

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {currentUser?.userType === "owner" ? (
              ["All", "client", "employee"].map((role) => (
                <button
                  key={role}
                  onClick={() =>
                    setFilter(role as "All" | "client" | "employee")
                  }
                  className={`px-4 py-2 rounded font-bold transition ${
                    filter === role
                      ? "bg-white text-blue-800"
                      : "bg-blue-700 text-white"
                  }`}
                >
                  {role === "All" ? "All Users" : capitalize(role) + "s"}
                </button>
              ))
            ) : (
              <button
                onClick={() => setFilter("client")}
                className="px-4 py-2 rounded font-bold transition bg-white text-blue-800"
              >
                All Users
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "newest" | "oldest")
              }
              className="pl-3 pr-8 py-2 text-blue-700 rounded-md border bg-white border-gray-300 appearance-none font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-700">
              ⬇️
            </div>
          </div>

          <div className="relative w-full sm:w-1/3">
            <img
              src="/searchicon.svg"
              alt="Search Icon"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-blue-700 w-full px-3 py-2 rounded-md border bg-white border-gray-300"
            />
          </div>
        </div>

        {/* User Cards */}
        {loading ? (
          <p>Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className="bg-white text-blue-800 rounded-xl p-4 shadow-lg space-y-2 relative"
              >
                <div className="flex justify-between items-start">
                  {/* Left: Name + Email + Role */}
                  <div>
                    <h2 className="text-3xl font-extrabold">
                      {capitalize(u.firstName)} {capitalize(u.lastName)}
                    </h2>
                    <p className="text-sm text-gray-700 break-all">{u.email}</p>
                    <p className="text-sm italic capitalize mt-1">
                      Role:{" "}
                      <span className="font-semibold">
                        {capitalize(u.userType)}
                      </span>
                    </p>
                    {currentUser?.userType === "owner" && (
                      <button
                        onClick={() => setShowDeleteModal(u._id)}
                        className="text-xs text-red-600 hover:underline absolute bottom-2 left-4"
                      >
                        🗑️ Delete User
                      </button>
                    )}

                    {showDeleteModal === u._id && (
                      <div
                        className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30"
                        onClick={() => setShowDeleteModal(null)}
                      >
                        <div
                          className="bg-white p-6 w-[24rem] rounded-xl shadow-xl relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setShowDeleteModal(null)}
                            className="absolute top-4 right-4 text-red-600 text-2xl"
                          >
                            &times;
                          </button>

                          <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">
                            Confirm User Deletion
                          </h2>

                          <p className="text-sm text-gray-700 mb-4 text-center">
                            Are you sure you want to delete{" "}
                            <strong>
                              {u.firstName} {u.lastName}
                            </strong>
                            ? This action cannot be undone.
                          </p>

                          <input
                            type="password"
                            placeholder="Enter Admin Code"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
                            autoFocus
                          />

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShowDeleteModal(null)}
                              className="text-sm text-gray-600 hover:underline"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(u._id)}
                              className="bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700"
                            >
                              Confirm Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 items-start text-blue-800 text-lg font-medium mt-4">
                    <button
                      onClick={() => setInfoModal({ user: u })}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <span className="w-5 text-center">👤</span>{" "}
                      <span>Personal Info</span>
                    </button>

                    <button
                      onClick={() => setRemindersModal({ user: u })}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <span className="w-5 text-center">⏰</span>{" "}
                      <span>Reminders</span>
                    </button>

                    <button
                      onClick={() => setChecklistModal({ user: u })}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <span className="w-5 text-center">✅</span>
                      <span>Checklist</span>
                    </button>

                    <button
                      onClick={() => setQuotesModal({ user: u })}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <span className="w-5 text-center">📂</span>{" "}
                      <span>Quotes</span>
                    </button>

                    <button
                      onClick={() => setPoliciesModal({ user: u })}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <span className="w-5 text-center">📑</span>
                      <span>Policies</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* ✅ Outside the map, so only one modal is open at a time */}
            {infoModal && (
              <InfoModal
                user={infoModal.user}
                currentUserType={
                  currentUser?.userType === "client" ||
                  currentUser?.userType === "employee" ||
                  currentUser?.userType === "owner"
                    ? currentUser.userType
                    : "employee" // fallback
                }
                onClose={() => setInfoModal(null)}
              />
            )}
            {remindersModal && (
              <RemindersModal
                user={remindersModal.user}
                onClose={() => setRemindersModal(null)}
              />
            )}
            {checklistModal && (
              <ChecklistModal
                user={checklistModal.user}
                onClose={() => setChecklistModal(null)}
              />
            )}
            {quotesModal && (
              <QuotesModal
                user={quotesModal.user}
                onClose={() => setQuotesModal(null)}
              />
            )}
            {policiesModal && (
              <PoliciesModal
                user={policiesModal.user}
                currentUserType={
                  currentUser?.userType === "client" ||
                  currentUser?.userType === "employee" ||
                  currentUser?.userType === "owner"
                    ? currentUser.userType
                    : "employee" // fallback
                }
                onClose={() => setPoliciesModal(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
