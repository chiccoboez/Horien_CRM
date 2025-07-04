import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingCart, Euro, FileText, Calendar, CheckCircle, Clock, Eye, Plus, Trash2, Edit } from 'lucide-react';
import { Customer, Task } from '../types';

interface DashboardProps {
  customers: Customer[];
  globalTasks: Task[];
  onGlobalTasksUpdate: (tasks: Task[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ customers, globalTasks, onGlobalTasksUpdate }) => {
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showAddGlobalTask, setShowAddGlobalTask] = useState(false);
  const [globalTaskForm, setGlobalTaskForm] = useState({
    title: '',
    description: '',
    registrationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date().toISOString().split('T')[0]
  });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);

  // Get current month start and end dates
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Collect all orders from all customers
  const allOrders = customers.flatMap(customer => 
    (customer.orders || []).map(order => ({
      ...order,
      customerName: customer.name,
      customerId: customer.id
    }))
  );

  // Collect all tasks from all customers
  const allCustomerTasks = customers.flatMap(customer => 
    (customer.tasks || []).map(task => ({
      ...task,
      customerName: customer.name,
      customerId: customer.id
    }))
  );

  // Combine global tasks and customer tasks
  const allTasks = [
    ...globalTasks.map(task => ({ ...task, customerName: 'General', customerId: 'global' })),
    ...allCustomerTasks
  ];

  // Get last 10 orders
  const lastOrders = [...allOrders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Collect all offers (using offerName from orders as offers)
  const allOffers = allOrders.filter(order => order.offerName).map(order => ({
    id: order.id,
    date: order.date,
    customerName: order.customerName,
    customerId: order.customerId,
    offerName: order.offerName,
    projectName: order.projectName,
    amount: order.amount,
    accepted: order.paid, // Using paid status as accepted status for offers
    finalUser: order.finalUser,
    ocName: order.ocName
  }));

  // Get last 10 offers
  const lastOffers = [...allOffers]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Get upcoming tasks (sorted by expiry date, not completed)
  const upcomingTasks = [...allTasks]
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 10);

  // Calculate monthly metrics
  const offersThisMonth = allOffers.filter(offer => {
    const offerDate = new Date(offer.date);
    return offerDate >= currentMonthStart && offerDate <= currentMonthEnd;
  }).length;

  const ordersThisMonth = allOrders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= currentMonthStart && orderDate <= currentMonthEnd;
  });

  const orderAmountThisMonth = ordersThisMonth.reduce((sum, order) => sum + order.amount, 0);

  // Filter orders based on payment status
  const filteredOrders = lastOrders.filter(order => {
    if (filterPaid === 'paid') return order.paid;
    if (filterPaid === 'unpaid') return !order.paid;
    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'customer':
        comparison = a.customerName.localeCompare(b.customerName);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Calculate totals for displayed orders
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.amount, 0);

  const handleSort = (column: 'date' | 'amount' | 'customer') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const isTaskOverdue = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const handleAddGlobalTask = () => {
    if (globalTaskForm.title.trim() && globalTaskForm.description.trim()) {
      const newTask: Task = {
        id: `global-${Date.now()}`,
        title: globalTaskForm.title,
        description: globalTaskForm.description,
        registrationDate: globalTaskForm.registrationDate,
        expiryDate: globalTaskForm.expiryDate,
        completed: false,
        createdAt: new Date().toISOString()
      };
      onGlobalTasksUpdate([newTask, ...globalTasks]);
      setGlobalTaskForm({
        title: '',
        description: '',
        registrationDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date().toISOString().split('T')[0]
      });
      setShowAddGlobalTask(false);
    }
  };

  const handleDeleteTask = (taskId: string, isGlobal: boolean) => {
    if (isGlobal) {
      onGlobalTasksUpdate(globalTasks.filter(task => task.id !== taskId));
    }
    // For customer tasks, we would need to update the specific customer
    // This would require additional props and handlers
  };

  const handleDeleteAllTasks = () => {
    if (window.confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
      onGlobalTasksUpdate([]);
      // Note: This only deletes global tasks. Customer tasks would need additional handling
      alert('All global tasks have been deleted. Customer-specific tasks remain unchanged.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-slate-600">Overview of tasks, offers, orders and business metrics</p>
      </div>

      {/* Monthly Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Offers This Month</p>
              <p className="text-2xl font-bold text-slate-900">{offersThisMonth}</p>
              <p className="text-xs text-slate-500 flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{currentMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Euro className="h-6 w-6 text-slate-800" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Orders Amount This Month</p>
              <p className="text-2xl font-bold text-slate-900">€{orderAmountThisMonth.toLocaleString()}</p>
              <p className="text-xs text-slate-500 flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{ordersThisMonth.length} orders</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Tasks</h3>
            </div>
            <div className="flex items-center space-x-3">
              {upcomingTasks.length > 0 && (
                <button
                  onClick={handleDeleteAllTasks}
                  className="inline-flex items-center space-x-2 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete All</span>
                </button>
              )}
              <button
                onClick={() => setShowAddGlobalTask(true)}
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>

        {showAddGlobalTask && (
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h4 className="font-medium text-slate-900 mb-3">Add New Task</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task title *"
                value={globalTaskForm.title}
                onChange={(e) => setGlobalTaskForm({ ...globalTaskForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registration Date</label>
                  <input
                    type="date"
                    value={globalTaskForm.registrationDate}
                    onChange={(e) => setGlobalTaskForm({ ...globalTaskForm, registrationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={globalTaskForm.expiryDate}
                    onChange={(e) => setGlobalTaskForm({ ...globalTaskForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <textarea
                placeholder="Task description *"
                value={globalTaskForm.description}
                onChange={(e) => setGlobalTaskForm({ ...globalTaskForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleAddGlobalTask}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowAddGlobalTask(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Expiry Date</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Title</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Customer</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {upcomingTasks.map((task) => (
                <React.Fragment key={`${task.customerId}-${task.id}`}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-900">{new Date(task.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{task.title}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{task.customerName}</div>
                    </td>
                    <td className="py-4 px-6">
                      {isTaskOverdue(task.expiryDate) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedTask(expandedTask === `${task.customerId}-${task.id}` ? null : `${task.customerId}-${task.id}`)}
                          className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{expandedTask === `${task.customerId}-${task.id}` ? 'Hide' : 'View'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id, task.customerId === 'global')}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedTask === `${task.customerId}-${task.id}` && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-slate-50">
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-slate-700">Description:</span>
                            <p className="text-sm text-slate-900 mt-1">{task.description}</p>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <span>Registered: {new Date(task.registrationDate).toLocaleDateString()}</span>
                            <span>Due: {new Date(task.expiryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {upcomingTasks.length === 0 && !showAddGlobalTask && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No pending tasks</h3>
            <p className="mt-1 text-sm text-slate-500">All tasks are completed or no tasks have been created yet.</p>
          </div>
        )}
      </div>

      {/* Last Offers Table */}
      {lastOffers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Last Offers</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-slate-900">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-900">Customer</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-900">Offer Name</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-900">Project</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-900">Amount</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-900">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lastOffers.map((offer) => (
                  <React.Fragment key={`${offer.customerId}-${offer.id}`}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-slate-900">
                        {new Date(offer.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{offer.customerName}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900">{offer.offerName}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-900">{offer.projectName}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900">
                          €{offer.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          offer.accepted 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {offer.accepted ? 'Accepted' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setExpandedOffer(expandedOffer === `${offer.customerId}-${offer.id}` ? null : `${offer.customerId}-${offer.id}`)}
                          className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{expandedOffer === `${offer.customerId}-${offer.id}` ? 'Hide' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                    {expandedOffer === `${offer.customerId}-${offer.id}` && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-slate-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-slate-700">Final User:</span>
                              <p className="text-sm text-slate-900">{offer.finalUser}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-slate-700">OC Name:</span>
                              <p className="text-sm text-slate-900">{offer.ocName}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Last Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <Edit className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Last Orders</h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filterPaid}
                onChange={(e) => setFilterPaid(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                <option value="all">All Orders</option>
                <option value="paid">Paid Only</option>
                <option value="unpaid">Unpaid Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th 
                  className="text-left py-3 px-6 font-medium text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {sortBy === 'date' && (
                      <span className="text-emerald-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-6 font-medium text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Customer</span>
                    {sortBy === 'customer' && (
                      <span className="text-emerald-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Project</th>
                <th 
                  className="text-left py-3 px-6 font-medium text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount</span>
                    {sortBy === 'amount' && (
                      <span className="text-emerald-600">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Paid</th>
                <th className="text-left py-3 px-6 font-medium text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedOrders.map((order) => (
                <React.Fragment key={`${order.customerId}-${order.id}`}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-slate-900">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="text-sm text-slate-500">{order.finalUser}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{order.projectName}</div>
                      {order.offerName && (
                        <div className="text-sm text-slate-500">{order.offerName}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900">
                        €{order.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.paid 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paid ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === `${order.customerId}-${order.id}` ? null : `${order.customerId}-${order.id}`)}
                        className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>{expandedOrder === `${order.customerId}-${order.id}` ? 'Hide' : 'View'}</span>
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === `${order.customerId}-${order.id}` && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-slate-700">OC Name:</span>
                            <p className="text-sm text-slate-900">{order.ocName || '-'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-700">Documents:</span>
                            <p className="text-sm text-slate-900">{order.documents?.length || 0} files</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No orders found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {filterPaid !== 'all' ? 'Try adjusting your filter criteria.' : 'Orders will appear here once customers place them.'}
            </p>
          </div>
        )}

        {/* Total Amount Footer */}
        {sortedOrders.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Total Amount ({filteredOrders.length} orders):
              </span>
              <span className="text-lg font-bold text-slate-900">
                €{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};