"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Reminder } from "@/types/reminder";

interface ReminderModalProps {
  reminder: Reminder | null;
  isCreating: boolean;
  onClose: () => void;
  onSave?: () => void;
  userType: "client" | "employee";
  userEmail: string;
}

type Client = {
  email: string;
};

// Add these helpers at the top of the file (below imports)
const pad = (n: number) => String(n).padStart(2, "0");
const toDatetimeLocal = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;

const safeParseDate = (s: string) => {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function ReminderModal({
  reminder,
  isCreating,
  onClose,
  onSave,
  userType,
  userEmail,
}: ReminderModalProps) {
  const [formState, setFormState] = useState<Reminder>({
    _id: "",
    title: "",
    message: "",
    scheduledTime: new Date().toISOString(),
    emailSubject: "",
    targetEmail: "",
    category: "",
    subcategory: "",
  } as Reminder);

  const [isEditing, setIsEditing] = useState(false);
  const [clientOptions, setClientOptions] = useState<string[]>([]);
  const [targetOption, setTargetOption] = useState<"self" | "client">("self");
  // Replace your isPastDue line with a safe version:
  const parsedScheduled = safeParseDate(formState.scheduledTime);
  const isPastDue = parsedScheduled ? parsedScheduled < new Date() : false;

  useEffect(() => {
    if (reminder) {
      setFormState({
        ...reminder,
        emailSubject: reminder.emailSubject || `Reminder: ${reminder.title}`,
        message: reminder.message || "",
      });
    } else {
      const initialTemplate = `Hi there,

Just a friendly reminder for:

[Insert message here]

Scheduled for: ${new Date().toLocaleString()}

Stay on top of things!`;

      setFormState({
        _id: "",
        title: "",
        message: initialTemplate,
        emailSubject: "",
        scheduledTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        targetEmail: "",
        category: "",
        subcategory: "",
      });

      if (userType === "client") setTargetOption("self");
    }
  }, [reminder]);

  useEffect(() => {
    if (userType === "employee") {
      api
        .get("/auth/clients")
        .then((res) => {
          const clients = res.data.map((u: Client) => u.email);
          setClientOptions(clients);
        })
        .catch((err) => console.error("Failed to fetch clients:", err));
    }
  }, [userType]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormState((prev: Reminder) => {
      const updated = { ...prev, [name]: value };

      if (name === "emailSubject") updated.title = value;
      if (name === "title") updated.emailSubject = value;

      return updated;
    });
  };

  // In handleFinalSubmit, avoid mutating state; compute payload-only values:
  const handleFinalSubmit = async () => {
    try {
      const isClient = userType === "client";

      // Convert whatever is in scheduledTime into a proper ISO string for the backend
      const scheduleDate =
        safeParseDate(formState.scheduledTime) ??
        // if user typed a datetime-local string, try to parse it as local
        (() => {
          const s = formState.scheduledTime;
          // expect "YYYY-MM-DDTHH:MM"
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)) {
            const [date, time] = s.split("T");
            const [Y, M, D] = date.split("-").map(Number);
            const [h, m] = time.split(":").map(Number);
            return new Date(Y, M - 1, D, h, m, 0, 0);
          }
          return null;
        })();

      if (!scheduleDate || scheduleDate <= new Date()) {
        // you can also surface a toast here
        console.error("Pick a valid future time.");
        return;
      }

      const isForClient =
        userType === "employee" &&
        targetOption === "client" &&
        !!formState.targetEmail;

      const payload = {
        ...formState,
        scheduledTime: scheduleDate.toISOString(), // <-- send ISO to backend
        targetEmail: isClient
          ? userEmail
          : isForClient
          ? formState.targetEmail
          : userEmail,
        emailBody: formState.message,
        emailSubject: formState.emailSubject || `Reminder: ${formState.title}`,
        forClient: isClient ? true : isForClient,
      };

      if (isCreating) {
        await api.post("/reminders", { ...payload, sendEmail: true });
      } else {
        await api.put(`/reminders/${formState._id}`, payload);
      }

      onSave?.();
      onClose();
    } catch (err) {
      console.error("Failed to save reminder:", err);
    }
  };

  if (!reminder && !isCreating) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-xl shadow-lg w-[900px] max-w-[95vw] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-3xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-blue-800 text-center">
          Reminder Details
        </h2>

        <div className="flex flex-col h-[80vh]">
          <div className="flex-1 flex gap-6 overflow-y-auto text-sm text-gray-800">
            {/* Email Preview */}
            <div className="w-1/2 border p-4 rounded bg-yellow-50">
              <h3 className="text-lg font-semibold text-yellow-700 mb-3">
                Email Preview
              </h3>
              <p className="mb-2">
                <strong>From:</strong> {userEmail}
              </p>
              <div className="mb-2">
                <strong>To:</strong>{" "}
                {userType === "employee" && (isEditing || isCreating) ? (
                  targetOption === "client" ? (
                    <select
                      name="targetEmail"
                      value={formState.targetEmail}
                      onChange={handleChange}
                      className="w-full px-2 py-1 border rounded"
                    >
                      <option value="">Select client email</option>
                      {clientOptions.map((email) => (
                        <option key={email} value={email}>
                          {email}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-2 py-1">{userEmail}</div>
                  )
                ) : (
                  formState.targetEmail || userEmail
                )}
              </div>
              {/* In Email Preview, replace the "Scheduled For" rendering: */}
              <p className="mb-2">
                <strong>Scheduled For:</strong>{" "}
                {parsedScheduled
                  ? parsedScheduled.toLocaleString()
                  : "— (set a time)"}
              </p>

              <hr className="my-2" />
              <label className="block font-semibold mb-1">Subject:</label>
              {(isEditing || isCreating) && !isPastDue ? (
                <input
                  type="text"
                  name="emailSubject"
                  value={formState.emailSubject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded mb-3"
                />
              ) : (
                <div className="bg-white border rounded p-2 mb-3">
                  {formState.emailSubject || `Reminder: ${formState.title}`}
                </div>
              )}
              <label className="block font-semibold mb-1">Body:</label>
              {(isEditing || isCreating) && !isPastDue ? (
                <textarea
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-3 py-2 border rounded whitespace-pre-wrap"
                />
              ) : (
                <pre className="bg-white border rounded p-2 whitespace-pre-wrap overflow-auto">
                  {formState.message}
                </pre>
              )}
            </div>

            {/* Reminder Details */}
            <div className="w-1/2 space-y-4">
              {userType === "employee" && (isEditing || isCreating) && (
                <div>
                  <label className="block font-semibold mb-1">
                    Reminder For:
                  </label>
                  <select
                    value={targetOption}
                    onChange={(e) =>
                      setTargetOption(e.target.value as "self" | "client")
                    }
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="self">Myself</option>
                    <option value="client">Client</option>
                  </select>
                </div>
              )}
              <label className="block font-semibold mt-4">Category</label>
              <select
                value={formState.category}
                onChange={(e) =>
                  setFormState({ ...formState, category: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select category</option>
                <option value="Quote Follow Up">Quote Follow Up</option>
                <option value="Life">Life</option>
                <option value="Commercial">Commercial</option>
                <option value="PL Home">PL Home</option>
                <option value="PL Auto">PL Auto</option>
                <option value="PL Renters">PL Renters</option>
              </select>

              <label className="block font-semibold mt-4">Subcategory</label>
              <select
                value={formState.subcategory}
                onChange={(e) =>
                  setFormState({ ...formState, subcategory: e.target.value })
                }
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select subcategory</option>
                <option value="Quotes Follow Up">Quotes Follow Up</option>
                <option value="No Pay">No Pay</option>
                <option value="Cancel Status">Cancel Status</option>
                <option value="Cancel">Cancel</option>
                <option value="No Renewal">No Renewal</option>
                <option value="Discount Remove">Discount Remove</option>
                <option value="Documents Needed">Documents Needed</option>
              </select>

              <div>
                <label className="block font-semibold">Title:</label>
                {(isEditing || isCreating) && !isPastDue ? (
                  <input
                    type="text"
                    name="title"
                    value={formState.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                ) : (
                  <p className="border rounded px-3 py-2 bg-gray-100">
                    {formState.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold">Message:</label>
                {(isEditing || isCreating) && !isPastDue ? (
                  <textarea
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                ) : (
                  <p className="border rounded px-3 py-2 bg-gray-100 whitespace-pre-wrap">
                    {formState.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold">Scheduled Time:</label>
                {(isEditing || isCreating) && !isPastDue ? (
                  <input
                    type="datetime-local"
                    name="scheduledTime"
                    value={
                      parsedScheduled
                        ? toDatetimeLocal(parsedScheduled)
                        : formState.scheduledTime.slice(0, 16)
                    }
                    onChange={handleChange}
                    min={toDatetimeLocal(new Date(Date.now() + 60_000))}
                    step={60}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.preventDefault();
                    }}
                    className="w-full px-3 py-2 border rounded"
                  />
                ) : (
                  <p className="border rounded px-3 py-2 bg-gray-100">
                    {new Date(formState.scheduledTime).toLocaleString()}
                  </p>
                )}

                {userType === "employee" && !isCreating && !isEditing && (
                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    {formState.creatorId && (
                      <p>
                        <strong>Created By:</strong>{" "}
                        {formState.creatorId.firstName
                          ? `${formState.creatorId.firstName} ${formState.creatorId.lastName}`
                          : formState.creatorId.username || "Unknown"}
                      </p>
                    )}
                    {reminder?.createdAt && (
                      <p>
                        <strong>Created At:</strong>{" "}
                        {new Date(reminder.createdAt).toLocaleString()}
                      </p>
                    )}
                    {reminder?.updatedAt && (
                      <p>
                        <strong>Last Updated:</strong>{" "}
                        {new Date(reminder.updatedAt).toLocaleString()}
                      </p>
                    )}
                    {formState.updatedBy && (
                      <p>
                        <strong>Updated By:</strong>{" "}
                        {formState.updatedBy.firstName
                          ? `${formState.updatedBy.firstName} ${formState.updatedBy.lastName}`
                          : formState.updatedBy.username || "Unknown"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            {(isEditing || isCreating) && !isPastDue ? (
              <>
                {!isCreating && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleFinalSubmit}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Save
                </button>
              </>
            ) : (
              !isPastDue && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
