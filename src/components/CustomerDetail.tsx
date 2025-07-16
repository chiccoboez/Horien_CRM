import React, { useState } from 'react';
import { ArrowLeft, Edit2, Save, X, Trash2, User, Building2, MapPin, CreditCard, Phone, Mail, Users, Euro } from 'lucide-react';
import { Customer, ProductFamily } from '../types';
import { ContactsSection } from './ContactsSection';
import { NotesSection } from './NotesSection';
import { OffersSection } from './OffersSection';
import { OrdersSection } from './OrdersSection';
import { DocumentsSection } from './DocumentsSection';
import { TasksSection } from './TasksSection';

interface CustomerDetailProps {
  customer: Customer;
  productFamilies: ProductFamily[];
  onBack: () => void;
  onUpdate: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  productFamilies,
  onBack,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Customer>(customer);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'contacts' | 'notes' | 'offers' | 'orders' | 'documents' | 'pricing' | 'tasks'>('info');
  const [isPricingEditable, setIsPricingEditable] = useState(false);
  const [editedPricing, setEditedPricing] = useState<{[productId: string]: {price: number, discountedPrice: number}}>({});

  const handleSave = () => {
    onUpdate(editedCustomer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCustomer(customer);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(customer.id);
    onBack();
  };

  const handleContactsUpdate = (contacts: any[]) => {
    setEditedCustomer({ ...editedCustomer, contacts });
    onUpdate({ ...editedCustomer, contacts });
  };

  const handleNotesUpdate = (notes: any[]) => {
    setEditedCustomer({ ...editedCustomer, notes });
    onUpdate({ ...editedCustomer, notes });
  };

  const handleOffersUpdate = (offers: any[]) => {
    setEditedCustomer({ ...editedCustomer, offers });
    onUpdate({ ...editedCustomer, offers });
  };

  const handleOrdersUpdate = (orders: any[]) => {
    setEditedCustomer({ ...editedCustomer, orders });
    onUpdate({ ...editedCustomer, orders });
  };

  const handleDocumentsUpdate = (documents: any[]) => {
    setEditedCustomer({ ...editedCustomer, documents });
    onUpdate({ ...editedCustomer, documents });
  };

  const handleTasksUpdate = (tasks: any[]) => {
    setEditedCustomer({ ...editedCustomer, tasks });
    onUpdate({ ...editedCustomer, tasks });
  };

  const handlePricingEdit = () => {
    const pricing: {[productId: string]: {price: number, discountedPrice: number}} = {};
    
    productFamilies.forEach(family => {
      family.products.forEach(product => {
        const customerPrice = product.customerPrices.find(cp => cp.customerId === customer.id);
        if (customerPrice) {
          pricing[product.id] = {
            price: customerPrice.price,
            discountedPrice: customerPrice.discountedPrice || customerPrice.price
          };
        }
      });
    });
    
    setEditedPricing(pricing);
    setIsPricingEditable(true);
  };

  const handlePricingSave = () => {
    setIsPricingEditable(false);
    alert('Pricing updates would be saved to the database');
  };

  const handlePricingCancel = () => {
    setEditedPricing({});
    setIsPricingEditable(false);
  };

  const getCustomerPricing = () => {
        paid: false,
    
    productFamilies.forEach(family => {
      const familyPricing = family.products
        .map(product => {
          const customerPrice = product.customerPrices.find(cp => cp.customerId === customer.id);
          if (!customerPrice) return null;
        })),
        customerId: editedCustomer.id
          const currentPricing = editedPricing[product.id];
          return {
            ...product,
            customerPrice: currentPricing ? currentPricing.price : customerPrice.price,
            discountedPrice: currentPricing ? currentPricing.discountedPrice : (customerPrice.discountedPrice || customerPrice.price)
          };
        })
        .filter(Boolean);
      
      if (familyPricing.length > 0) {
        pricing[family.name] = familyPricing;
      }
    });
    
    return pricing;
  };

  const customerPricing = getCustomerPricing();

  const formatValue = (value: string | undefined | null) => {
    return value && value.trim() !== '' ? value : '-';
  };

  // Define tabs based on customer type
  const getTabsForCustomerType = () => {
    const baseTabs = [
      { id: 'info', label: 'Information' },
      { id: 'notes', label: 'Notes' },
      { id: 'documents', label: 'Documents' },
      { id: 'tasks', label: 'Tasks' }
    ];

    if (customer.type === 'Agent') {
      return baseTabs;
    }

    return [
      ...baseTabs.slice(0, 1), // Information
      { id: 'contacts', label: 'Contacts' },
      ...baseTabs.slice(1, 3), // Notes, Documents
      { id: 'offers', label: 'Offers' },
      { id: 'orders', label: 'Orders' },
      { id: 'pricing', label: 'Pricing' },
      { id: 'tasks', label: 'Tasks' }
    ];
  };

  const tabs = getTabsForCustomerType();

  const getCustomerIcon = () => {
    switch (customer.type) {
      case 'OEM':
        return <Building2 className="h-12 w-12 text-slate-600" />;
      case 'Agent':
        return <User className="h-12 w-12 text-slate-600" />;
      case 'Customer':
        return <Users className="h-12 w-12 text-slate-600" />;
      default:
        return <User className="h-12 w-12 text-slate-600" />;
    }
  };

  const getCustomerTypeColor = () => {
    switch (customer.type) {
      case 'OEM':
        return 'bg-slate-100 text-slate-800';
      case 'Agent':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Customers</span>
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            {getCustomerIcon()}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{customer.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCustomerTypeColor()}`}>
                  {customer.type}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  customer.status === 'Active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {customer.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Customer Type</label>
                    {isEditing ? (
                      <select
                        value={editedCustomer.type}
                        onChange={(e) => setEditedCustomer({...editedCustomer, type: e.target.value as 'Customer' | 'OEM' | 'Agent'})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="Customer">Customer</option>
                        <option value="OEM">OEM (Key Account)</option>
                        <option value="Agent">Agent</option>
                      </select>
                    ) : (
                      <p className="text-slate-900">{customer.type}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    {isEditing ? (
                      <select
                        value={editedCustomer.status}
                        onChange={(e) => setEditedCustomer({...editedCustomer, status: e.target.value as 'Active' | 'Prospect'})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Prospect">Prospect</option>
                      </select>
                    ) : (
                      <p className="text-slate-900">{customer.status}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedCustomer.email}
                        onChange={(e) => setEditedCustomer({...editedCustomer, email: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">{formatValue(customer.email)}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedCustomer.phone}
                        onChange={(e) => setEditedCustomer({...editedCustomer, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">{formatValue(customer.phone)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Address</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedCustomer.address.street}
                        onChange={(e) => setEditedCustomer({
                          ...editedCustomer,
                          address: {...editedCustomer.address, street: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">{formatValue(customer.address.street)}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedCustomer.address.city}
                        onChange={(e) => setEditedCustomer({
                          ...editedCustomer,
                          address: {...editedCustomer.address, city: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">{formatValue(customer.address.city)}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedCustomer.address.state}
                        onChange={(e) => setEditedCustomer({
                          ...editedCustomer,
                          address: {...editedCustomer.address, state: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">{formatValue(customer.address.state)}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedCustomer.address.zipCode}
                        onChange={(e) => setEditedCustomer({
                          ...editedCustomer,
                          address: {...editedCustomer.address, zipCode: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">{formatValue(customer.address.zipCode)}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                    {isEditing ? (
                      <select
                        value={editedCustomer.address.country}
                        onChange={(e) => setEditedCustomer({
                          ...editedCustomer,
                          address: {...editedCustomer.address, country: e.target.value as any}
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Select Country</option>
                        <option value="KSA">KSA</option>
                        <option value="Kuwait">Kuwait</option>
                        <option value="UAE">UAE</option>
                        <option value="Qatar">Qatar</option>
                        <option value="Iraq">Iraq</option>
                        <option value="Egypt">Egypt</option>
                      </select>
                    ) : (
                      <p className="text-slate-900">{formatValue(customer.address.country)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Payment Terms - Only for non-Agent customers */}
              {customer.type !== 'Agent' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Terms</span>
                  </h2>
                  
                  {isEditing ? (
                    <textarea
                      value={editedCustomer.paymentTerms}
                      onChange={(e) => setEditedCustomer({...editedCustomer, paymentTerms: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter payment terms..."
                    />
                  ) : (
                    <p className="text-slate-900">{formatValue(customer.paymentTerms)}</p>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Info</h2>
                
                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Customer Since</dt>
                    <dd className="text-sm text-slate-900">{new Date(customer.createdAt).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Last Contact</dt>
                    <dd className="text-sm text-slate-900">{new Date(customer.lastContact).toLocaleDateString()}</dd>
                  </div>
                  {customer.type !== 'Agent' && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">Total Offers</dt>
                        <dd className="text-sm text-slate-900">{customer.offers?.length || 0}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">Total Orders</dt>
                        <dd className="text-sm text-slate-900">{customer.orders?.length || 0}</dd>
                      </div>
                    </>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Documents</dt>
                    <dd className="text-sm text-slate-900">{customer.documents?.length || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Tasks</dt>
                    <dd className="text-sm text-slate-900">{customer.tasks?.length || 0}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && customer.type !== 'Agent' && (
          <ContactsSection
            contacts={customer.contacts || []}
            onContactsUpdate={handleContactsUpdate}
            isEditing={isEditing}
          />
        )}

        {activeTab === 'notes' && (
          <NotesSection
            notes={customer.notes || []}
            onNotesUpdate={handleNotesUpdate}
            isEditing={isEditing}
          />
        )}

        {activeTab === 'offers' && customer.type !== 'Agent' && (
          <OffersSection
            offers={customer.offers || []}
            onOffersUpdate={handleOffersUpdate}
            isEditing={isEditing}
          />
        )}

        {activeTab === 'orders' && customer.type !== 'Agent' && (
          <OrdersSection
            orders={customer.orders || []}
            onOrdersUpdate={handleOrdersUpdate}
            isEditing={isEditing}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsSection
            documents={customer.documents || []}
            onDocumentsUpdate={handleDocumentsUpdate}
            isEditing={isEditing}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksSection
            tasks={customer.tasks || []}
            onTasksUpdate={handleTasksUpdate}
            isEditing={isEditing}
          />
        )}

        {activeTab === 'pricing' && customer.type !== 'Agent' && Object.keys(customerPricing).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <div className="p-1 bg-slate-100 rounded">
                  <Euro className="h-4 w-4 text-slate-800" />
                </div>
                <span>Product Pricing</span>
              </h2>
              <div className="flex space-x-3">
                {isPricingEditable ? (
                  <>
                    <button
                      onClick={handlePricingCancel}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePricingSave}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handlePricingEdit}
                    className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Modify Prices</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              {Object.entries(customerPricing).map(([familyName, products]) => (
                <div key={familyName}>
                  <h3 className="text-md font-medium text-slate-900 mb-3">{familyName}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-2 px-4 font-medium text-slate-900">Product</th>
                          <th className="text-center py-2 px-4 font-medium text-slate-900" style={{width: '120px'}}>P/N</th>
                          <th className="text-center py-2 px-4 font-medium text-slate-900" style={{width: '120px'}}>Standard Price</th>
                          <th className="text-center py-2 px-4 font-medium text-slate-900" style={{width: '120px'}}>Discounted Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {products.map((product: any) => (
                          <tr key={product.id}>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-slate-900">{product.name}</div>
                                <div className="text-sm text-slate-500">{product.description}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center" style={{width: '120px'}}>
                              <span className="text-slate-900">{formatValue(product.sku)}</span>
                            </td>
                            <td className="py-3 px-4 text-center" style={{width: '120px'}}>
                              {isPricingEditable ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editedPricing[product.id]?.price || product.customerPrice}
                                  onChange={(e) => setEditedPricing({
                                    ...editedPricing,
                                    [product.id]: {
                                      ...editedPricing[product.id],
                                      price: Number(e.target.value),
                                      discountedPrice: editedPricing[product.id]?.discountedPrice || product.discountedPrice
                                    }
                                  })}
                                  className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center"
                                />
                              ) : (
                                <span className="font-medium text-slate-900">€{product.customerPrice.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center" style={{width: '120px'}}>
                              {isPricingEditable ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editedPricing[product.id]?.discountedPrice || product.discountedPrice}
                                  onChange={(e) => setEditedPricing({
                                    ...editedPricing,
                                    [product.id]: {
                                      ...editedPricing[product.id],
                                      price: editedPricing[product.id]?.price || product.customerPrice,
                                      discountedPrice: Number(e.target.value)
                                    }
                                  })}
                                  className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center"
                                />
                              ) : (
                                <span className="font-medium text-emerald-600">€{product.discountedPrice.toFixed(2)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && customer.type !== 'Agent' && Object.keys(customerPricing).length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="text-center py-8">
              <p className="text-slate-500">No pricing information available for this customer.</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Customer</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete {customer.name}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};