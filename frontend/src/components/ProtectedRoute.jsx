import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const verify = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/check`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await res.json();
        if (!cancelled) setAuth(data.success);
      } catch (err) {
        if (!cancelled) setAuth(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading)
    return (
      <div
        className={`${
          loading ? "flex" : "hidden"
        } flex-col justify-center items-center fixed inset-0 bg-gradient-to-br from-blue-50/95 via-white/95 to-purple-50/95 backdrop-blur-md z-50`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <img
            className="w-20 h-20 relative z-10"
            src="Spinner.gif"
            alt="Loading..."
          />
        </div>
        <p className="text-gray-700 mt-4 font-semibold text-lg">
          Loading your feed...
        </p>
      </div>
    );
  if (!auth) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
