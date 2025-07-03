import React, { useState } from 'react';
import { Search, Plus, User, Building2, Eye, Upload, Users, UserCheck, HardHat, Glasses } from 'lucide-react';
import { Customer } from '../types';
import { AddCustomerModal } from './AddCustomerModal';

interface CustomerListProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
  onAddCustomer: (customer: Customer) => void;
  onImportData: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onCustomerSelect,
  onAddCustomer,
  onImportData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Customer' | 'OEM' | 'Agent'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Prospect'>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Get unique countries from customer addresses
  const uniqueCountries = Array.from(
    new Set(
      customers
        .map(customer => customer.address.country)
        .filter(country => country && country.trim() !== '')
    )
  ).sort();

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || customer.type === filterType;
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    const matchesCountry = filterCountry === 'all' || customer.address.country === filterCountry;
    
    return matchesSearch && matchesType && matchesStatus && matchesCountry;
  });

  const getCustomerIcon = (type: string) => {
    switch (type) {
      case 'OEM':
        return <Building2 className="h-8 w-8 text-slate-600" />;
      case 'Agent':
        return <User className="h-8 w-8 text-slate-600" />;
      case 'Customer':
        return (
          <div className="flex items-center space-x-1">
            <UserCheck className="h-6 w-6 text-slate-600" />
            <HardHat className="h-6 w-6 text-slate-600" />
            <Glasses className="h-6 w-6 text-slate-600" />
          </div>
        );
      default:
        return <User className="h-8 w-8 text-slate-600" />;
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'OEM':
        return 'bg-slate-100 text-slate-800';
      case 'Agent':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleAddCustomer = (customer: Customer) => {
    onAddCustomer(customer);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Customers</h2>
            <p className="mt-1 text-slate-600">Manage your customer relationships</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={onImportData}
              className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Upload className="h-5 w-5" />
              <span>Import Excel</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Customer">Customer</option>
                <option value="OEM">OEM</option>
                <option value="Agent">Agent</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Prospect">Prospect</option>
              </select>

              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Countries</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Customer</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Type</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Contact</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Country</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Last Contact</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getCustomerIcon(customer.type)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{customer.name}</div>
                        <div className="text-slate-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerTypeColor(customer.type)}`}>
                      {customer.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-slate-900">{customer.phone}</div>
                    <div className="text-slate-500">{customer.address.city}, {customer.address.state}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-900">{customer.address.country || '-'}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-500">
                    {new Date(customer.lastContact).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => onCustomerSelect(customer)}
                      className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No customers found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by importing an Excel file or adding a new customer.'}
            </p>
            {!searchTerm && customers.length === 0 && (
              <div className="mt-4 flex justify-center space-x-3">
                <button
                  onClick={onImportData}
                  className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span>Import Excel File</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Customer</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCustomer}
        />
      )}
    </div>
  );
};