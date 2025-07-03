import React, { useState } from 'react';
import { Package, DollarSign, Edit2, Save, X } from 'lucide-react';
import { ProductFamily, Customer } from '../types';

interface ProductManagementProps {
  productFamilies: ProductFamily[];
  customers: Customer[];
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  productFamilies,
  customers
}) => {
  const [selectedFamily, setSelectedFamily] = useState<string>(productFamilies[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProducts, setEditedProducts] = useState<{[productId: string]: {name: string, description: string, sku: string}}>({});
  
  const currentFamily = productFamilies.find(f => f.id === selectedFamily);

  const getProductStats = (productId: string) => {
    const product = currentFamily?.products.find(p => p.id === productId);
    if (!product) return { avgPrice: 0 };

    const customerCount = product.customerPrices.length;
    const avgPrice = customerCount > 0 
      ? product.customerPrices.reduce((sum, cp) => sum + cp.price, 0) / customerCount
      : 0;

    return { avgPrice };
  };

  const handleEditStart = () => {
    if (!currentFamily) return;
    
    const productEdits: {[productId: string]: {name: string, description: string, sku: string}} = {};
    currentFamily.products.forEach(product => {
      productEdits[product.id] = {
        name: product.name,
        description: product.description,
        sku: product.sku
      };
    });
    setEditedProducts(productEdits);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditedProducts({});
    setIsEditing(false);
  };

  const handleEditSave = () => {
    // In a real application, this would save to the database
    alert('Product changes would be saved to the database');
    setIsEditing(false);
    setEditedProducts({});
  };

  const handleProductChange = (productId: string, field: 'name' | 'description' | 'sku', value: string) => {
    setEditedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const formatValue = (value: string | undefined | null) => {
    return value && value.trim() !== '' ? value : '-';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Product Management</h2>
            <p className="mt-1 text-slate-600">Manage product families and customer-specific pricing</p>
          </div>
          <div className="mt-4 sm:mt-0">
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleEditCancel}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleEditSave}
                  className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditStart}
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Product Family Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Product Families</h3>
            <div className="space-y-2">
              {productFamilies.map((family) => (
                <button
                  key={family.id}
                  onClick={() => setSelectedFamily(family.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedFamily === family.id
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-medium">{family.name}</div>
                  <div className="text-xs text-slate-500">{family.products.length} products</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-3">
          {currentFamily && (
            <div className="space-y-6">
              {/* Family Header */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Package className="h-8 w-8 text-emerald-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{currentFamily.name}</h3>
                    <p className="text-slate-600">{currentFamily.description}</p>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 gap-6">
                {currentFamily.products.map((product) => {
                  const stats = getProductStats(product.id);
                  const editedProduct = editedProducts[product.id];
                  
                  return (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedProduct?.name || product.name}
                                onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                                className="text-lg font-semibold text-slate-900 border border-slate-300 rounded px-2 py-1 flex-1"
                              />
                            ) : (
                              <h4 className="text-lg font-semibold text-slate-900">{product.name}</h4>
                            )}
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedProduct?.sku || product.sku}
                                onChange={(e) => handleProductChange(product.id, 'sku', e.target.value)}
                                className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded border border-slate-300"
                                placeholder="SKU"
                              />
                            ) : (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                                {formatValue(product.sku)}
                              </span>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <textarea
                              value={editedProduct?.description || product.description}
                              onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                              className="w-full text-slate-600 mb-4 border border-slate-300 rounded px-2 py-1"
                              rows={2}
                            />
                          ) : (
                            <p className="text-slate-600 mb-4">{product.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-5 w-5 text-emerald-600" />
                              <div>
                                <div className="text-sm text-slate-500">Average Price</div>
                                <div className="font-semibold text-slate-900">
                                  {stats.avgPrice > 0 ? `€${stats.avgPrice.toFixed(2)}` : '-'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Pricing Table */}
                      {product.customerPrices.length > 0 && (
                        <div>
                          <h5 className="font-medium text-slate-900 mb-3">Customer Pricing</h5>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="text-left py-2 px-4 text-sm font-medium text-slate-900">Customer</th>
                                  <th className="text-left py-2 px-4 text-sm font-medium text-slate-900">Type</th>
                                  <th className="text-left py-2 px-4 text-sm font-medium text-slate-900">Price</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {product.customerPrices.map((cp) => {
                                  const customer = customers.find(c => c.id === cp.customerId);
                                  
                                  return (
                                    <tr key={cp.customerId}>
                                      <td className="py-3 px-4">
                                        <div className="font-medium text-slate-900">{customer?.name || 'Unknown'}</div>
                                      </td>
                                      <td className="py-3 px-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                          customer?.type === 'OEM' 
                                            ? 'bg-slate-100 text-slate-800' 
                                            : customer?.type === 'Agent'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-100 text-slate-800'
                                        }`}>
                                          {customer?.type || 'Unknown'}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 font-medium text-emerald-600">€{cp.price.toFixed(2)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};