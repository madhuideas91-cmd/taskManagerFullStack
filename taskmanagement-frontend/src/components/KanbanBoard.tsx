// src/components/KanbanBoard.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import axiosInstance from "../api/axiosInstance";
import TaskCard from "./TaskCard";
import AddTaskButton from "./AddTaskButton";
import { createNotification } from "../api/notifications";
import { useToast } from "./ToastProvider";
import "../styles/KanbanBoard.css";


// ✅ Updated Task interface to match backend
export interface Task {
  id: number;
  title: string;
  status: string;
  projectId?: number;
  description?: string;
  priority?: "Low" | "Medium" | "High";
  assignees?: number[]; // ✅ now array of user IDs
  dueDate?: string;

}

const columns = ["To Do", "In Progress", "Done"];
const statusMapReverse: Record<string, string> = {
  "To Do": "OPEN",
  "In Progress": "IN_PROGRESS",
  "Done": "DONE",
};

interface KanbanBoardProps {
  searchQuery?: string;
  onSelectTask?: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ searchQuery = "", onSelectTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { addToast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axiosInstance.get<Task[]>("http://localhost:8080/tasks/getAllTasks");
      //const res = await axiosInstance.get<Task[]>("/tasks/getAllTasks");
      setTasks(res.data || []);
      emitTasksUpdate(res.data || []);
      emitProjectsProgress(res.data || []);
    } catch (err) {
      console.error("Error fetching tasks", err);
      addToast("Failed to load tasks", "error");
    }
  }, [addToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const emitTasksUpdate = (updatedTasks: Task[]) => {
    window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: updatedTasks }));
  };

  const emitProjectsProgress = (allTasks: Task[]) => {
    const counts: Record<number, { total: number; done: number }> = {};

    allTasks.forEach((t) => {
      if (!t.projectId) return;
      if (!counts[t.projectId]) counts[t.projectId] = { total: 0, done: 0 };
      counts[t.projectId].total += 1;
      if (t.status === "DONE") counts[t.projectId].done += 1;
    });

    const progressMap: Record<number, number> = {};
    Object.entries(counts).forEach(([projectId, { total, done }]) => {
      const progress = total === 0 ? 0 : Math.round((done / total) * 100);
      progressMap[Number(projectId)] = progress;
    });

    window.dispatchEvent(new CustomEvent("projectsProgressUpdated", { detail: progressMap }));
  };

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const taskIndex = tasks.findIndex((t) => t.id === Number(draggableId));
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    const oldStatus = task.status;

    const updatedTask: Task = {
      ...task,
      status: statusMapReverse[destination.droppableId] || "OPEN",
    };

    const prevTasks = tasks;
    const newTasks = prevTasks.map((t) => (t.id === task.id ? updatedTask : t));
    setTasks(newTasks);
    emitTasksUpdate(newTasks);
    emitProjectsProgress(newTasks);

    try {
      await axiosInstance.put(`http://localhost:8080/tasks/updateTaskById/${task.id}`, updatedTask);
      //await axiosInstance.put(`/tasks/updateTaskById/${task.id}`, updatedTask);
      await axiosInstance.patch(`http://localhost:8080/tasks/updateStatus/${task.id}`, { status: updatedTask.status });
      //await axiosInstance.patch(`/tasks/updateStatus/${task.id}`, { status: updatedTask.status });
      try { await createNotification({ message: `Task "${task.title}" moved from ${oldStatus} → ${updatedTask.status}` }); } catch {}
      addToast(`Moved "${task.title}" to ${updatedTask.status}`, "success");
    } catch (err) {
      setTasks(prevTasks);
      emitTasksUpdate(prevTasks);
      emitProjectsProgress(prevTasks);
      addToast("Failed to move task — reverted", "error");
    }
  }, [tasks, addToast]);

  const handleEditTask = (updatedTask: Task) => {
    const newTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(newTasks);
    emitTasksUpdate(newTasks);
    emitProjectsProgress(newTasks);

  };

  const handleDeleteTask = async (id: number) => {
    const t = tasks.find((x) => x.id === id);
    const prev = tasks;
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
    emitTasksUpdate(newTasks);
    emitProjectsProgress(newTasks);

    try {
      await axiosInstance.delete(`http://localhost:8080/tasks/deleteTaskById/${id}`);
      //await axiosInstance.delete(`/tasks/deleteTaskById/${id}`);
      try { await createNotification({ message: `Task "${t?.title ?? id}" deleted.` }); } catch {}
      addToast(`Deleted "${t?.title ?? id}"`, "success");
    } catch (err) {
      setTasks(prev);
      emitTasksUpdate(prev);
      emitProjectsProgress(prev);
      fetchTasks();
      addToast("Delete failed. Reloading...", "error");
    }
  };

  const handleTaskAdded = (newTask?: Task) => {
    if (!newTask || !newTask.projectId) return;
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    window.dispatchEvent(new CustomEvent("taskCreated", { detail: newTask }));
    emitTasksUpdate(updatedTasks);
    emitProjectsProgress(updatedTasks);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftShadow(scrollLeft > 5);
    setShowRightShadow(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    handleScroll();
  }, [tasks]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
//         className="relative flex flex-col md:flex-row gap-4 overflow-x-auto p-2 md:p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scroll-smooth snap-x snap-mandatory"
       className="kanban-container relative flex flex-col md:flex-row gap-4 overflow-x-auto p-2 md:p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scroll-smooth snap-x snap-mandatory"

      >
        {showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none bg-gradient-to-r from-gray-100 to-transparent z-10" />
        )}
        {showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none bg-gradient-to-l from-gray-100 to-transparent z-10" />
        )}

        {columns.map((col) => (
          <Droppable droppableId={col} key={col}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
//                 className="bg-white border border-gray-300 rounded-md flex-shrink-0 flex-1 min-w-[220px] md:min-w-[250px] p-3 max-h-[65vh] md:max-h-[70vh] overflow-y-auto snap-start"
              className="kanban-column bg-white border border-gray-300 rounded-md flex-shrink-0 flex-1 min-w-[220px] md:min-w-[250px] p-3 max-h-[65vh] md:max-h-[70vh] overflow-y-auto snap-start"

              >
               <div className="kanban-column-title font-bold mb-3 text-lg truncate pb-1 border-b border-gray-300">{col}</div>
                {tasks
                  .filter((t) => t.status === statusMapReverse[col] && t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
//                           className="mb-3"
                           className="kanban-task mb-3"

                        >
                          <TaskCard
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            showOptions={true}
                            onClick={() => onSelectTask && onSelectTask(task)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}

                <div className="mt-2 w-full md:w-auto">
                  <AddTaskButton
                    column={col}
                    projectId={tasks.length > 0 ? tasks[0].projectId : undefined}
                    onTaskAdded={handleTaskAdded}
                  />
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
