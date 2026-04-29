import api from "./api";
import type { TimeEntry, CreateTimeEntryData, ApiResponse } from "../types";

export const timeEntryService = {
  getAll: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/time-entries`);
    return response.data.data as {
      timeEntries: TimeEntry[];
      totalHours: number;
    };
  },

  create: async (
    projectId: string,
    data: CreateTimeEntryData,
  ): Promise<TimeEntry> => {
    const response = await api.post<ApiResponse<TimeEntry>>(
      `/projects/${projectId}/time-entries`,
      data,
    );
    return response.data.data as TimeEntry;
  },

  update: async (
    id: string,
    data: Partial<CreateTimeEntryData>,
  ): Promise<TimeEntry> => {
    const response = await api.patch<ApiResponse<TimeEntry>>(
      `/time-entries/${id}`,
      data,
    );
    return response.data.data as TimeEntry;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/time-entries/${id}`);
  },
};
