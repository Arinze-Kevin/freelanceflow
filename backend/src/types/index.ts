import { Request } from 'express';

// Extend Express Request to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Standard API response shape
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
