import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Send,
  Clock,
} from 'lucide-react';
import { invoiceService } from '../services/invoice.service';
import type { InvoiceStatus } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SENT: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoiceService.getById(id as string),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: InvoiceStatus) =>
      invoiceService.update(id as string, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-500">Invoice not found.</p>
        <Button onClick={() => navigate('/invoices')} variant="secondary">
          Back to Invoices
        </Button>
      </div>
    );
  }

  const subtotal = invoice.subtotal ?? 0;
  const tax = invoice.tax ?? 0;
  const total = invoice.total ?? 0;

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
        <div className="flex-1 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-gray-500 mt-1">
              {invoice.project?.title}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(invoice.status)}`}
            >
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Status actions */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-600">
            Update invoice status
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {invoice.status === 'DRAFT' && (
              <Button
                size="sm"
                onClick={() => updateStatusMutation.mutate('SENT')}
                isLoading={updateStatusMutation.isPending}
              >
                <Send className="w-4 h-4 mr-1.5" />
                Mark as Sent
              </Button>
            )}
            {invoice.status === 'SENT' && (
              <Button
                size="sm"
                onClick={() => updateStatusMutation.mutate('PAID')}
                isLoading={updateStatusMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Mark as Paid
              </Button>
            )}
            {invoice.status === 'SENT' && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => updateStatusMutation.mutate('OVERDUE')}
                isLoading={updateStatusMutation.isPending}
              >
                <Clock className="w-4 h-4 mr-1.5" />
                Mark as Overdue
              </Button>
            )}
            {(invoice.status === 'PAID' || invoice.status === 'OVERDUE') && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => updateStatusMutation.mutate('DRAFT')}
                isLoading={updateStatusMutation.isPending}
              >
                Reset to Draft
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Line items */}
          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Invoice Items</h2>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-center">Unit Price</span>
                <span className="col-span-2 text-right">Total</span>
              </div>
              {invoice.items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 text-sm"
                >
                  <span className="col-span-6 text-gray-900">
                    {item.description}
                  </span>
                  <span className="col-span-2 text-center text-gray-600">
                    {item.quantity}
                  </span>
                  <span className="col-span-2 text-center text-gray-600">
                    ${item.unitPrice.toLocaleString()}
                  </span>
                  <span className="col-span-2 text-right font-medium text-gray-900">
                    ${(item.quantity * item.unitPrice).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="flex flex-col gap-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax ({invoice.taxRate ?? 0}%)</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-4">
          {/* Invoice info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">
              Invoice Details
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Invoice Number
                </p>
                <p className="text-sm text-gray-900">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Due Date
                </p>
                <div className="flex items-center gap-1.5 text-sm text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Project
                </p>
                <p className="text-sm text-gray-900">
                  {invoice.project?.title}
                </p>
              </div>
            </div>
          </Card>

          {/* Client info */}
          {invoice.project?.client && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                Client Details
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{invoice.project.client.name}</span>
                </div>
                {invoice.project.client.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {invoice.project.client.email}
                    </span>
                  </div>
                )}
                {invoice.project.client.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{invoice.project.client.phone}</span>
                  </div>
                )}
                {invoice.project.client.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{invoice.project.client.address}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;