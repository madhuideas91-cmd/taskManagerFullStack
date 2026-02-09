import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;   // ✅ ReactNode is safer than JSX.Element
  role?: "ADMIN" | "MEMBER";
}

const ProtectedRoute: React.FC<Props> = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;

  if (role && userRole !== role) {
    return (
      <h1 className="text-center text-red-600 mt-10">
        ❌ Access Denied (Only {role} Allowed)
      </h1>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
