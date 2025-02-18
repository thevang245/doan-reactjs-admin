import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import "../style/style.css";

const Layout = () => {
  const token = localStorage.getItem("adminToken");

  // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <>
      <Sidebar />
      <Header />
      <div className="relative pt-13 w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-900 min-h-screen">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
