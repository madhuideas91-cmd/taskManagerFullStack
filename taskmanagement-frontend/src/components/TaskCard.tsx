

// src/components/TaskCard.tsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { createNotification } from "../api/notifications";
import { useToast } from "./ToastProvider";
import { Task } from "./KanbanBoard";
import { useNavigate } from "react-router-dom";
import { getAllProjects, Project } from "../api/projects";
import ProjectDropdown from "./ProjectDropdown";

interface TaskCardProps {
  task: Task;
  onEdit: (updatedTask: Task) => void;
  onDelete: (id: number) => void;
  showOptions?: boolean;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, showOptions = true, onClick }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState<Task["priority"]>(task.priority || "Low");
  const [assignees, setAssignees] = useState<string[]>(task.assignees?.map(String) || []);
  const [dueDate, setDueDate] = useState(task.dueDate || "");

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(task.projectId);

  // 🔹 Sync state if parent task updates externally
    useEffect(() => {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority || "Low");
      setAssignees(task.assignees?.map(String) || []);
      setDueDate(task.dueDate || "");
      setSelectedProjectId(task.projectId);
    }, [task]);

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

  const handleSave = async (
      e: React.MouseEvent<HTMLButtonElement>
      ) => {
      e.stopPropagation(); // ✅ prevent triggering parent onClick

    if (!selectedProjectId) {
        addToast("Please select a project", "error");
        return;
      }
    const updatedTask: Task = {
      ...task,
      title,
      description,
      priority,
      assignees: assignees.map(Number),
      dueDate,
      projectId: selectedProjectId,

    };

    try {
      await axiosInstance.put(`http://localhost:8080/tasks/updateTaskById/${task.id}`, updatedTask);
      //await axiosInstance.put(`/tasks/updateTaskById/${task.id}`, updatedTask);
      onEdit(updatedTask);
      try { await createNotification({ message: `Task "${updatedTask.title}" updated.` }); } catch {}
      addToast(`Task "${updatedTask.title}" saved`, "success");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save task", err);
      addToast("Failed to save task", "error");
    }
  };
  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation(); // prevent triggering parent onClick
      onDelete(task.id);
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
    };

    const handleView = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/task/${task.id}`);
    };

  return (
    <div
      className="
        bg-white border border-gray-300 rounded
        p-2
        shadow-sm hover:shadow-md transition-all duration-200
        w-full
        min-h-[80px]
        text-sm
        flex flex-col
      "
      onClick={() => onClick && onClick()}
    >


      {isEditing ? (
        <>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 mb-1 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border rounded px-2 py-1 mb-1 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 mb-2">
            {/* Priority */}
            <select
              className="flex-1 min-w-[100px] border rounded px-1 py-1 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task["priority"])}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            {/* Assignees */}
            <input
              className="flex-1 min-w-[100px] border rounded px-1 py-1 text-sm"
              placeholder="Assignees (comma-separated IDs)"
              value={assignees.join(",")}
              onChange={(e) => setAssignees(e.target.value.split(",").map((v) => v.trim()))}
            />

            {/* Due date */}
            <input
              type="date"
              className="flex-1 min-w-[100px] border rounded px-1 py-1 text-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            {/* Project dropdown */}
            <ProjectDropdown
              selectedProjectId={selectedProjectId}
              onChange={(id) => setSelectedProjectId(id)}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="font-semibold text-sm mb-1 truncate">{title}</div>
          {description && <div className="text-xs text-gray-600 mb-1 truncate">{description}</div>}
          <div className="flex flex-wrap justify-between text-xs text-gray-500 mb-1">
            <span className="truncate">Priority: {priority}</span>
            <span className="truncate">Assignees: {assignees.join(", ") || "—"}</span>
          </div>
          {dueDate && <div className="text-xs text-gray-500 mb-1 truncate">Due: {dueDate}</div>}
          {selectedProjectId && (
            <div className="text-xs text-gray-500 mb-1 truncate">
              Project: {projects.find((p) => p.id === selectedProjectId)?.name || selectedProjectId}
            </div>
          )}

          {showOptions && (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                className="px-2 py-1 bg-green-200 rounded text-xs hover:bg-green-300"
                //onClick={() => navigate(`/task/${task.id}`)}
                onClick={handleView}
              >
                View
              </button>
              <button
                className="px-2 py-1 bg-yellow-200 rounded text-xs hover:bg-yellow-300"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="px-2 py-1 bg-red-200 rounded text-xs hover:bg-red-300"
                onClick={() => onDelete(task.id)}
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskCard;
