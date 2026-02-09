    import React, { useState, useEffect, useCallback, useMemo } from "react";
    import Sidebar from "../components/Sidebar";
    import AddTaskButton from "../components/AddTaskButton";
    import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";
    import axios from "axios";
    import { connectTaskSocket } from "../socket/taskSocket";
    import axiosInstance from "../api/axiosInstance"; // ✅ ADD THIS



    /* ---------------- Interfaces ---------------- */
    interface Task {
      id: number;
      title: string;
      status: "TODO" | "IN_PROGRESS" | "DONE";
      projectId?: number;
      assignee?: string;
    }

    interface Project {
      id: number;
      name: string;
      description?: string;
      tagColor: string;
      progress: number;
      avatars: string[];
      status: "On Track" | "Delayed" | "Completed";
      startDate: string;
      endDate: string;
      tasks: Task[];
    }

    interface ProjectResponse {
      id: number;
      name: string;
      description?: string;
      progress: number;
      status: "On Track" | "Delayed" | "Completed";
      startDate: string;
      endDate: string;
      team: string[];
    }

    interface Team {
      id: number;
      name: string;
    }

    /* ---------------- Component ---------------- */
    const Projects: React.FC = () => {
      const [projects, setProjects] = useState<Project[]>([]);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [modalType, setModalType] = useState<"create" | "edit">("create");
      const [currentProject, setCurrentProject] = useState<Project | null>(null);
      const [projectName, setProjectName] = useState("");
      const [projectDescription, setProjectDescription] = useState("");
      const [projectColor, setProjectColor] = useState("bg-blue-500");
      const [searchTerm, setSearchTerm] = useState("");
      const [teams, setTeams] = useState<Team[]>([]);
      const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

      /* ---------------- Load Teams ---------------- */
      /* ---------------- Load Teams (UPDATED) ---------------- */
      useEffect(() => {
        const loadTeams = async () => {
          try {
            const userId = Number(localStorage.getItem("userId"));

            const res = await axiosInstance.get<Team[]>(
              "http://localhost:8080/api/teams/my-teams",
                 //"/teams/my-teams",
              {
                params: { userId },
              }
            );

            setTeams(res.data);

            // ✅ Force team selection: do NOT auto-select first team
            const storedTeam = localStorage.getItem("selectedTeam");
            if (storedTeam) {
              setSelectedTeamId(JSON.parse(storedTeam).id);
            } else {
              setSelectedTeamId(null); // <-- force user to select
            }
          } catch (err) {
            console.error("Failed to load teams", err);
          }
        };

        loadTeams();
      }, []);

      const API_BASE = "http://localhost:8080/projects";
      //const API_BASE = "/projects";
      const token = localStorage.getItem("token");
      const axiosConfig = useMemo(
        () => ({
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }),
        [token]
      );

      const calculateProgress = (tasks: Task[]) => {
        if (!tasks.length) return 0;
        const done = tasks.filter((t) => t.status === "DONE").length;
        return Math.round((done / tasks.length) * 100);
      };

      const calculateStatus = (progress: number, endDate: string) => {
        if (progress === 100) return "Completed";
        if (new Date(endDate) < new Date()) return "Delayed";
        return "On Track";
      };

      /* ---------------- Fetch Projects ---------------- */

//       const fetchProjects = useCallback(async () => {
//         try {
//           // ✅ Use axiosInstance instead of axios with manual config
//           const res = await axiosInstance.get<ProjectResponse[]>(
//             `${API_BASE}/getAllProjectsWithProgress`
//           );
//
//           const mapped: Project[] = await Promise.all(
//             res.data.map(async (p) => {
//               const tasksRes = await axiosInstance.get<Task[]>(
//                 `${API_BASE}/${p.id}/tasks`
//               );
//               const tasks = tasksRes.data || [];
//               const progress = calculateProgress(tasks);
//
//               return {
//                 id: p.id,
//                 name: p.name,
//                 description: p.description || "",
//                 tagColor: "bg-blue-500",
//                 avatars: Array.isArray(p.team) ? p.team : [],
//                 startDate: p.startDate,
//                 endDate: p.endDate,
//                 tasks,
//                 progress,
//                 status: calculateStatus(progress, p.endDate),
//               };
//             })
//           );
//
//           setProjects(mapped);
//         } catch (err: any) {
//           console.error("Error fetching projects:", err);
//           if (err.response?.status === 403) {
//             alert("Access forbidden. Please login again.");
//             localStorage.removeItem("token");
//           }
//         }
//       }, []);//

const fetchProjects = useCallback(async () => {
  try {
    // 🔹 ONLY change: remove headers for this public endpoint
    const res = await axiosInstance.get<ProjectResponse[]>(
      `${API_BASE}/getAllProjectsWithProgress`
    );

    const mapped: Project[] = await Promise.all(
      res.data.map(async (p) => {
        const tasksRes = await axiosInstance.get<Task[]>(
          `${API_BASE}/${p.id}/tasks` // keep headers here if needed
        );
        const tasks = tasksRes.data || [];
        const progress = calculateProgress(tasks);

        return {
          id: p.id,
          name: p.name,
          description: p.description || "",
          tagColor: "bg-blue-500",
          avatars: Array.isArray(p.team) ? p.team : [],
          startDate: p.startDate,
          endDate: p.endDate,
          tasks,
          progress,
          status: calculateStatus(progress, p.endDate),
        };
      })
    );

    setProjects(mapped);
  } catch (err: any) {
    console.error("Error fetching projects:", err);
    if (err.response?.status === 403) {
      alert("Access forbidden. Please login again.");
      localStorage.removeItem("token");
    }
  }
}, []);


      useEffect(() => {
        fetchProjects();

        const onTaskCreated = () => fetchProjects();
        const onTaskUpdated = () => fetchProjects();

        window.addEventListener("taskCreated", onTaskCreated);
        window.addEventListener("taskUpdated", onTaskUpdated);

        return () => {
          window.removeEventListener("taskCreated", onTaskCreated);
          window.removeEventListener("taskUpdated", onTaskUpdated);
        };
      }, [fetchProjects]);

      useEffect(() => {
        const refresh = () => fetchProjects().catch(console.error);
        const client = connectTaskSocket(0, refresh);
        return () => {
          client.deactivate();
        };
      }, [fetchProjects]);

      /* ---------------- Modal ---------------- */
      const openModal = (type: "create" | "edit", project?: Project) => {
        setModalType(type);
        if (project) {
          setCurrentProject(project);
          setProjectName(project.name);
          setProjectDescription(project.description || "");
          setProjectColor(project.tagColor);
        } else {
          setCurrentProject(null);
          setProjectName("");
          setProjectDescription("");
          setProjectColor("bg-blue-500");
        }
        setIsModalOpen(true);
      };

      const handleCreate = async () => {
        if (!selectedTeamId) {
          alert("Please select a team");
          return;
        }

        // 🔥 Send selectedTeamId to backend
        await axiosInstance.post(`${API_BASE}/create`, {
          name: projectName,
          description: projectDescription,
          teamId: selectedTeamId,
        });


        await fetchProjects();
        setIsModalOpen(false);
      };

      const handleEdit = async () => {
        if (!currentProject) return;
//         await axios.put(
//           `${API_BASE}/${currentProject.id}`,
//           { name: projectName, description: projectDescription },
//           axiosConfig
//         );
           await axiosInstance.put(`${API_BASE}/${currentProject.id}`, {
             name: projectName,
             description: projectDescription,
           });

        await fetchProjects();
        setIsModalOpen(false);
      };

      const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this project?")) return;
        //await axios.delete(`${API_BASE}/${id}`, axiosConfig);
        await axiosInstance.delete(`${API_BASE}/${id}`);
        fetchProjects();
      };

      const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      /* ---------------- UI ---------------- */
      return (
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 p-6 md:p-8 projects-container">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Projects</h1>
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => openModal("create")}
              >
                <FaPlus className="mr-2" /> Add Project
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="flex items-center gap-2 w-full">
                <FaSearch className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                />
              </div>
            </div>

            {/* Projects List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl p-4 shadow-sm border flex flex-col justify-between hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="font-semibold text-lg">{project.name}</h2>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          project.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : project.status === "Delayed"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-600 mb-2 truncate">
                        {project.description}
                      </p>
                    )}

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${project.tagColor}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {project.progress}% complete
                      </span>
                    </div>

                    {/* Tasks */}
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {project.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex justify-between items-center p-1 border rounded hover:bg-gray-50 transition"
                        >
                          <div>
                            <p className="text-sm font-medium">{task.title}</p>
                            {task.assignee && (
                              <span className="text-xs text-gray-500">
                                {task.assignee}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              task.status === "DONE"
                                ? "bg-green-100 text-green-700"
                                : task.status === "IN_PROGRESS"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Task Button */}
                  <AddTaskButton
                    column="To Do"
                    projectId={project.id}
                    onTaskAdded={fetchProjects}
                  />

                  {/* Edit/Delete Project */}
                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                      onClick={() => openModal("edit", project)}
                    >
                      <FaEdit className="inline mr-1" /> Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                      onClick={() => handleDelete(project.id)}
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <p className="text-gray-500 col-span-full">No projects found.</p>
              )}
            </div>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
              <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">
                  {modalType === "create" ? "Create Project" : "Edit Project"}
                </h2>
                {/* ✅ TEAM SELECT (ONLY FOR CREATE) */}
                {modalType === "create" && (
                  <select
                    className="w-full border px-3 py-2 mb-2 rounded"
                    value={selectedTeamId ?? ""}
                    onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                  >
                    <option value="" disabled>
                      Select Team
                    </option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  placeholder="Project Name"
                  className="w-full border px-3 py-2 mb-2 rounded"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                <textarea
                  placeholder="Project Description"
                  className="w-full border px-3 py-2 mb-2 rounded"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={modalType === "create" ? handleCreate : handleEdit}
                  >
                    {modalType === "create" ? "Create" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default Projects;
