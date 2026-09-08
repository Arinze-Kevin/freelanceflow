import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Building2, Mail, Phone, Trash2, Eye } from 'lucide-react';
import { clientService } from '../services/client.service';
import type { Client, CreateClientData } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

// Client form modal
interface ClientFormProps {
  onClose: () => void;
  onSubmit: (data: CreateClientData) => void;
  isLoading: boolean;
  initialData?: Partial<Client>;
}

const ClientForm = ({ onClose, onSubmit, isLoading, initialData }: ClientFormProps) => {
  const [formData, setFormData] = useState<CreateClientData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    companyName: initialData?.companyName || '',
    address: initialData?.address || '',
    notes: initialData?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <Input
            label="Full name"
            name="name"
            placeholder="John Smith"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone number"
            name="phone"
            placeholder="+1234567890"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Company name"
            name="companyName"
            placeholder="Smith Designs Ltd"
            value={formData.companyName}
            onChange={handleChange}
          />
          <Input
            label="Address"
            name="address"
            placeholder="123 Design Street, New York"
            value={formData.address}
            onChange={handleChange}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              placeholder="Any additional notes about this client"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              {initialData ? 'Save Changes' : 'Add Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main clients page
const ClientsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: clientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientData> }) =>
      clientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setEditingClient(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: clientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleCreate = (data: CreateClientData) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: CreateClientData) => {
    if (!editingClient) return;
    updateMutation.mutate({ id: editingClient.id, data });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client? This will also delete all their projects.')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredClients = clients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.companyName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">
            {clients.length} {clients.length === 1 ? 'client' : 'clients'} total
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients by name, email or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Clients grid */}
      {filteredClients.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Users className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 font-medium">
              {searchQuery ? 'No clients match your search' : 'No clients yet'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowForm(true)} variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add your first client
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client: Client) => (
            <Card key={client.id} padding="none">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-violet-700">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {client.name}
                      </p>
                      {client.companyName && (
                        <p className="text-xs text-gray-500 truncate">
                          {client.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-violet-50 text-violet-700 px-2 py-1 rounded-full flex-shrink-0">
                    {client._count?.projects ?? 0} projects
                  </span>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.companyName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{client.companyName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <Link
                  to={`/clients/${client.id}`}
                  className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setEditingClient(client)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                >
                  Edit
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create form modal */}
      {showForm && (
        <ClientForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Edit form modal */}
      {editingClient && (
        <ClientForm
          onClose={() => setEditingClient(null)}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
          initialData={editingClient}
        />
      )}
    </div>
  );
};

export default ClientsPage;