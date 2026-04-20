import { Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

// Get all projects for the authenticated user
export const getProjects = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            timeEntries: true,
          },
        },
      },
    });

    sendSuccess(res, 'Projects retrieved successfully.', projects);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Get a single project by ID
export const getProject = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        timeEntries: {
          orderBy: { date: 'desc' },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            dueDate: true,
          },
        },
      },
    });

    if (!project) {
      sendError(res, 'Project not found.', 404);
      return;
    }

    sendSuccess(res, 'Project retrieved successfully.', project);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Create a new project
export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, status, deadline, budget, clientId } = req.body;

    // Verify the client belongs to the authenticated user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: req.user?.id,
      },
    });

    if (!client) {
      sendError(res, 'Client not found.', 404);
      return;
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        status,
        deadline: deadline ? new Date(deadline) : null,
        budget,
        clientId,
        userId: req.user?.id as string,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
      },
    });

    sendSuccess(res, 'Project created successfully.', project, 201);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Update a project
export const updateProject = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, status, deadline, budget } = req.body;

    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
    });

    if (!existingProject) {
      sendError(res, 'Project not found.', 404);
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        status,
        deadline: deadline ? new Date(deadline) : null,
        budget,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
      },
    });

    sendSuccess(res, 'Project updated successfully.', project);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Delete a project
export const deleteProject = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user?.id,
      },
    });

    if (!existingProject) {
      sendError(res, 'Project not found.', 404);
      return;
    }

    await prisma.project.delete({
      where: { id },
    });

    sendSuccess(res, 'Project deleted successfully.');
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};
