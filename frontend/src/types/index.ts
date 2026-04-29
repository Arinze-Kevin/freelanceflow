// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

// Auth types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Client types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
  };
  projects?: Project[];
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: string;
  notes?: string;
}

// Project types
export type ProjectStatus = "ACTIVE" | "IN_REVIEW" | "COMPLETED" | "ON_HOLD";

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  deadline?: string;
  budget?: number;
  userId: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
  };
  tasks?: Task[];
  timeEntries?: TimeEntry[];
  invoices?: Invoice[];
  _count?: {
    tasks: number;
    timeEntries: number;
  };
}

export interface CreateProjectData {
  title: string;
  description?: string;
  status: ProjectStatus;
  deadline?: string;
  budget?: number;
  clientId: string;
}

// Task types
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  status: TaskStatus;
  dueDate?: string;
}

// Time entry types
export interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  date: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeEntryData {
  description: string;
  hours: number;
  date: string;
}

// Invoice types
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  invoiceId: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  dueDate: string;
  notes?: string;
  taxRate?: number;
  userId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  project?: {
    id: string;
    title: string;
    client?: {
      id: string;
      name: string;
      companyName?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
  };
}

export interface CreateInvoiceData {
  projectId: string;
  dueDate: string;
  notes?: string;
  taxRate?: number;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
