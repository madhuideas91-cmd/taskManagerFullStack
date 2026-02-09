import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import KanbanBoard, { Task } from "../components/KanbanBoard";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "../components/ToastProvider";
import { FaUserCircle, FaSearch } from "react-icons/fa";
import CommentsPanel, { Comment } from "../components/CommentsPanel";

const Dashboard: React.FC = () => {
  const { addToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [userName, setUserName] = useState<string>("You");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get<{ id: number; email: string; role: string; name: string;}>(
        "http://localhost:8080/api/auth/profile",
          //"/auth/profile",

        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserName(res.data.email);
//       setCurrentUserId(null);
      setCurrentUserId(res.data.id);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  }, []);

  // 1️⃣ Fetch comments first
  const fetchCommentsForTask = useCallback(async (taskId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get<Comment[]>(`/api/comments/task/${taskId}`, {
        //const res = await axiosInstance.get<Comment[]>(`/comments/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch comments", err);
      addToast("Failed to load comments", "error");
    }
  }, [addToast]);

  // 2️⃣ Then fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<Task[]>("/tasks/getAllTasks");
      setTasks(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedTask(res.data[0]);
        await fetchCommentsForTask(res.data[0].id); // ✅ now safe
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      addToast("Failed to load dashboard tasks", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchCommentsForTask]);


  useEffect(() => {
    // Only fetch if token exists
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
      fetchTasks();
    }
  }, [fetchUser, fetchTasks]);


  useEffect(() => {
    const handleTasksUpdated = (e: any) => {
      const updatedTasks: Task[] = e.detail;
      setTasks(updatedTasks);
    };
    window.addEventListener("tasksUpdated", handleTasksUpdated);
    return () => window.removeEventListener("tasksUpdated", handleTasksUpdated);
  }, []);

  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "OPEN").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const done = tasks.filter((t) => t.status === "DONE").length;

  const addComment = async (text: string, taskId: number) => {
    if (!text.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post<Comment>(
        "http://localhost:8084/api/comments/add",
          //"/comments/add",
        { text, taskId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to add comment", err);
      addToast("Failed to add comment", "error");
    }
  };

  const deleteComment = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
       await axios.delete(`http://localhost:8084/api/comments/${id}`, {
        //await axiosInstance.delete(`/api/comments/${id}`,{
        //await axiosInstance.delete(`/comments/${id}`,{
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete comment", err);
      addToast("Failed to delete comment", "error");
    }
  };

  const upcomingDeadlines = tasks
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <div className="flex-shrink-0 border-r border-gray-300">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 bg-gray-100 overflow-auto">
        {/* Search + User */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3 md:gap-0">
          <div className="flex items-center border rounded bg-white px-4 py-2 shadow-sm w-full md:w-2/5">
            <FaSearch className="text-gray-400 mr-3 text-lg" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full outline-none border-none bg-transparent text-sm md:text-base"
            />
          </div>
          <FaUserCircle className="text-3xl text-gray-700 cursor-pointer" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-300">
            <div className="text-sm text-gray-500">Total Tasks</div>
            <div className="text-2xl font-bold">{loading ? "..." : total}</div>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-300">
            <div className="text-sm text-gray-500">To Do</div>
            <div className="text-2xl font-bold">{loading ? "..." : todo}</div>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-300">
            <div className="text-sm text-gray-500">In Progress</div>
            <div className="text-2xl font-bold">{loading ? "..." : inProgress}</div>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-300">
            <div className="text-sm text-gray-500">Done</div>
            <div className="text-2xl font-bold">{loading ? "..." : done}</div>
          </div>
        </div>

        {/* Kanban + Comments */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-19 overflow-x-auto border border-gray-300 rounded bg-white p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <KanbanBoard
              searchQuery={searchQuery}
              onSelectTask={(task) => {
                setSelectedTask(task);
                fetchCommentsForTask(task.id);
              }}
            />
          </div>

          <div className="w-full lg:w-80 border border-gray-300 rounded bg-white p-2">
           <CommentsPanel
             comments={comments}
             onAddComment={(text) => selectedTask && addComment(text, selectedTask.id)}
             onDeleteComment={deleteComment}
             currentUserId={currentUserId ?? undefined}
           />

          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white border border-gray-300 rounded-xl shadow-md p-4 w-full md:w-auto">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Upcoming Deadlines</h2>
          {upcomingDeadlines.length === 0 ? (
            <div className="text-gray-500 text-sm">No upcoming deadlines.</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {upcomingDeadlines.map((t) => {
                const today = new Date();
                const due = new Date(t.dueDate!);
                const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                let badgeGradient = "bg-gradient-to-r from-green-200 to-green-400 text-green-900";
                if (diffDays <= 2 && diffDays >= 0)
                  badgeGradient = "bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900";
                else if (diffDays < 0)
                  badgeGradient = "bg-gradient-to-r from-red-200 to-red-400 text-red-900";

                const priorityGradient =
                  t.priority === "High"
                    ? "bg-gradient-to-r from-red-400 to-red-600"
                    : t.priority === "Medium"
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    : "bg-gradient-to-r from-green-400 to-green-600";

                // ✅ Updated initials to use assignees array
                const initials =
                  t.assignees && t.assignees.length > 0
                    ? t.assignees
                        .map((id: number) => id.toString()[0]) // first digit of ID
                        .join("")
                        .toUpperCase()
                    : "?";

                return (
                  <div
                    key={t.id}
                    className="flex flex-col p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 w-52"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-3 h-3 rounded-full ${priorityGradient}`}></span>
                      <span className="ml-2 font-medium text-sm truncate">{t.title}</span>
                      <span className="ml-2 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                        {initials}
                      </span>
                    </div>
                    <div
                      className={`ml-3 px-3 py-1 rounded-full flex items-center gap-2 flex-shrink-0 ${badgeGradient}`}
                    >
                      <span className="font-medium text-sm">
                        {diffDays > 0
                          ? `in ${diffDays} day${diffDays > 1 ? "s" : ""}`
                          : diffDays === 0
                          ? "Today"
                          : `${-diffDays} day${-diffDays > 1 ? "s" : ""} ago`}
                      </span>
                      <span className="text-xs text-gray-100">
                        {due.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
