"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import DynamicHeader from "../components/Header/DynamicHeader"; // Adjust the path if needed

export default function ProfilePage() {
  const [user, setUser] = useState<{
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    userType: "client" | "employee" | "owner";
    createdAt?: string;
    updatedAt?: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmChangePassword, setConfirmChangePassword] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const router = useRouter();
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmDeletePassword, setConfirmDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [newOwnerCode, setNewOwnerCode] = useState("");
  const [ownerCodeSuccess, setOwnerCodeSuccess] = useState("");
  const [ownerCodeError, setOwnerCodeError] = useState("");
  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [codeMessage, setCodeMessage] = useState("");
  const [codeError, setCodeError] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeeCodeError, setEmployeeCodeError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [verifyInput, setVerifyInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const handleUpdateCode = async () => {
    setCodeError("");
    setCodeMessage("");

    const finalCode = newCode.trim();

    if (!oldCode || !finalCode) {
      setCodeError("Old and new codes are required.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/update-owner-code",
        {
          oldCode,
          newCode: finalCode,
        },
        { withCredentials: true }
      );

      setCodeMessage(`Code updated to: ${finalCode}`);
      setOldCode("");
      setNewCode("");
      setAutoGenerate(false);
    } catch (err) {
      setCodeError(
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to update code"
      );
    }
  };

  const handleOwnerCodeUpdate = async () => {
    setOwnerCodeSuccess("");
    setOwnerCodeError("");
    if (!newOwnerCode.trim()) {
      setOwnerCodeError("Code cannot be empty.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5001/api/auth/set-owner-code",
        { newCode: newOwnerCode },
        { withCredentials: true }
      );
      setOwnerCodeSuccess("Owner verification code updated.");
      setNewOwnerCode("");
    } catch (err) {
      setOwnerCodeError("Failed to update owner code.");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteSuccess("");

    console.log("Delete password:", deletePassword);
    console.log("Confirm password:", confirmDeletePassword);

    if (!deletePassword.trim() || !confirmDeletePassword.trim()) {
      setDeleteError("Both fields are required.");
      return;
    }

    if (deletePassword !== confirmDeletePassword) {
      setDeleteError("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/delete-account",
        { password: deletePassword, confirmPassword: confirmDeletePassword },
        { withCredentials: true }
      );
      setDeleteSuccess("Account deleted.");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setDeleteError(err.response.data.message);
      } else {
        setDeleteError("Failed to delete account.");
      }
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/auth/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to load user info.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchEmployeeCode = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/auth/get-employee-code",
          { withCredentials: true }
        );
        setEmployeeCode(res.data.code);
      } catch (err) {
        setEmployeeCodeError("No active employee code or failed to load.");
      }
    };

    if (user?.userType === "owner") {
      fetchEmployeeCode();
    }
  }, [user]);

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "New password must be different from the current password."
      );
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        { withCredentials: true }
      );

      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        "Failed to update password. Make sure current password is correct."
      );
      console.error(err);
    }
  };

  const handleInfoUpdate = async () => {
    setUpdateError("");
    setUpdateSuccess("");

    if (!confirmChangePassword) {
      setUpdateError("Please enter your current password to proceed.");
      return;
    }

    if (!newUsername && !newEmail) {
      setUpdateError("Enter a new email or username.");
      return;
    }

    if (newUsername === user?.username && newEmail === user?.email) {
      setUpdateError("New values must be different from current.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/update-profile",
        {
          newUsername,
          newEmail,
          password: confirmChangePassword,
        },
        { withCredentials: true }
      );

      setUpdateSuccess("Profile updated successfully.");
      setNewUsername("");
      setNewEmail("");
      setConfirmChangePassword("");

      // Refresh user info
      const refreshed = await axios.get("http://localhost:5001/api/auth/me", {
        withCredentials: true,
      });
      setUser(refreshed.data.user);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setUpdateError(err.response.data.message);
      } else {
        setUpdateError("Failed to update info.");
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-blue-800 text-white">
      {/* HEADER */}
      <DynamicHeader />

      {/* MAIN PROFILE SECTION */}
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        {loading ? (
          <p>Loading...</p>
        ) : !user ? (
          <p>No user data available.</p>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
            {/* LEFT COLUMN – User Info + Change Password */}
            <div className="bg-white text-blue-800 p-6 rounded-md shadow-md w-full lg:w-1/2">
              <p className="mb-2">
                <strong>Name:</strong>{" "}
                {user.firstName.charAt(0).toUpperCase() +
                  user.firstName.slice(1)}{" "}
                {user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)}
              </p>

              <p className="mb-2">
                <strong>Username:</strong> {user.username}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="mb-2">
                <strong>Role:</strong> {user.userType}
              </p>
              {user.createdAt && (
                <p className="mb-2">
                  <strong>Created At:</strong>{" "}
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              )}
              {user.updatedAt && (
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(user.updatedAt).toLocaleString()}
                </p>
              )}

              <hr className="my-4" />
              <h2 className="text-xl font-bold mb-2">Change Password</h2>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full px-3 py-2 border rounded"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full px-3 py-2 border rounded"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full px-3 py-2 border rounded"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="text-red-600 text-sm">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-green-600 text-sm">{passwordSuccess}</p>
                )}
                <button
                  onClick={handlePasswordChange}
                  className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update Password
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN – Update Info */}
            <div className="bg-white text-blue-800 p-6 rounded-md shadow-md w-full lg:w-1/2">
              <h2 className="text-xl font-bold mb-2">
                Update Email or Username
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="New Username"
                  className="w-full px-3 py-2 border rounded"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="New Email"
                  className="w-full px-3 py-2 border rounded"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full px-3 py-2 border rounded"
                  value={confirmChangePassword}
                  onChange={(e) => setConfirmChangePassword(e.target.value)}
                />
                {updateError && (
                  <p className="text-red-600 text-sm">{updateError}</p>
                )}
                {updateSuccess && (
                  <p className="text-green-600 text-sm">{updateSuccess}</p>
                )}
                <button
                  onClick={handleInfoUpdate}
                  className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update Info
                </button>
              </div>
            </div>
          </div>
        )}

        {user?.userType === "owner" && (
          <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mt-6">
            {/* Update Verification Code */}
            <div className="bg-white text-blue-800 p-6 rounded-md shadow-md w-full lg:w-1/2">
              <h2 className="text-xl font-bold mb-2">
                Update Verification Code
              </h2>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Old Verification Code"
                  className="w-full px-3 py-2 border rounded"
                  value={oldCode}
                  onChange={(e) => setOldCode(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="New Verification Code"
                  className="w-full px-3 py-2 border rounded"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleUpdateCode}
                    disabled={!oldCode.trim() || !newCode.trim()}
                    className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Update Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const random = Math.random()
                        .toString(36)
                        .substring(2, 8)
                        .toUpperCase();
                      setNewCode(random);
                    }}
                    className="bg-gray-300 text-blue-800 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Generate Random Code
                  </button>
                </div>
                {codeError && (
                  <p className="text-red-600 text-sm">{codeError}</p>
                )}
                {codeMessage && (
                  <p className="text-green-600 text-sm">{codeMessage}</p>
                )}
              </div>
            </div>

            {/* Current Employee Registration Code */}
            <div className="bg-white text-blue-800 p-6 rounded-md shadow-md w-full lg:w-1/2">
              <h2 className="text-xl font-bold mb-2">
                Verify to View Employee Registration Code
              </h2>

              <input
                type="password"
                placeholder="Enter Owner Verification Code"
                className="w-full px-3 py-2 border rounded mb-2"
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
              />
              <button
                onClick={async () => {
                  setVerifyError("");
                  try {
                    const res = await axios.post(
                      "http://localhost:5001/api/auth/verify-owner-code",
                      {
                        userId: user?._id,
                        code: verifyInput,
                      },
                      { withCredentials: true }
                    );
                    setIsVerified(true);
                  } catch (err) {
                    setVerifyError("Invalid verification code.");
                  }
                }}
                className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Verify
              </button>
              {verifyError && (
                <p className="text-red-600 text-sm">{verifyError}</p>
              )}

              {isVerified ? (
                employeeCode ? (
                  <div>
                    <p className="bg-gray-100 text-blue-900 p-3 rounded font-mono text-lg inline-block">
                      {employeeCode}
                    </p>
                    <div className="flex gap-3 mt-2 flex-wrap items-center">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(employeeCode);
                          setCopySuccess(true);
                          setTimeout(() => setCopySuccess(false), 1000);
                        }}
                        className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Copy Code
                      </button>
                      <button
                        onClick={async () => {
                          const random = Math.random()
                            .toString(36)
                            .substring(2, 8)
                            .toUpperCase();

                          try {
                            // Delete the old code first
                            await axios.delete(
                              "http://localhost:5001/api/auth/delete-employee-code",
                              {
                                withCredentials: true,
                              }
                            );

                            // Then create a new one
                            await axios.post(
                              "http://localhost:5001/api/auth/set-employee-code",
                              { newCode: random },
                              { withCredentials: true }
                            );

                            setEmployeeCode(random);
                          } catch (err) {
                            setEmployeeCodeError("Failed to regenerate code.");
                            setEmployeeCode("");
                          }
                        }}
                        disabled={!isVerified}
                        className={`${
                          isVerified
                            ? "bg-gray-300 hover:bg-gray-400"
                            : "bg-gray-200 cursor-not-allowed opacity-50"
                        } text-blue-800 px-4 py-2 rounded`}
                      >
                        Regenerate Code
                      </button>

                      <p
                        className={`text-green-600 text-sm transition-opacity duration-300 ${
                          copySuccess ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Copied to clipboard!
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600">{employeeCodeError}</p>
                )
              ) : (
                <p className="text-sm text-blue-700 mt-2">
                  Please verify using your code to access the employee
                  registration code.
                </p>
              )}
            </div>
          </div>
        )}

        {user?.userType !== "owner" && (
          <>
            {/* DELETE ACCOUNT SECTION */}
            <div className="bg-white text-blue-800 p-6 rounded-md shadow-md w-full max-w-6xl mt-6">
              <h2 className="text-xl font-bold mb-2 text-red-600">
                Delete Account
              </h2>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border rounded"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 border rounded"
                  value={confirmDeletePassword}
                  onChange={(e) => setConfirmDeletePassword(e.target.value)}
                />
                {deleteError && (
                  <p className="text-red-600 text-sm">{deleteError}</p>
                )}
                {deleteSuccess && (
                  <p className="text-green-600 text-sm">{deleteSuccess}</p>
                )}
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
