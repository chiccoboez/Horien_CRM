import React, { useState } from 'react';
import { Plane, MapPin, Users, Calendar, Search, Filter, Eye, Edit2, Trash2, Plus } from 'lucide-react';
import { BusinessTrip, Customer } from '../types';

interface TripsManagementProps {
  businessTrips: BusinessTrip[];
  customers: Customer[];
  onBusinessTripsUpdate: (trips: BusinessTrip[]) => void;
}

export const TripsManagement: React.FC<TripsManagementProps> = ({
  businessTrips,
  customers,
  onBusinessTripsUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  // Get unique countries from trips
  const uniqueCountries = Array.from(
    new Set(businessTrips.flatMap(trip => trip.countriesVisited))
  ).sort();

  // Filter trips
  const filteredTrips = businessTrips.filter(trip => {
    const matchesSearch = trip.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.countriesVisited.some(country => 
                           country.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesCountry = filterCountry === 'all' || 
                          trip.countriesVisited.includes(filterCountry);
    
    const matchesCustomer = filterCustomer === 'all' || 
                           trip.customersVisited.includes(filterCustomer);
    
    const matchesDateFrom = !filterDateFrom || 
                           new Date(trip.startDate) >= new Date(filterDateFrom);
    
    const matchesDateTo = !filterDateTo || 
                         new Date(trip.endDate) <= new Date(filterDateTo);
    
    return matchesSearch && matchesCountry && matchesCustomer && matchesDateFrom && matchesDateTo;
  });

  // Sort trips by start date (newest first)
  const sortedTrips = [...filteredTrips].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const handleDeleteTrip = (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      onBusinessTripsUpdate(businessTrips.filter(trip => trip.id !== tripId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Business Trips</h2>
            <p className="mt-1 text-slate-600">Manage your business travel and customer visits</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          
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
          
          <select
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
          
          <div className="flex space-x-2">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="From"
            />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {sortedTrips.length === 0 ? (
          <div className="text-center py-12">
            <Plane className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No trips found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm || filterCountry !== 'all' || filterCustomer !== 'all' || filterDateFrom || filterDateTo
                ? 'Try adjusting your search criteria.'
                : 'No business trips have been added yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {sortedTrips.map((trip) => (
              <div key={trip.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Plane className="h-6 w-6 text-emerald-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {trip.city ? `${trip.city}, ` : ''}{trip.countriesVisited.join(', ')}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(trip.startDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })} - {new Date(trip.endDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{trip.customersVisited.length} customers</span>
                        </div>
                        <span>{trip.todoList.length} tasks</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {expandedTrip === trip.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Customers Visited</h4>
                        <div className="space-y-1">
                          {trip.customersVisited.map(customerId => {
                            const customer = customers.find(c => c.id === customerId);
                            return (
                              <div key={customerId} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="text-sm text-slate-700">
                                  {customer?.name || 'Unknown'} ({customer?.type})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">To-Do List</h4>
                        {trip.todoList.length === 0 ? (
                          <p className="text-sm text-slate-500">No tasks added</p>
                        ) : (
                          <div className="space-y-1">
                            {trip.todoList.map((todo) => (
                              <div key={todo.id} className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  todo.completed ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}></span>
                                <span className={`text-sm ${
                                  todo.completed 
                                    ? 'line-through text-slate-500' 
                                    : 'text-slate-700'
                                }`}>
                                  {todo.task}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {trip.details && (
                      <div className="mt-4">
                        <h4 className="font-medium text-slate-900 mb-2">Details</h4>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                          {trip.details}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};