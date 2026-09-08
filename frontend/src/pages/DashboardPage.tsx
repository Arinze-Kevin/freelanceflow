import { useQuery } from "@tanstack/react-query";
import {
  Users,
  FolderKanban,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { projectService } from "../services/project.service";
import { clientService } from "../services/client.service";
import { invoiceService } from "../services/invoice.service";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import type { Project, Invoice } from "../types";

const DashboardPage = () => {
  const { user } = useAuthStore();

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getAll,
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: clientService.getAll,
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceService.getAll,
  });

  const isLoading = projectsLoading || clientsLoading || invoicesLoading;

  // Calculate stats
  const activeProjects = projects.filter(
    (p: Project) => p.status === "ACTIVE",
  ).length;

  const unpaidInvoices = invoices.filter(
    (i: Invoice) => i.status === "SENT" || i.status === "OVERDUE",
  );

  const totalOutstanding = unpaidInvoices.reduce(
    (sum: number, inv: Invoice) => sum + (inv.total ?? 0),
    0,
  );

  const upcomingDeadlines = projects
    .filter((p: Project) => p.deadline && p.status === "ACTIVE")
    .sort(
      (a: Project, b: Project) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    )
    .slice(0, 3);

  const recentProjects = [...projects]
    .sort(
      (a: Project, b: Project) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      name: "Total Clients",
      value: clients.length,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      href: "/clients",
    },
    {
      name: "Active Projects",
      value: activeProjects,
      icon: FolderKanban,
      color: "bg-violet-50 text-violet-600",
      href: "/projects",
    },
    {
      name: "Unpaid Invoices",
      value: unpaidInvoices.length,
      icon: FileText,
      color: "bg-orange-50 text-orange-600",
      href: "/invoices",
    },
    {
      name: "Outstanding",
      value: `$${totalOutstanding.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      href: "/invoices",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      IN_REVIEW: "bg-yellow-100 text-yellow-700",
      COMPLETED: "bg-blue-100 text-blue-700",
      ON_HOLD: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-violet-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here is what is happening with your business today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <FolderKanban className="w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-500">No projects yet</p>
                <Link
                  to="/projects"
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                >
                  Create your first project
                </Link>
              </div>
            ) : (
              recentProjects.map((project: Project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {project.client?.name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${getStatusColor(project.status)}`}
                  >
                    {project.status.replace("_", " ")}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Upcoming Deadlines</h2>
            <Link
              to="/projects"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingDeadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Clock className="w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-500">No upcoming deadlines</p>
              </div>
            ) : (
              upcomingDeadlines.map((project: Project) => {
                const daysUntil = getDaysUntil(project.deadline!);
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {project.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(project.deadline!)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${
                        daysUntil < 0
                          ? "bg-red-100 text-red-700"
                          : daysUntil <= 7
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {daysUntil < 0
                        ? `${Math.abs(daysUntil)}d overdue`
                        : daysUntil === 0
                          ? "Due today"
                          : `${daysUntil}d left`}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Unpaid invoices */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Unpaid Invoices</h2>
            <Link
              to="/invoices"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {unpaidInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <AlertCircle className="w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-500">No unpaid invoices</p>
              </div>
            ) : (
              unpaidInvoices.map((invoice: Invoice) => (
                <Link
                  key={invoice.id}
                  to={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        invoice.status === "OVERDUE"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {invoice.status}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${(invoice.total ?? 0).toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
