import api from "./api";
import type { Task, CreateTaskData, ApiResponse } from "../types";

export const taskService = {
  getAll: async (projectId: string): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>(
      `/projects/${projectId}/tasks`,
    );
    return response.data.data as Task[];
  },

  create: async (projectId: string, data: CreateTaskData): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>(
      `/projects/${projectId}/tasks`,
      data,
    );
    return response.data.data as Task;
  },

  update: async (id: string, data: Partial<CreateTaskData>): Promise<Task> => {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data as Task;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
