import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';

//Import client routes
import clientRoutes from './routes/client.routes';

//Import project routes
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import timeEntryRoutes from './routes/timeEntry.routes';
import invoiceRoutes from './routes/invoice.routes';

// Initialize express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', timeEntryRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'FreelanceFlow API is running',
    version: '1.0.0',
    status: 'healthy',
  });
});

// Handle 404 routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
