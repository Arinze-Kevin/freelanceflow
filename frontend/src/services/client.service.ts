import api from "./api";
import type { Client, CreateClientData, ApiResponse } from "../types";

export const clientService = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get<ApiResponse<Client[]>>("/clients");
    return response.data.data as Client[];
  },

  getById: async (id: string): Promise<Client> => {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data as Client;
  },

  create: async (data: CreateClientData): Promise<Client> => {
    const response = await api.post<ApiResponse<Client>>("/clients", data);
    return response.data.data as Client;
  },

  update: async (
    id: string,
    data: Partial<CreateClientData>,
  ): Promise<Client> => {
    const response = await api.patch<ApiResponse<Client>>(
      `/clients/${id}`,
      data,
    );
    return response.data.data as Client;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};
