import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { CustomerDetail } from './components/CustomerDetail';
import { ProductManagement } from './components/ProductManagement';
import { SaudiRacks } from './components/SaudiRacks';
import { CertificationCalculator } from './components/CertificationCalculator';
import { ExcelUpload } from './components/ExcelUpload';
import { mockCustomers, mockProductFamilies } from './data/mockData';
import { Customer, ProductFamily, View, Task } from './types';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [productFamilies, setProductFamilies] = useState<ProductFamily[]>(mockProductFamilies);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [globalTasks, setGlobalTasks] = useState<Task[]>([
    {
      id: 'global-1',
      title: 'Review quarterly sales report',
      description: 'Analyze Q1 sales performance and prepare presentation for management',
      registrationDate: '2024-01-20',
      expiryDate: '2024-02-01',
      completed: false,
      createdAt: '2024-01-20T09:00:00Z'
    },
    {
      id: 'global-2',
      title: 'Update product catalog',
      description: 'Add new product specifications and pricing to the catalog',
      registrationDate: '2024-01-18',
      expiryDate: '2024-01-30',
      completed: false,
      createdAt: '2024-01-18T14:00:00Z'
    }
  ]);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setSelectedCustomer(null);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('customer-detail');
  };

  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setSelectedCustomer(updatedCustomer);
  };

  const handleCustomerDelete = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    setSelectedCustomer(null);
    setCurrentView('customers');
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    // Add default empty arrays for new fields
    const customerWithDefaults = {
      ...newCustomer,
      contacts: newCustomer.contacts || [],
      notes: newCustomer.notes || [],
      offers: newCustomer.offers || [],
      orders: newCustomer.orders || [],
      documents: newCustomer.documents || [],
      tasks: newCustomer.tasks || []
    };
    setCustomers(prev => [...prev, customerWithDefaults]);
  };

  const handleBackToCustomers = () => {
    setSelectedCustomer(null);
    setCurrentView('customers');
  };

  const handleImportData = () => {
    setShowExcelUpload(true);
  };

  const handleDataImport = (importedCustomers: Customer[], importedProductFamilies: ProductFamily[]) => {
    // Add default empty arrays for new fields
    const customersWithDefaults = importedCustomers.map(customer => ({
      ...customer,
      contacts: customer.contacts || [],
      notes: customer.notes || [],
      offers: customer.offers || [],
      orders: customer.orders || [],
      documents: customer.documents || [],
      tasks: customer.tasks || []
    }));

    setCustomers(customersWithDefaults);
    setProductFamilies(importedProductFamilies);
    setShowExcelUpload(false);
    
    // Show success message
    alert(`Successfully imported ${importedCustomers.length} customers and ${importedProductFamilies.length} product families!`);
  };

  const handleGlobalTasksUpdate = (tasks: Task[]) => {
    setGlobalTasks(tasks);
  };

  const handleProductFamiliesUpdate = (families: ProductFamily[]) => {
    setProductFamilies(families);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation currentView={currentView} onViewChange={handleViewChange} />
      
      <main>
        {currentView === 'dashboard' && (
          <Dashboard 
            customers={customers} 
            globalTasks={globalTasks}
            onGlobalTasksUpdate={handleGlobalTasksUpdate}
            onCustomerUpdate={handleCustomerUpdate}
          />
        )}
        
        {currentView === 'customers' && (
          <CustomerList
            customers={customers}
            onCustomerSelect={handleCustomerSelect}
            onAddCustomer={handleAddCustomer}
            onImportData={handleImportData}
          />
        )}
        
        {currentView === 'customer-detail' && selectedCustomer && (
          <CustomerDetail
            customer={selectedCustomer}
            productFamilies={productFamilies}
            onBack={handleBackToCustomers}
            onUpdate={handleCustomerUpdate}
            onDelete={handleCustomerDelete}
          />
        )}
        
        {currentView === 'products' && (
          <ProductManagement
            productFamilies={productFamilies}
            customers={customers}
            onProductFamiliesUpdate={handleProductFamiliesUpdate}
          />
        )}

        {currentView === 'saudi-racks' && (
          <SaudiRacks />
        )}

        {currentView === 'certification-calculator' && (
          <CertificationCalculator />
        )}
      </main>

      {showExcelUpload && (
        <ExcelUpload
          onDataImport={handleDataImport}
          onClose={() => setShowExcelUpload(false)}
        />
      )}
    </div>
  );
}

export default App;