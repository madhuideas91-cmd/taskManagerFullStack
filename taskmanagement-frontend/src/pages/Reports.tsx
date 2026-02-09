// src/pages/Reports.tsx
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { FaTasks, FaUsers, FaProjectDiagram, FaCalendarAlt } from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import axiosInstance from "../api/axiosInstance";

interface Team {
  id: number;
  name: string;
}

interface TaskReport {
  task: string;
  project: string;
  assignedTo: string;
  status: "To Do" | "In Progress" | "Done";
  dueDate: string;
  date: string;
}

interface ProjectReport {
  id: number;
  name: string;
  progress: number;
}

interface StatusReport {
  name: "To Do" | "In Progress" | "Done";
  value: number;
  color: string;
}

const statusColors: Record<string, string> = {
  "To Do": "bg-blue-500",
  "In Progress": "bg-yellow-500",
  "Done": "bg-green-500",
};

const Reports: React.FC = () => {
  const [view, setView] = useState<"summary" | "detailed">("summary");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "To Do" | "In Progress" | "Done">("All");

  const [tasks, setTasks] = useState<TaskReport[]>([]);
  const [projects, setProjects] = useState<ProjectReport[]>([]);
  const [statusData, setStatusData] = useState<StatusReport[]>([]);
  const [tasksOverTime, setTasksOverTime] = useState<{ date: string; tasks: number; completed: number }[]>([]);

  const [teams, setTeams] = useState<Team[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- Tasks
        const tasksRes = await axiosInstance.get<any[]>(
         "http://localhost:8080/tasks/getAllTasks"
             //"/tasks/getAllTasks"
        );

        const mappedTasks: TaskReport[] = tasksRes.data.map((t) => ({
          task: t.title ?? "-",
          project: t.projectName ?? `Project ${t.projectId}`,
          assignedTo: t.assignees?.join(", ") || "-",
          status:
            t.status === "OPEN"
              ? "To Do"
              : t.status === "IN_PROGRESS"
              ? "In Progress"
              : "Done",
          dueDate: t.dueDate ?? "",
          date: t.createdAt ?? new Date().toISOString(),
        }));
        setTasks(mappedTasks);

        // --- Projects
        const projectsRes = await axiosInstance.get<ProjectReport[]>(
           "http://localhost:8080/projects/getAllProjectsWithProgress"
         //"/projects/getAllProjectsWithProgress"
        );
        setProjects(projectsRes.data);

        // --- Teams (✅ FIX)
        const teamsRes = await axiosInstance.get<Team[]>(
           "http://localhost:8080/api/teams/my-teams",
              //"/teams/my-teams",
          {
            params: { userId: Number(localStorage.getItem("userId")) },
          }
        );
        setTeams(teamsRes.data);

        // --- Status Pie
        setStatusData([
          { name: "To Do", value: mappedTasks.filter(t => t.status === "To Do").length, color: "#60A5FA" },
          { name: "In Progress", value: mappedTasks.filter(t => t.status === "In Progress").length, color: "#FACC15" },
          { name: "Done", value: mappedTasks.filter(t => t.status === "Done").length, color: "#34D399" },
        ]);

        // --- Tasks over time
        const grouped: Record<string, { tasks: number; completed: number }> = {};
        mappedTasks.forEach((t) => {
          const month = new Date(t.date).toLocaleString("default", { month: "short" });
          if (!grouped[month]) grouped[month] = { tasks: 0, completed: 0 };
          grouped[month].tasks++;
          if (t.status === "Done") grouped[month].completed++;
        });

        setTasksOverTime(
          Object.entries(grouped).map(([date, v]) => ({ date, ...v }))
        );
      } catch (err) {
        console.error("Failed to fetch reports", err);
      }
    };

    fetchData();
  }, []);

  // --- Filtered data for detailed table
  const filteredData = useMemo(() =>
    tasks.filter(item =>
      ((item.task ?? "").toLowerCase().includes(search.toLowerCase()) ||
       (item.project ?? "").toLowerCase().includes(search.toLowerCase()) ||
       (item.assignedTo ?? "").toLowerCase().includes(search.toLowerCase()) ||
       (item.status ?? "").toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "All" || item.status === statusFilter)
    ), [tasks, search, statusFilter]
  );

  const uniqueMembersCount = useMemo(() => Array.from(new Set(tasks.flatMap(t => t.assignedTo.split(", ")))).length, [tasks]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded transition-colors duration-200 ${view === "summary" ? "bg-blue-600 text-white" : "bg-white border"}`}
              onClick={() => setView("summary")}
            >Summary</button>
            <button
              className={`px-4 py-2 rounded transition-colors duration-200 ${view === "detailed" ? "bg-blue-600 text-white" : "bg-white border"}`}
              onClick={() => setView("detailed")}
            >Detailed</button>
          </div>
        </div>

        {/* Summary Cards */}
        {view === "summary" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3 hover:scale-105 transition-transform">
              <FaTasks className="text-3xl text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-xl font-bold">{tasks.length}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3 hover:scale-105 transition-transform">
              <FaProjectDiagram className="text-3xl text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Projects</p>
                <p className="text-xl font-bold">{projects.length}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3 hover:scale-105 transition-transform">
              <FaUsers className="text-3xl text-yellow-600" />
              <div>
                <p className="text-sm text-gray-500">Teams</p>
                <p className="text-xl font-bold">{teams.length}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3 hover:scale-105 transition-transform">
              <FaCalendarAlt className="text-3xl text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Pending Deadlines</p>
                <p className="text-xl font-bold">{tasks.filter(t => t.status !== "Done" && new Date(t.dueDate) > new Date()).length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {view === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl shadow hover:scale-105 transition-transform">
              <h2 className="font-semibold mb-2">Tasks Over Time</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={tasksOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tasks" stroke="#3B82F6" />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-xl shadow hover:scale-105 transition-transform">
              <h2 className="font-semibold mb-2">Task Status</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData as any}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Detailed Table */}
        {view === "detailed" && (
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="font-semibold text-lg">Detailed Reports</h2>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="border px-3 py-2 rounded w-64"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="border px-3 py-2 rounded"
                >
                  <option value="All">All Status</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-2 border">Task</th>
                    <th className="px-4 py-2 border">Project</th>
                    <th className="px-4 py-2 border">Assigned To</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                      <td className="px-4 py-2 border">{item.task}</td>
                      <td className="px-4 py-2 border">{item.project}</td>
                      <td className="px-4 py-2 border">{item.assignedTo}</td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`px-2 py-1 rounded-full text-white text-sm ${statusColors[item.status] || "bg-gray-400"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-gray-500 text-center">
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;