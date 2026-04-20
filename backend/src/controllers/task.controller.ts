import { Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

// Get all tasks for a project
export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;

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

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, 'Tasks retrieved successfully.', tasks);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Create a new task
export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const { title, status, dueDate } = req.body;

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

    const task = await prisma.task.create({
      data: {
        title,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
      },
    });

    sendSuccess(res, 'Task created successfully.', task, 201);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Update a task
export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, status, dueDate } = req.body;

    // Verify task belongs to authenticated user through project
    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: req.user?.id,
        },
      },
    });

    if (!task) {
      sendError(res, 'Task not found.', 404);
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    sendSuccess(res, 'Task updated successfully.', updatedTask);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Delete a task
export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Verify task belongs to authenticated user through project
    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: req.user?.id,
        },
      },
    });

    if (!task) {
      sendError(res, 'Task not found.', 404);
      return;
    }

    await prisma.task.delete({
      where: { id },
    });

    sendSuccess(res, 'Task deleted successfully.');
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};
