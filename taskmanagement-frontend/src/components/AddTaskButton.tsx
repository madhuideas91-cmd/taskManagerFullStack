// src/components/AddTaskButton.tsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "./ToastProvider";
import { Task } from "./KanbanBoard";
import { getAllProjects, Project } from "../api/projects";
import ProjectDropdown from "./ProjectDropdown";

interface AddTaskButtonProps {
  column: string;
  projectId?: number; // optional for Kanban or Projects page
  onTaskAdded: (newTask?: Task) => void;
}

const AddTaskButton: React.FC<AddTaskButtonProps> = ({ column, projectId, onTaskAdded }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [assignees, setAssignees] = useState<string>(""); // comma-separated IDs
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Low");
  const [dueDate, setDueDate] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(projectId);
  const { addToast } = useToast();

  // fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getAllProjects();
        setProjects(res);
        if (!selectedProjectId && res.length > 0) setSelectedProjectId(res[0].id);
      } catch (err) {
        console.error("Failed to fetch projects", err);
        addToast("Failed to load projects", "error");
      }
    };
    fetchProjects();
  }, []);

  const handleAddTask = async () => {
    if (!title.trim()) return addToast("Task title is required", "error");
    if (!selectedProjectId) return addToast("Project not selected", "error");

    try {
      const response = await axiosInstance.post<Task>(
        "http://localhost:8080/tasks/createTask",
         //"/tasks/createTask",
        {
          title,
          status:
            column === "To Do"
              ? "OPEN"
              : column === "In Progress"
              ? "IN_PROGRESS"
              : "DONE",
          projectId: selectedProjectId,
          priority,
          assignees: assignees
            .split(",")
            .map((v) => Number(v.trim()))
            .filter(Boolean),
          description: "",
          dueDate: dueDate || null,
        }
      );

      const newTask = response.data;
      setTitle("");
      setAssignees("");
      setPriority("Low");
      setDueDate("");
      setShowModal(false);

      onTaskAdded(newTask);
      addToast(`Task "${newTask.title}" created`, "success");

      // Optional: dispatch event for other pages like Projects
      window.dispatchEvent(new CustomEvent("taskCreated", { detail: newTask }));
    } catch (err) {
      console.error("Error adding task", err);
      addToast("Failed to create task", "error");
    }
  };

  return (
    <>
      <button
        className="w-full mt-2 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition"
        onClick={() => setShowModal(true)}
      >
        + Add Task
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Task</h2>

            {/* Title */}
            <input
              type="text"
              placeholder="Task Title"
              className="w-full border px-3 py-2 mb-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Assignees */}
            <input
              type="text"
              placeholder="Assignees (comma-separated IDs)"
              className="w-full border px-3 py-2 mb-2 rounded"
              value={assignees}
              onChange={(e) => setAssignees(e.target.value)}
            />

            {/* Project dropdown */}

            <ProjectDropdown
              selectedProjectId={selectedProjectId}
              onChange={(id) => setSelectedProjectId(id)}
            />


            {/* Priority */}
            <select
              className="w-full border px-3 py-2 mb-2 rounded"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "Low" | "Medium" | "High")
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            {/* Due date */}
            <input
              type="date"
              className="w-full border px-3 py-2 mb-2 rounded"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleAddTask}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddTaskButton;
