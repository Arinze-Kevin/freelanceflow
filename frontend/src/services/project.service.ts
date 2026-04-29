import api from "./api";
import type { Project, CreateProjectData, ApiResponse } from "../types";

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<ApiResponse<Project[]>>("/projects");
    return response.data.data as Project[];
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data as Project;
  },

  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>("/projects", data);
    return response.data.data as Project;
  },

  update: async (
    id: string,
    data: Partial<CreateProjectData>,
  ): Promise<Project> => {
    const response = await api.patch<ApiResponse<Project>>(
      `/projects/${id}`,
      data,
    );
    return response.data.data as Project;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
