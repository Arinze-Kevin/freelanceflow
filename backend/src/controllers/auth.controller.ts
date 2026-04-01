import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils';
import { AuthenticatedRequest } from '../types';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      sendError(res, 'An account with this email already exists.', 409);
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' } as jwt.SignOptions,
    );

    sendSuccess(
      res,
      'Account created successfully.',
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      201,
    );
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' } as jwt.SignOptions,
    );

    sendSuccess(res, 'Login successful.', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Get current authenticated user
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }

    sendSuccess(res, 'User retrieved successfully.', user);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Update user profile
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user?.id },
      data: { name, avatar },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    sendSuccess(res, 'Profile updated successfully.', user);
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};

// Change password
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
    });

    if (!user) {
      sendError(res, 'User not found.', 404);
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      sendError(res, 'Current password is incorrect.', 401);
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user?.id },
      data: { password: hashedPassword },
    });

    sendSuccess(res, 'Password changed successfully.');
  } catch {
    sendError(res, 'Something went wrong. Please try again.', 500);
  }
};
