    // src/components/Sidebar.tsx
    import React, { useEffect, useState } from "react";
    import {
      FaHome,
      FaTasks,
      FaCalendarAlt,
      FaChartBar,
      FaCog,
      FaSignOutAlt,
      FaUsers,
      FaProjectDiagram,
    } from "react-icons/fa";
//     import axios from "axios";
import axiosInstance from "../api/axiosInstance";
    import { useNavigate } from "react-router-dom"; // <-- added

    interface MenuItem {
      name: string;
      icon: React.ReactNode;
      path: string;
      badgeCount?: number;
    }

    interface Task {
      id: number;
      title: string;
      status: string;
    }

    const Sidebar: React.FC = () => {
      const [active, setActive] = useState("Dashboard");
      const [collapsed, setCollapsed] = useState(false);
      const [taskCount, setTaskCount] = useState(0);

      const navigate = useNavigate(); // <-- added
      // 🔹 Read Appearance preference
       const sidebarCollapse =
         localStorage.getItem("sidebarCollapse") === "true";

         // 🔹 Sync Appearance setting → Sidebar state
         useEffect(() => {
           if (sidebarCollapse) {
             setCollapsed(true);
           }
         }, [sidebarCollapse]);

        useEffect(() => {
               const handler = (e: any) => {
                 setCollapsed(e.detail === true);
               };

               window.addEventListener("sidebarPreferenceChanged", handler);
               return () => window.removeEventListener("sidebarPreferenceChanged", handler);
             }, []);

        const handleLogout = () => {
          // Clear auth data
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Optional: clear all
          // localStorage.clear();

          navigate("/", { replace: true });
        };


      const menuItems: MenuItem[] = [
        { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
        { name: "Tasks", icon: <FaTasks />, path: "/dashboard", badgeCount: taskCount },
        { name: "Projects", icon: <FaProjectDiagram />, path: "/Projects" },
        { name: "Teams", icon: <FaUsers />, path: "/Teams" },
        { name: "Calendar", icon: <FaCalendarAlt />, path: "/calendar" }, // calendar
        { name: "Reports", icon: <FaChartBar />, path: "/reports" },
        { name: "Settings", icon: <FaCog />, path: "/settings" },
        { name: "Logout", icon: <FaSignOutAlt />, path: "/logout" },
      ];



//       const fetchTaskCount = async () => {
//         try {
//           const response = await axios.get<Task[]>(
//             //"http://localhost:8080/tasks/getAllTasks"
//              "/api/tasks/getAllTasks"
//           );
//           const pendingCount = response.data.filter((t) => t.status !== "Done").length;
//           setTaskCount(pendingCount);
//         } catch (err) {
//           console.error("Error fetching task count", err);
//         }
//       };

      const fetchTaskCount = async () => {
        try {
          const response = await axiosInstance.get<Task[]>("/tasks/getAllTasks");

          const pendingCount = response.data.filter(
            (t: Task) => t.status === "OPEN" || t.status === "IN_PROGRESS"
          ).length;
          setTaskCount(pendingCount);
        } catch (err) {
          console.error("Error fetching task count", err);
        }
      };


      useEffect(() => {
        fetchTaskCount();
        const interval = setInterval(fetchTaskCount, 10000);
        return () => clearInterval(interval);
      }, []);

      useEffect(() => {
        const handleTaskUpdate = (e: any) => {
          const tasks: Task[] = e.detail || [];
          const pendingCount = tasks.filter((t) => t.status !== "Done").length;
          setTaskCount(pendingCount);
        };
        window.addEventListener("tasksUpdated", handleTaskUpdate);
        return () => window.removeEventListener("tasksUpdated", handleTaskUpdate);
      }, []);

      useEffect(() => {
        const handleResize = () => setCollapsed(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);

      const headerGradient = "bg-gradient-to-r from-blue-600 to-indigo-700";

      return (
        <div
          className={`
            h-screen flex flex-col transition-all duration-300
              ${collapsed || sidebarCollapse ? "w-16" : "w-64"}
            bg-gray-100 border-r border-gray-300
            md:w-64 sm:w-20
            ml-4 md:ml-6
          `}
        >
          {/* Header */}
          <div
            className={`flex items-center px-4 py-4 ${
              collapsed ? "justify-center" : ""
            } ${headerGradient} text-white font-bold text-xl`}
          >
            <FaHome className="text-2xl" />
            {!collapsed && <span className="ml-3">Dashboard</span>}

            <button
              className="ml-auto md:hidden focus:outline-none"
              onClick={() => setCollapsed(!collapsed)}
            >
              <span className="block w-6 h-0.5 bg-white mb-1"></span>
              <span className="block w-6 h-0.5 bg-white mb-1"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 flex flex-col gap-2 mt-4 px-1">
            {menuItems.slice(1).map((item) => (
              <div
                key={item.name}
                className={`flex items-center cursor-pointer px-4 py-3 rounded transition-all duration-200
                  ${
                    active === item.name
                      ? `${headerGradient} text-white font-semibold`
                      : "text-gray-700"
                  }
                  hover:${headerGradient} hover:text-white`}
                onClick={() => {
                  setActive(item.name);

                  if (item.name === "Logout") {
                    handleLogout();
                  } else {
                    navigate(item.path);
                  }
                }}

              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span className="ml-4">{item.name}</span>}

                {(item.badgeCount ?? 0) > 0 && !collapsed && (
                  <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-red-100 bg-red-600 rounded-full">
                    {item.badgeCount}
                  </span>
                )}

              </div>
            ))}
          </nav>
        </div>
      );
    };

    export default Sidebar;
