import { Response } from 'express';
import { ApiResponse } from '../types';

// Send a success response
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

// Send an error response
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errors?: string[],
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(response);
};

// Generate a unique invoice number
export const generateInvoiceNumber = (): string => {
  const prefix = 'INV';
  3;
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Calculate invoice total
export const calculateInvoiceTotal = (
  items: { quantity: number; unitPrice: number }[],
  taxRate: number = 0,
): { subtotal: number; tax: number; total: number } => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  return { subtotal, tax, total };
};
