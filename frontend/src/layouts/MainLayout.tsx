import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/auth.service";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Moved outside MainLayout to avoid recreation on every render
interface SidebarContentProps {
  user: { name?: string; email?: string } | null;
  onLogout: () => void;
  onNavClick: () => void;
}

const SidebarContent = ({
  user,
  onLogout,
  onNavClick,
}: SidebarContentProps) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
        <ChevronRight className="w-5 h-25 text-white" />
      </div>
      <span className="text-lg font-bold text-gray-900">FreelanceFlow</span>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={onNavClick}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-violet-50 text-violet-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            )
          }
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {item.name}
        </NavLink>
      ))}
    </nav>

    {/* User section */}
    <div className="px-4 py-4 border-t border-gray-100">
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-violet-700">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
        Sign out
      </button>
    </div>
  </div>
);

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarContent
          user={user}
          onLogout={handleLogout}
          onNavClick={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Sidebar - mobile */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent
          user={user}
          onLogout={handleLogout}
          onNavClick={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-violet-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.name}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={clsx(
              "lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer",
              sidebarOpen ? "block" : "hidden",
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
