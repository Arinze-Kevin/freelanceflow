import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  Building2,
} from 'lucide-react';
import { projectService } from '../services/project.service';
import { taskService } from '../services/task.service';
import { timeEntryService } from '../services/timeEntry.service';
import type { Task, TaskStatus, TimeEntry, CreateTaskData, CreateTimeEntryData } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const taskColumns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TODO', label: 'To Do', color: 'bg-gray-100' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100' },
  { id: 'DONE', label: 'Done', color: 'bg-green-100' },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    IN_REVIEW: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    ON_HOLD: 'bg-gray-100 text-gray-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [newTask, setNewTask] = useState<CreateTaskData>({
    title: '',
    status: 'TODO',
  });
  const [newTimeEntry, setNewTimeEntry] = useState<CreateTimeEntryData>({
    description: '',
    hours: 0,
    date: new Date().toISOString().split('T')[0],
  });

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectService.getById(id as string),
  });

  const { data: tasksData = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskService.getAll(id as string),
  });

  const { data: timeData, isLoading: timeLoading } = useQuery({
    queryKey: ['timeEntries', id],
    queryFn: () => timeEntryService.getAll(id as string),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) =>
      taskService.create(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      setShowTaskForm(false);
      setNewTask({ title: '', status: 'TODO' });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<CreateTaskData> }) =>
      taskService.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: (data: CreateTimeEntryData) =>
      timeEntryService.create(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', id] });
      setShowTimeForm(false);
      setNewTimeEntry({
        description: '',
        hours: 0,
        date: new Date().toISOString().split('T')[0],
      });
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: timeEntryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', id] });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(newTask);
  };

  const handleCreateTimeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    createTimeEntryMutation.mutate(newTimeEntry);
  };

  const handleMoveTask = (task: Task, newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { status: newStatus },
    });
  };

  const tasks: Task[] = Array.isArray(tasksData) ? tasksData : [];
  const timeEntries: TimeEntry[] = timeData?.timeEntries ?? [];
  const totalHours = timeData?.totalHours ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-500">Project not found.</p>
        <Button onClick={() => navigate('/projects')} variant="secondary">
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project.title}
              </h1>
              {project.client && (
                <Link
                  to={`/clients/${project.client.id}`}
                  className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 mt-1"
                >
                  <Building2 className="w-4 h-4" />
                  {project.client.name}
                  {project.client.companyName
                    ? ` • ${project.client.companyName}`
                    : ''}
                </Link>
              )}
            </div>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(project.status)}`}
            >
              {project.status.replace('_', ' ')}
            </span>
          </div>

          {project.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3">
            {project.deadline && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  Due{' '}
                  {new Date(project.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
            {project.budget && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <DollarSign className="w-4 h-4" />
                <span>${project.budget.toLocaleString()} budget</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{totalHours} hours logged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          <Button size="sm" onClick={() => setShowTaskForm(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Task
          </Button>
        </div>

        {/* Add task form */}
        {showTaskForm && (
          <Card className="mb-4">
            <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
              <input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="flex gap-3">
                <select
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      status: e.target.value as TaskStatus,
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                <input
                  type="date"
                  value={newTask.dueDate || ''}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowTaskForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={createTaskMutation.isPending}
                >
                  Add Task
                </Button>
              </div>
            </form>
          </Card>
        )}

        {tasksLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {taskColumns.map((column) => {
              const columnTasks = tasks.filter(
                (t: Task) => t.status === column.id,
              );
              return (
                <div key={column.id} className="flex flex-col gap-3">
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${column.color}`}
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {column.label}
                    </span>
                    <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-full text-gray-600">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 min-h-24">
                    {columnTasks.map((task: Task) => (
                      <div
                        key={task.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                      >
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 mb-2">
                            Due{' '}
                            {new Date(task.dueDate).toLocaleDateString(
                              'en-US',
                              { month: 'short', day: 'numeric' },
                            )}
                          </p>
                        )}
                        <div className="flex items-center gap-1 flex-wrap">
                          {taskColumns
                            .filter((col) => col.id !== task.status)
                            .map((col) => (
                              <button
                                key={col.id}
                                onClick={() =>
                                  handleMoveTask(task, col.id)
                                }
                                className="text-xs text-violet-600 hover:text-violet-800 cursor-pointer underline"
                              >
                                Move to {col.label}
                              </button>
                            ))}
                          <button
                            onClick={() =>
                              deleteTaskMutation.mutate(task.id)
                            }
                            className="ml-auto text-red-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center">
                        <p className="text-xs text-gray-400">No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Time Entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Time Entries
            </h2>
            <p className="text-sm text-gray-500">
              Total: {totalHours} hours logged
            </p>
          </div>
          <Button size="sm" onClick={() => setShowTimeForm(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Log Time
          </Button>
        </div>

        {showTimeForm && (
          <Card className="mb-4">
            <form
              onSubmit={handleCreateTimeEntry}
              className="flex flex-col gap-3"
            >
              <input
                placeholder="What did you work on?"
                value={newTimeEntry.description}
                onChange={(e) =>
                  setNewTimeEntry((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Hours"
                  step="0.5"
                  min="0.5"
                  value={newTimeEntry.hours || ''}
                  onChange={(e) =>
                    setNewTimeEntry((prev) => ({
                      ...prev,
                      hours: Number(e.target.value),
                    }))
                  }
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="date"
                  value={newTimeEntry.date}
                  onChange={(e) =>
                    setNewTimeEntry((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowTimeForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={createTimeEntryMutation.isPending}
                >
                  Log Time
                </Button>
              </div>
            </form>
          </Card>
        )}

        {timeLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : timeEntries.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Clock className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-500">No time entries yet</p>
            </div>
          </Card>
        ) : (
          <Card padding="none">
            <div className="divide-y divide-gray-50">
              {timeEntries.map((entry: TimeEntry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {entry.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {entry.hours}h
                    </span>
                    <button
                      onClick={() =>
                        deleteTimeEntryMutation.mutate(entry.id)
                      }
                      className="text-red-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;