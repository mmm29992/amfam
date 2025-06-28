"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";

interface QuoteModalProps {
  onClose: () => void;
  onSuccess: (quote: any) => void;
  existingQuote?: any;
}

export default function QuoteModal({
  onClose,
  onSuccess,
  existingQuote,
}: QuoteModalProps) {
  const [quoteType, setQuoteType] = useState<"personal" | "business">(
    "personal"
  );
  const [personalType, setPersonalType] = useState<
    "pl_auto" | "pl_home" | "pl_renters" | "life"
  >("pl_auto");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    driversLicense: "",
    employmentStatus: "",
    companyName: "",
    address: "",
    maritalStatus: "",
    children: "",
    vehicleYear: "",
    vehicleVIN: "",
    homeStatus: "",
    hasCostcoCard: false,
    coverageType: "",

    // Business
    businessName: "",
    businessAddress: "",
    businessStructure: "",
    ein: "",
    ownerFullName: "",
    ownerAddress: "",
    ownerPhone: "",
    ownerDob: "",
    ownerEmail: "",
    ownerMaritalStatus: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (existingQuote) {
      setQuoteType(existingQuote.businessName ? "business" : "personal");
      setPersonalType(existingQuote.quoteType || "pl_auto");
      setSelectedClientId(existingQuote.forClientId || "");

      setFormData((prev) => ({
        ...prev,
        ...existingQuote,
        children: Array.isArray(existingQuote.children)
          ? existingQuote.children.join(", ")
          : existingQuote.children || "",
      }));
    }
  }, [existingQuote]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;

    // Narrow the type for checkboxes
    const checked =
      type === "checkbox" && (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    // Check for required fields
    if (quoteType === "personal") {
      const missingFields = [
        "fullName",
        "email",
        "dob",
        "driversLicense",
        "employmentStatus",
        "companyName",
        "address",
        "maritalStatus",
        "coverageType",
      ];

      const missing = missingFields.filter(
        (field) => !formData[field as keyof typeof formData]
      );
      if (missing.length > 0) {
        const readable = missing.map((field) =>
          field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
        );
        setError(`Missing required: ${readable.join(", ")}`);
        setLoading(false);
        return;
      }
      
    } else {
      const missingFields = [
        "businessName",
        "businessAddress",
        "businessStructure",
        "ein",
        "ownerFullName",
        "ownerAddress",
        "ownerPhone",
        "ownerDob",
        "ownerEmail",
        "coverageType",
      ];

      const missing = missingFields.filter(
        (field) => !formData[field as keyof typeof formData]
      );
      if (missing.length > 0) {
        setError("Please fill out all required business fields.");
        setLoading(false);
        return;
      }
    }

    try {
      const url =
        quoteType === "personal" ? "/quotes/personal" : "/quotes/business";

      const payload =
        quoteType === "personal"
          ? {
              quoteType: personalType,
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              dob: formData.dob,
              driversLicense: formData.driversLicense,
              employmentStatus: formData.employmentStatus,
              companyName: formData.companyName,
              address: formData.address,
              maritalStatus: formData.maritalStatus,
              children: formData.children ? [formData.children] : [],
              vehicleYear: formData.vehicleYear,
              vehicleVIN: formData.vehicleVIN,
              coverageType: formData.coverageType,
              homeStatus: formData.homeStatus,
              hasCostcoCard: formData.hasCostcoCard,
              forClientId: selectedClientId || undefined,
            }
          : {
              businessName: formData.businessName,
              businessAddress: formData.businessAddress,
              businessStructure: formData.businessStructure,
              ein: formData.ein,
              ownerFullName: formData.ownerFullName,
              ownerAddress: formData.ownerAddress,
              ownerPhone: formData.ownerPhone,
              ownerDob: formData.ownerDob,
              ownerEmail: formData.ownerEmail,
              ownerMaritalStatus: formData.ownerMaritalStatus,
              coverageType: formData.coverageType,
              forClientId: selectedClientId || undefined,
            };

      const res = existingQuote
        ? await axiosInstance.patch(`${url}/${existingQuote._id}`, payload)
        : await axiosInstance.post(url, payload);

      onSuccess(res.data.quote);
    } catch (err) {
      console.error(err);
      setError("Failed to create quote.");
    } finally {
      setLoading(false);
    }
  };

  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axiosInstance.get("/auth/clients");
        console.log("Fetched clients:", res.data); // ✅ confirm response
        setClients(res.data);
      } catch (err) {
        console.error("Failed to fetch clients:", err); // 🔴 check this in browser dev console
      }
    };
    fetchClients();
  }, []);

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-xs bg-transparent"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 w-[700px] max-w-[95vw] rounded-xl shadow-lg relative text-blue-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-600 text-3xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">
          {existingQuote ? "Edit" : "New"} {quoteType} Quote
        </h2>

        <div className="mb-4">
          <label className="block mb-1">Quote Category:</label>
          <select
            className="w-full border p-2 rounded"
            value={quoteType}
            onChange={(e) =>
              setQuoteType(e.target.value as "personal" | "business")
            }
          >
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
        </div>
        {quoteType === "personal" ? (
          <>
            {/* Personal Quote Type Dropdown */}
            <div className="mb-3">
              <label className="block mb-1">Personal Quote Type:</label>
              <select
                className="w-full border p-2 rounded"
                name="quoteType"
                value={personalType}
                onChange={(e) => setPersonalType(e.target.value as any)}
              >
                <option value="pl_auto">Auto</option>
                <option value="pl_home">Home</option>
                <option value="pl_renters">Renters</option>
                <option value="life">Life</option>
              </select>
            </div>

            {/* Client Selector */}
            <div className="mb-4">
              <label className="block mb-1">Select Client:</label>
              <select
                className="w-full border p-2 rounded"
                value={selectedClientId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedClientId(id);
                  const selectedClient = clients.find((c) => c._id === id);
                  if (selectedClient) {
                    setFormData((prev) => ({
                      ...prev,
                      fullName: `${selectedClient.firstName || ""} ${
                        selectedClient.lastName || ""
                      }`.trim(),
                      email: selectedClient.email || "",
                      phone: selectedClient.phone || "",
                    }));
                  }
                }}
              >
                <option value="">-- Select Client --</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.firstName} {client.lastName} ({client.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* all your <input> and <select> fields go here */}

              {/* Personal Fields */}
              <input
                name="fullName"
                placeholder="Full Name"
                className="w-full border p-2 rounded mb-3"
                value={formData.fullName}
                onChange={handleChange}
              />
              <input
                name="email"
                placeholder="Email"
                className="w-full border p-2 rounded mb-3"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                name="phone"
                placeholder="Phone"
                className="w-full border p-2 rounded mb-3"
                value={formData.phone}
                onChange={handleChange}
              />
              <input
                name="dob"
                placeholder="Date of Birth"
                className="w-full border p-2 rounded mb-3"
                value={formData.dob}
                onChange={handleChange}
              />
              <input
                name="driversLicense"
                placeholder="Driver’s License Number"
                className="w-full border p-2 rounded mb-3"
                value={formData.driversLicense}
                onChange={handleChange}
              />
              <input
                name="employmentStatus"
                placeholder="Employment Status"
                className="w-full border p-2 rounded mb-3"
                value={formData.employmentStatus}
                onChange={handleChange}
              />
              <input
                name="companyName"
                placeholder="Place of Employment/Company Name"
                className="w-full border p-2 rounded mb-3"
                value={formData.companyName}
                onChange={handleChange}
              />
              <input
                name="address"
                placeholder="Address"
                className="w-full border p-2 rounded mb-3"
                value={formData.address}
                onChange={handleChange}
              />
              <input
                name="maritalStatus"
                placeholder="Marital Status"
                className="w-full border p-2 rounded mb-3"
                value={formData.maritalStatus}
                onChange={handleChange}
              />
              <input
                name="children"
                placeholder="Children’s Names/Ages"
                className="w-full border p-2 rounded mb-3"
                value={formData.children}
                onChange={handleChange}
              />
              <select
                name="coverageType"
                value={formData.coverageType}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-3"
              >
                <option value="">Select Coverage Type</option>
                <option value="liability">Liability Only</option>
                <option value="collision">Collision Coverage</option>
                <option value="comprehensive">Comprehensive</option>
                <option value="full">Full Coverage</option>
              </select>

              {/* Vehicle Info - only if Auto */}
              {personalType === "pl_auto" && (
                <>
                  <input
                    name="vehicleYear"
                    placeholder="Vehicle Year"
                    className="w-full border p-2 rounded mb-3"
                    value={formData.vehicleYear}
                    onChange={handleChange}
                  />
                  <input
                    name="vehicleVIN"
                    placeholder="Vehicle VIN"
                    className="w-full border p-2 rounded mb-3"
                    value={formData.vehicleVIN}
                    onChange={handleChange}
                  />
                </>
              )}

              {/* Home Info - only if Home */}
              {personalType === "pl_home" && (
                <>
                  <select
                    name="homeStatus"
                    value={formData.homeStatus}
                    onChange={handleChange}
                    className="w-full border p-2 rounded mb-3"
                  >
                    <option value="">Home Status</option>
                    <option value="own">Own</option>
                    <option value="rent">Rent</option>
                  </select>
                  <label className="mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="hasCostcoCard"
                      checked={formData.hasCostcoCard}
                      onChange={handleChange}
                    />
                    Has Costco Card
                  </label>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Business Fields */}
            <input
              name="businessName"
              placeholder="Business Name"
              className="w-full border p-2 rounded mb-3"
              value={formData.businessName}
              onChange={handleChange}
            />
            <input
              name="businessAddress"
              placeholder="Business Address"
              className="w-full border p-2 rounded mb-3"
              value={formData.businessAddress}
              onChange={handleChange}
            />
            <input
              name="businessStructure"
              placeholder="Business Structure (LLC, INC)"
              className="w-full border p-2 rounded mb-3"
              value={formData.businessStructure}
              onChange={handleChange}
            />
            <input
              name="ein"
              placeholder="EIN"
              className="w-full border p-2 rounded mb-3"
              value={formData.ein}
              onChange={handleChange}
            />
            <input
              name="ownerFullName"
              placeholder="Owner Full Name"
              className="w-full border p-2 rounded mb-3"
              value={formData.ownerFullName}
              onChange={handleChange}
            />
            <input
              name="ownerAddress"
              placeholder="Owner Address"
              className="w-full border p-2 rounded mb-3"
              value={formData.ownerAddress}
              onChange={handleChange}
            />
            <input
              name="ownerPhone"
              placeholder="Owner Phone"
              className="w-full border p-2 rounded mb-3"
              value={formData.ownerPhone}
              onChange={handleChange}
            />
            <input
              name="ownerDob"
              placeholder="Owner DOB"
              className="w-full border p-2 rounded mb-3"
              value={formData.ownerDob}
              onChange={handleChange}
            />
            <input
              name="ownerEmail"
              placeholder="Owner Email"
              className="w-full border p-2 rounded mb-3"
              value={formData.ownerEmail}
              onChange={handleChange}
            />
            <input
              name="ownerMaritalStatus"
              placeholder="Owner Marital Status"
              className="w-full border p-2 rounded mb-3"
              value={formData.ownerMaritalStatus}
              onChange={handleChange}
            />
            <input
              name="coverageType"
              placeholder="Coverage Type (e.g. BOP)"
              className="w-full border p-2 rounded mb-3"
              value={formData.coverageType}
              onChange={handleChange}
            />
          </>
        )}

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-blue-800 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading
              ? existingQuote
                ? "Saving..."
                : "Creating..."
              : existingQuote
              ? "Save Changes"
              : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
