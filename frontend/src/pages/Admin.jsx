import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios"

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.email === "cuet504@gmail.com") {
      api.get("/admin/stats")
        .then(res => setStats(res.data.data))
        .catch(err => setError(err.response?.data?.message || "Access denied"));
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.email !== "cuet504@gmail.com") {
    return <div className="p-10 text-center text-red-500">Access Denied. Admin only.</div>;
  }

  return (
    <div className="p-10 text-white min-h-screen bg-bg-primary">
      <h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>
      {error ? (
        <p className="text-red-400">{error}</p>
      ) : stats ? (
        <div className="flex gap-5">
          <div className="p-5 border border-border-subtle rounded-xl">
            <h2 className="text-text-faint">Total Users</h2>
            <p className="text-xl font-bold">{stats.userCount}</p>
          </div>
          <div className="p-5 border border-border-subtle rounded-xl">
            <h2 className="text-text-faint">Total Polls</h2>
            <p className="text-xl font-bold">{stats.pollCount}</p>
          </div>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}
    </div>
  );
}
