import { Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

// Get all time entries for a project
export const getTimeEntries = async (
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

    const timeEntries = await prisma.timeEntry.findMany({
      where: { projectId },
      orderBy: { date: 'desc' },
    });

    // Calculate total hours
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

    sendSuccess(res, 'Time entries retrieved successfully.', {
      timeEntries,
      totalHours,
    });
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Create a new time entry
export const createTimeEntry = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const projectId = req.params.projectId as string;
    const { description, hours, date } = req.body;

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

    const timeEntry = await prisma.timeEntry.create({
      data: {
        description,
        hours,
        date: date ? new Date(date) : new Date(),
        projectId,
      },
    });

    sendSuccess(res, 'Time entry created successfully.', timeEntry, 201);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Update a time entry
export const updateTimeEntry = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { description, hours, date } = req.body;

    // Verify time entry belongs to authenticated user through project
    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        project: {
          userId: req.user?.id,
        },
      },
    });

    if (!timeEntry) {
      sendError(res, 'Time entry not found.', 404);
      return;
    }

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        description,
        hours,
        date: date ? new Date(date) : undefined,
      },
    });

    sendSuccess(res, 'Time entry updated successfully.', updatedTimeEntry);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Delete a time entry
export const deleteTimeEntry = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Verify time entry belongs to authenticated user through project
    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        project: {
          userId: req.user?.id,
        },
      },
    });

    if (!timeEntry) {
      sendError(res, 'Time entry not found.', 404);
      return;
    }

    await prisma.timeEntry.delete({
      where: { id },
    });

    sendSuccess(res, 'Time entry deleted successfully.');
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};
