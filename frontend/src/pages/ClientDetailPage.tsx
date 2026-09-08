import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  FolderKanban,
  Calendar,
} from 'lucide-react';
import { clientService } from '../services/client.service';
import type { Project } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: client, isLoading } = useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientService.getById(id as string),
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      IN_REVIEW: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
      ON_HOLD: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-500">Client not found.</p>
        <Button onClick={() => navigate('/clients')} variant="secondary">
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-violet-700">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            {client.companyName && (
              <p className="text-gray-500">{client.companyName}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client info */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{client.phone}</span>
              </div>
            )}
            {client.companyName && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{client.companyName}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{client.address}</span>
              </div>
            )}
            {client.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{client.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Projects */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                Projects
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({client.projects?.length ?? 0})
                </span>
              </h2>
              <Link to="/projects">
                <Button size="sm">
                  <FolderKanban className="w-4 h-4 mr-1.5" />
                  New Project
                </Button>
              </Link>
            </div>

            {!client.projects || client.projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <FolderKanban className="w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-500">No projects yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {client.projects.map((project: Project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {project.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {project.deadline && (
                          <>
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(project.deadline)}</span>
                          </>
                        )}
                        {project.budget && (
                          <>
                            <span>•</span>
                            <FileText className="w-3 h-3" />
                            <span>${project.budget.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;