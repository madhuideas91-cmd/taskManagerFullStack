// src/components/ProjectDropdown.tsx
import React, { useEffect, useState } from "react";
import { getAllProjects, Project } from "../api/projects";
import { useToast } from "./ToastProvider";

interface ProjectDropdownProps {
  selectedProjectId?: number;
  onChange: (projectId: number) => void;
}

const ProjectDropdown: React.FC<ProjectDropdownProps> = ({ selectedProjectId, onChange }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [current, setCurrent] = useState<number | undefined>(selectedProjectId);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getAllProjects();
        setProjects(res);
        if (!current && res.length > 0) {
          setCurrent(res[0].id);
          onChange(res[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
        addToast("Failed to load projects", "error");
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setCurrent(id);
    onChange(id);
  };

  return (
    <select
      className="w-full border px-3 py-2 mb-2 rounded"
      value={current}
      onChange={handleChange}
    >
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} (ID: {p.id})
        </option>
      ))}
    </select>
  );
};

export default ProjectDropdown;
