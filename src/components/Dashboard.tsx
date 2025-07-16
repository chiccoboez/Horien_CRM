import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingCart, Euro, FileText, Calendar, CheckCircle, Clock, Eye, Plus, Trash2, Edit, AlertTriangle, Check, CheckSquare, Plane, MapPin, X, Save, Edit2 } from 'lucide-react';
import { Customer, Task, BusinessTrip, TodoItem } from '../types';

interface DashboardProps {
  customers: Customer[];
  globalTasks: Task[];
  businessTrips: BusinessTrip[];
  onGlobalTasksUpdate: (tasks: Task[]) => void;
  onBusinessTripsUpdate: (trips: BusinessTrip[]) => void;
  onCustomerUpdate?: (customer: Customer) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  customers, 
  globalTasks, 
  businessTrips,
  onGlobalTasksUpdate,
  onBusinessTripsUpdate,
  onCustomerUpdate 
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showAddGlobalTask, setShowAddGlobalTask] = useState(false);
  const [showAddBusinessTrip, setShowAddBusinessTrip] = useState(false);
  const [globalTaskForm, setGlobalTaskForm] = useState({
    title: '',
    description: '',
    registrationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date().toISOString().split('T')[0],
    urgent: false,
    veryUrgent: false,
    customerId: ''
  });
  const [businessTripForm, setBusinessTripForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    city: '',
    customersVisited: [] as string[],
    countriesVisited: [] as string[],
    details: '',
    todoList: [] as TodoItem[]
  });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<BusinessTrip | null>(null);

  // Get current month start and end dates
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Collect all offers from all customers (not marked as ordered)
  const allOffers = customers.flatMap(customer => 
    (customer.offers || [])
      .filter(offer => !offer.markedAsOrdered)
      .map(offer => ({
        ...offer,
        customerName: customer.name,
        customerId: customer.id
      }))
  );

  // Collect all orders from all customers (offers marked as ordered + actual orders)
  const allOrders = customers.flatMap(customer => {
    const orderedOffers = (customer.offers || [])
      .filter(offer => offer.markedAsOrdered)
      .map(offer => ({
        id: offer.id,
        date: offer.date,
        finalUser: offer.finalUser,
        projectName: offer.projectName,
        offerName: offer.offerName,
        amount: offer.amount,
        ocName: offer.ocName,
        paid: false,
        documents: offer.documents || [],
        customerName: customer.name,
        customerId: customer.id
      }));
    
    const actualOrders = (customer.orders || []).map(order => ({
      ...order,
      customerName: customer.name,
      customerId: customer.id
    }));
    
    return [...orderedOffers, ...actualOrders];
  });

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

  // Get last 10 offers
  const lastOffers = [...allOffers]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Get upcoming tasks (sorted by urgency first, then expiry date, not completed)
  const upcomingTasks = [...allTasks]
    .filter(task => !task.completed)
    .sort((a, b) => {
      // Very urgent tasks first
      if (a.veryUrgent !== b.veryUrgent) {
        return a.veryUrgent ? -1 : 1;
      }
      // Then urgent tasks
      if (a.urgent !== b.urgent) {
        return a.urgent ? -1 : 1;
      }
      // Then by expiry date
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    })
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

  // Get last 3 business trips
  const recentTrips = businessTrips
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 3);

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
        createdAt: new Date().toISOString(),
        urgent: globalTaskForm.urgent,
        veryUrgent: globalTaskForm.veryUrgent,
        customerId: globalTaskForm.customerId || undefined
      };

      if (globalTaskForm.customerId) {
        // Add task to specific customer
        if (onCustomerUpdate) {
          const customer = customers.find(c => c.id === globalTaskForm.customerId);
          if (customer) {
            const updatedTasks = [...(customer.tasks || []), newTask];
            onCustomerUpdate({ ...customer, tasks: updatedTasks });
          }
        }
      } else {
        // Add as global task
        onGlobalTasksUpdate([newTask, ...globalTasks]);
      }

      setGlobalTaskForm({
        title: '',
        description: '',
        registrationDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date().toISOString().split('T')[0],
        urgent: false,
        veryUrgent: false,
        customerId: ''
      });
      setShowAddGlobalTask(false);
    }
  };

  const handleAddBusinessTrip = () => {
    if (businessTripForm.startDate && businessTripForm.endDate) {
      const newTrip: BusinessTrip = {
        id: `trip-${Date.now()}`,
        startDate: businessTripForm.startDate,
        endDate: businessTripForm.endDate,
        city: businessTripForm.city,
        customersVisited: businessTripForm.customersVisited,
        countriesVisited: businessTripForm.countriesVisited,
        details: businessTripForm.details,
        todoList: businessTripForm.todoList,
        createdAt: new Date().toISOString()
      };
      onBusinessTripsUpdate([newTrip, ...businessTrips]);
      setBusinessTripForm({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        city: '',
        customersVisited: [],
        countriesVisited: [],
        details: '',
        todoList: []
      });
      setShowAddBusinessTrip(false);
    }
  };

  const handleEditTrip = (trip: BusinessTrip) => {
    setEditingTrip(trip);
    setBusinessTripForm({
      startDate: trip.startDate,
      endDate: trip.endDate,
      city: trip.city,
      customersVisited: trip.customersVisited,
      countriesVisited: trip.countriesVisited,
      details: trip.details,
      todoList: trip.todoList
    });
    setShowAddBusinessTrip(true);
  };

  const handleUpdateTrip = () => {
    if (editingTrip && businessTripForm.startDate && businessTripForm.endDate && businessTripForm.customersVisited.length > 0) {
      const updatedTrip: BusinessTrip = {
        ...editingTrip,
        startDate: businessTripForm.startDate,
        endDate: businessTripForm.endDate,
        city: businessTripForm.city,
        customersVisited: businessTripForm.customersVisited,
        countriesVisited: businessTripForm.countriesVisited,
        details: businessTripForm.details,
        todoList: businessTripForm.todoList
      };
      
      const updatedTrips = businessTrips.map(trip => 
        trip.id === editingTrip.id ? updatedTrip : trip
      );
      onBusinessTripsUpdate(updatedTrips);
      
      setBusinessTripForm({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        city: '',
        customersVisited: [],
        countriesVisited: [],
        details: '',
        todoList: []
      });
      setEditingTrip(null);
      setShowAddBusinessTrip(false);
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      onBusinessTripsUpdate(businessTrips.filter(trip => trip.id !== tripId));
    }
  };

  const handleAddCustomerToTrip = () => {
    setBusinessTripForm(prev => ({
      ...prev,
      customersVisited: [...prev.customersVisited, '']
    }));
  };

  const handleRemoveCustomerFromTrip = (index: number) => {
    setBusinessTripForm(prev => ({
      ...prev,
      customersVisited: prev.customersVisited.filter((_, i) => i !== index)
    }));
  };

  const handleCustomerChange = (index: number, value: string) => {
    setBusinessTripForm(prev => ({
      ...prev,
      customersVisited: prev.customersVisited.map((customer, i) => 
        i === index ? value : customer
      )
    }));
  };

  const handleAddCountryToTrip = () => {
    setBusinessTripForm(prev => ({
      ...prev,
      countriesVisited: [...prev.countriesVisited, '']
    }));
  };

  const handleRemoveCountryFromTrip = (index: number) => {
    setBusinessTripForm(prev => ({
      ...prev,
      countriesVisited: prev.countriesVisited.filter((_, i) => i !== index)
    }));
  };

  const handleCountryChange = (index: number, value: string) => {
    setBusinessTripForm(prev => ({
      ...prev,
      countriesVisited: prev.countriesVisited.map((country, i) => 
        i === index ? value : country
      )
    }));
  };

  const handleAddTodoItem = () => {
    setBusinessTripForm(prev => ({
      ...prev,
      todoList: [...prev.todoList, { id: `todo-${Date.now()}`, task: '', completed: false }]
    }));
  };

  const handleRemoveTodoItem = (index: number) => {
    setBusinessTripForm(prev => ({
      ...prev,
      todoList: prev.todoList.filter((_, i) => i !== index)
    }));
  };

  const handleTodoChange = (index: number, value: string) => {
    setBusinessTripForm(prev => ({
      ...prev,
      todoList: prev.todoList.map((todo, i) => 
        i === index ? { ...todo, task: value } : todo
      )
    }));
  };

  const handleCompleteTask = (taskId: string, customerId: string) => {
    if (customerId === 'global') {
      // Handle global tasks
      const updatedTasks = globalTasks.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      );
      onGlobalTasksUpdate(updatedTasks);
    } else {
      // Handle customer tasks
      if (onCustomerUpdate) {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          const updatedTasks = (customer.tasks || []).map(task =>
            task.id === taskId ? { ...task, completed: true } : task
          );
          onCustomerUpdate({ ...customer, tasks: updatedTasks });
        }
      }
    }
  };

  const handleMarkOfferAsOrdered = (offerId: string, customerId: string) => {
    if (onCustomerUpdate) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        const updatedOffers = (customer.offers || []).map(offer =>
          offer.id === offerId ? { ...offer, markedAsOrdered: true } : offer
        );
        onCustomerUpdate({ ...customer, offers: updatedOffers });
      }
    }
  };

  // Get unique countries from customers
  const uniqueCountries = Array.from(
    new Set(
      customers
        .map(customer => customer.address.country)
        .filter(country => country && country.trim() !== '')
    )
  ).sort();

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
            <div className="p-2 bg-slate-100 rounded-lg">
              <FileText className="h-6 w-6 text-slate-600" />
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
            <h