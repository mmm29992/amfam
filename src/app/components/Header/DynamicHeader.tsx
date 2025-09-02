"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import LogoutHeader from "./LogoutHeader";
import ClientHeader from "./ClientHeader";
import EmployeeHeader from "./EmployeeHeader";
import OwnerHeader from "./OwnerHeader"; // 🆕 Import your owner header

type User = {
  userType: "client" | "employee" | "owner"; // 🆕 Include "owner"
};

export default function DynamicHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return null;

  if (!user) return <LogoutHeader />;
  if (user.userType === "employee") return <EmployeeHeader />;
  if (user.userType === "client") return <ClientHeader />;
  if (user.userType === "owner") return <OwnerHeader />; // 🆕 Show owner header

  return null;
}
