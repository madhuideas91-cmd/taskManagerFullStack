import React from "react";

const AdminPage: React.FC = () => {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p>Only admins can access this page.</p>
    </div>
  );
};

export default AdminPage;

