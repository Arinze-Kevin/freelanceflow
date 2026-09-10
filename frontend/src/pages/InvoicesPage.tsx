import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  DollarSign,
} from 'lucide-react';
import { invoiceService } from '../services/invoice.service';
import { projectService } from '../services/project.service';
import type { Invoice, CreateInvoiceData } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SENT: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

interface InvoiceFormProps {
  onClose: () => void;
  onSubmit: (data: CreateInvoiceData) => void;
  isLoading: boolean;
  projects: { id: string; title: string; client?: { name: string } }[];
}

const InvoiceForm = ({
  onClose,
  onSubmit,
  isLoading,
  projects,
}: InvoiceFormProps): React.ReactElement => {
  const [formData, setFormData] = useState<CreateInvoiceData>({
    projectId: '',
    dueDate: '',
    notes: '',
    taxRate: 0,
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'taxRate' ? Number(value) : value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const subtotal = formData.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const tax = subtotal * ((formData.taxRate ?? 0) / 100);
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Invoice
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Project
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                    {project.client ? ` (${project.client.name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Tax Rate (%)
            </label>
            <input
              type="number"
              name="taxRate"
              placeholder="0"
              min="0"
              max="100"
              value={formData.taxRate || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Line items */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Line Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-center">Unit Price</span>
                <span className="col-span-1" />
              </div>

              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, 'description', e.target.value)
                    }
                    required
                    className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="number"
                    placeholder="1"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, 'quantity', Number(e.target.value))
                    }
                    required
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-center"
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(index, 'unitPrice', Number(e.target.value))
                    }
                    required
                    className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                    className="col-span-1 flex justify-center text-red-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals preview */}
          <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax ({formData.taxRate ?? 0}%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              placeholder="Payment terms, thank you message, etc."
              value={formData.notes}
              onChange={handleChange}
              rows={2}
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
            <Button type="submit" fullWidth isLoading={isLoading}>
              Create Invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InvoicesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoiceService.getAll,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: invoiceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredInvoices = invoices.filter(
    (inv: Invoice) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.project?.client?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      inv.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
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
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">
            {invoices.length}{' '}
            {invoices.length === 1 ? 'invoice' : 'invoices'} total
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by invoice number, project or client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Invoices list */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <FileText className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 font-medium">
              {searchQuery
                ? 'No invoices match your search'
                : 'No invoices yet'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowForm(true)} variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Create your first invoice
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-50">
            {filteredInvoices.map((invoice: Invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <Link
                  to={`/invoices/${invoice.id}`}
                  className="flex items-center gap-4 min-w-0 flex-1"
                >
                  <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {invoice.project?.title}
                      {invoice.project?.client
                        ? ` • ${invoice.project.client.name}`
                        : ''}
                    </p>
                    <p className="text-xs text-gray-400">
                      Due{' '}
                      {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-4 ml-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">
                      <DollarSign className="w-3.5 h-3.5 inline" />
                      {(invoice.total ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(invoice.status)}`}
                  >
                    {invoice.status}
                  </span>
                  <button
                    onClick={() => handleDelete(invoice.id)}
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

      {showForm && (
        <InvoiceForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
          projects={projects}
        />
      )}
    </div>
  );
};

export default InvoicesPage;