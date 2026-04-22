import { Response } from 'express';
import { prisma } from '../config/prisma';
import {
  sendSuccess,
  sendError,
  generateInvoiceNumber,
  calculateInvoiceTotal,
} from '../utils';
import { AuthenticatedRequest } from '../types';

// Get all invoices for the authenticated user
export const getInvoices = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            client: {
              select: {
                id: true,
                name: true,
                companyName: true,
              },
            },
          },
        },
        items: true,
      },
    });

    sendSuccess(res, 'Invoices retrieved successfully.', invoices);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Get a single invoice
export const getInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            client: {
              select: {
                id: true,
                name: true,
                companyName: true,
                email: true,
                phone: true,
                address: true,
              },
            },
          },
        },
        items: true,
      },
    });

    if (!invoice) {
      sendError(res, 'Invoice not found.', 404);
      return;
    }

    // Calculate totals
    const totals = calculateInvoiceTotal(invoice.items, invoice.taxRate ?? 0);

    sendSuccess(res, 'Invoice retrieved successfully.', {
      ...invoice,
      ...totals,
    });
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Create a new invoice
export const createInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { projectId, dueDate, notes, taxRate, items } = req.body;

    // Verify project belongs to authenticated user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user?.id,
      },
    });

    if (!project) {
      sendError(res, 'Project not found.', 404);
      return;
    }

    // Generate unique invoice number
    const invoiceNumber = generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        dueDate: new Date(dueDate),
        notes,
        taxRate,
        projectId,
        userId: req.user?.id as string,
        items: {
          create: items.map(
            (item: {
              description: string;
              quantity: number;
              unitPrice: number;
            }) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            }),
          ),
        },
      },
      include: {
        items: true,
        project: {
          select: {
            id: true,
            title: true,
            client: {
              select: {
                id: true,
                name: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    // Calculate totals
    const totals = calculateInvoiceTotal(invoice.items, taxRate ?? 0);

    sendSuccess(
      res,
      'Invoice created successfully.',
      {
        ...invoice,
        ...totals,
      },
      201,
    );
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Update invoice status
export const updateInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, dueDate, notes, taxRate } = req.body;

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
    });

    if (!existingInvoice) {
      sendError(res, 'Invoice not found.', 404);
      return;
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes,
        taxRate,
      },
      include: {
        items: true,
        project: {
          select: {
            id: true,
            title: true,
            client: {
              select: {
                id: true,
                name: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    const totals = calculateInvoiceTotal(invoice.items, invoice.taxRate ?? 0);

    sendSuccess(res, 'Invoice updated successfully.', {
      ...invoice,
      ...totals,
    });
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Delete an invoice
export const deleteInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
    });

    if (!existingInvoice) {
      sendError(res, 'Invoice not found.', 404);
      return;
    }

    await prisma.invoice.delete({
      where: { id },
    });

    sendSuccess(res, 'Invoice deleted successfully.');
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};
