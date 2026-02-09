// src/api/projects.ts
import axiosInstance from "./axiosInstance";

export interface Project {
  id: number;
  name: string;
}

export const getAllProjects = async (): Promise<Project[]> => {
  const res = await axiosInstance.get<Project[]>("http://localhost:8080/projects/getAllProjects");
  //const res = await axiosInstance.get<Project[]>("/api/projects/getAllProjects");
  //const res = await axiosInstance.get<Project[]>("/projects/getAllProjects");
  return res.data;
};
