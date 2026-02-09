// src/pages/CalendarPage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import axiosInstance from "../api/axiosInstance";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Modal from "react-modal";
import { FaUserCircle } from "react-icons/fa";

/* ---------------- Interfaces ---------------- */
interface Task {
  id: number;
  title: string;
  status: string;
  dueDate: string;
  projectId?: number;
  teamId?: number;
  assigneeName?: string;
}

/* ---------------- Colors ---------------- */
const statusColor: Record<string, string> = {
  OPEN: "bg-blue-500",
  IN_PROGRESS: "bg-yellow-400",
  DONE: "bg-green-500",
};

/* ---------------- Modal Setup ---------------- */
Modal.setAppElement("#root");

/* ---------------- Component ---------------- */
const CalendarPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"MONTH" | "WEEK" | "DAY">("MONTH");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weekStart, setWeekStart] = useState<Date>(new Date());

  const taskMapRef = useRef<Map<number, Task>>(new Map());
  const draggedTaskRef = useRef<Task | null>(null);

  /* ---------------- Fetch Tasks ---------------- */
  const fetchData = useCallback(async () => {
    try {
      const taskRes = await axiosInstance.get<Task[]>(
         "http://localhost:8080/tasks/getAllTasks"
        //"/tasks/getAllTasks"
      );
      taskMapRef.current.clear();
      taskRes.data.forEach((t) => taskMapRef.current.set(t.id, t));
      setTasks(taskRes.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  }, []);

  /* ---------------- WebSocket ---------------- */
  useEffect(() => {
    fetchData();
    const socket = new SockJS("http://localhost:8085/ws");
    //const socket = new SockJS("/ws");
    const stomp = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
    });

    stomp.onConnect = () => {
      stomp.subscribe("/topic/tasks", (msg: IMessage) => {
        const updated: Task = JSON.parse(msg.body);
        taskMapRef.current.set(updated.id, updated);
        setTasks(Array.from(taskMapRef.current.values()));
      });
    };

    stomp.activate();
    return () => void stomp.deactivate();
  }, [fetchData]);

  /* ---------------- Kanban → Calendar Sync ---------------- */
  useEffect(() => {
    const handleTasksUpdated = (event: CustomEvent<Task[]>) => {
      taskMapRef.current.clear();
      event.detail.forEach((t) => taskMapRef.current.set(t.id, t));
      setTasks(event.detail);
    };
    const handleTaskCreated = (event: CustomEvent<Task>) => {
      taskMapRef.current.set(event.detail.id, event.detail);
      setTasks((prev) => [...prev, event.detail]);
    };
    window.addEventListener("tasksUpdated", handleTasksUpdated as EventListener);
    window.addEventListener("taskCreated", handleTaskCreated as EventListener);
    return () => {
      window.removeEventListener("tasksUpdated", handleTasksUpdated as EventListener);
      window.removeEventListener("taskCreated", handleTaskCreated as EventListener);
    };
  }, []);

  /* ---------------- Calendar Helpers ---------------- */
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const calendarStart = new Date(firstDayOfMonth);
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay());

  const days: Date[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(calendarStart);
    d.setDate(calendarStart.getDate() + i);
    return d;
  });

  const tasksForDay = (date: Date) =>
    tasks.filter((t) => t.dueDate === date.toISOString().split("T")[0]);

  const isOverdue = (date: string) =>
    new Date(date) < new Date(new Date().toDateString());

  /* ---------------- Drag & Drop ---------------- */
  const onDragStart = (task: Task) => {
    draggedTaskRef.current = task;
  };

  const onDropDay = (date: Date) => {
    if (!draggedTaskRef.current) return;

    const updatedTask = {
      ...draggedTaskRef.current,
      dueDate: date.toISOString().split("T")[0],
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );

    axiosInstance.put(
      `http://localhost:8080/tasks/updateTaskById/${updatedTask.id}`,
      //`/tasks/updateTaskById/${updatedTask.id}`,
      updatedTask
    );
  };

  /* ---------------- Month Navigation ---------------- */
  const prevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };
  const nextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  /* ---------------- Week Navigation ---------------- */
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d;
  };

  const prevWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const nextWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const getWeekDates = (start: Date) =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  /* ---------------- Render ---------------- */
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <h2 className="text-xl font-semibold">{monthLabel}</h2>

          {/* Month / Week Navigation */}
          <div className="flex gap-2">
            {viewMode === "MONTH" && (
              <>
                <button
                  onClick={prevMonth}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  Prev
                </button>
                <button
                  onClick={nextMonth}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  Next
                </button>
              </>
            )}
            {viewMode === "WEEK" && (
              <>
                <button
                  onClick={prevWeek}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  Prev Week
                </button>
                <button
                  onClick={nextWeek}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  Next Week
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2 mt-2 md:mt-0">
            {["MONTH", "WEEK", "DAY"].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setViewMode(v as any);
                  if (v === "WEEK") setWeekStart(startOfWeek(new Date()));
                }}
                className={`px-3 py-1 border rounded ${
                  viewMode === v ? "bg-indigo-600 text-white" : "hover:bg-gray-100"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* ===== WEEKDAY HEADER ===== */}
        <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center py-2 text-[10px] md:text-xs">
              {d}
            </div>
          ))}
        </div>

        {/* ===== MONTH VIEW ===== */}
        {viewMode === "MONTH" && (
          <div className="grid grid-cols-7 grid-rows-6 bg-white rounded shadow overflow-auto md:overflow-visible gap-1">
            {days.map((date, i) => {
              const dayTasks = tasksForDay(date);
              return (
                <div
                  key={i}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropDay(date)}
                  className="h-28 md:h-36 border p-1 md:p-2 hover:bg-indigo-50 transition flex flex-col"
                >
                  <div className="text-xs font-semibold mb-1 flex justify-between">
                    {date.getDate()}
                    {dayTasks.some((t) => isOverdue(t.dueDate)) && (
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden flex-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => onDragStart(task)}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsModalOpen(true);
                        }}
                        className={`text-xs text-white px-2 py-1 rounded cursor-pointer ${statusColor[task.status]}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate text-[10px] md:text-xs">
                            {task.title}
                          </span>
                          <FaUserCircle className="text-white/80 text-[10px] md:text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== WEEK VIEW ===== */}
        {viewMode === "WEEK" && (
          <div className="grid grid-cols-7 bg-white rounded shadow overflow-x-auto">
            {getWeekDates(weekStart).map((date, i) => (
              <div key={i} className="border p-2 min-w-[80px] md:min-w-[120px]">
                <div className="font-semibold text-xs md:text-sm mb-1">{date.toDateString()}</div>
                {tasksForDay(date).map((task) => (
                  <div
                    key={task.id}
                    className={`text-[10px] md:text-xs text-white px-1 py-1 rounded mb-1 ${statusColor[task.status]}`}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ===== DAY VIEW ===== */}
        {viewMode === "DAY" && (
          <div className="bg-white rounded shadow p-3 overflow-x-auto">
            <h3 className="font-semibold mb-2">{currentMonth.toDateString()}</h3>
            {tasksForDay(currentMonth).map((task) => (
              <div
                key={task.id}
                className={`p-2 rounded mb-1 text-white text-[12px] md:text-xs ${statusColor[task.status]}`}
              >
                {task.title}
              </div>
            ))}
          </div>
        )}

        {/* ===== MODAL ===== */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-24"
          overlayClassName="fixed inset-0 bg-black/30 z-50"
        >
          {selectedTask && (
            <>
              <h2 className="text-lg font-bold mb-2">{selectedTask.title}</h2>
              <p className="text-sm">Status: {selectedTask.status}</p>
              <p className="text-sm">Due: {selectedTask.dueDate}</p>

              <button
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CalendarPage;
