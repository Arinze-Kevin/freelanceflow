import { Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

// Get all clients for the authenticated user
export const getClients = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    sendSuccess(res, 'Clients retrieved successfully.', clients);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Get a single client by ID
export const getClient = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            deadline: true,
            createdAt: true,
          },
        },
      },
    });

    if (!client) {
      sendError(res, 'Client not found.', 404);
      return;
    }

    sendSuccess(res, 'Client retrieved successfully.', client);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Create a new client
export const createClient = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, phone, companyName, address, notes } = req.body;

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        companyName,
        address,
        notes,
        userId: req.user?.id as string,
      },
    });

    sendSuccess(res, 'Client created successfully.', client, 201);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Update a client
export const updateClient = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, email, phone, companyName, address, notes } = req.body;

    // Check client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
    });

    if (!existingClient) {
      sendError(res, 'Client not found.', 404);
      return;
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        companyName,
        address,
        notes,
      },
    });

    sendSuccess(res, 'Client updated successfully.', client);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Delete a client
export const deleteClient = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Check client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
    });

    if (!existingClient) {
      sendError(res, 'Client not found.', 404);
      return;
    }

    await prisma.client.delete({
      where: { id },
    });

    sendSuccess(res, 'Client deleted successfully.');
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};
