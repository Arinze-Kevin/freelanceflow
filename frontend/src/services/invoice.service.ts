import api from "./api";
import type { Invoice, CreateInvoiceData, ApiResponse } from "../types";

export const invoiceService = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await api.get<ApiResponse<Invoice[]>>("/invoices");
    return response.data.data as Invoice[];
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    return response.data.data as Invoice;
  },

  create: async (data: CreateInvoiceData): Promise<Invoice> => {
    const response = await api.post<ApiResponse<Invoice>>("/invoices", data);
    return response.data.data as Invoice;
  },

  update: async (
    id: string,
    data: Partial<CreateInvoiceData> & { status?: string },
  ): Promise<Invoice> => {
    const response = await api.patch<ApiResponse<Invoice>>(
      `/invoices/${id}`,
      data,
    );
    return response.data.data as Invoice;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },
};
