import React, { useState } from 'react';
import { Package, DollarSign, Edit2, Save, X, Plus, Trash2, Users } from 'lucide-react';
import { ProductFamily, Customer, Product } from '../types';

interface ProductManagementProps {
  productFamilies: ProductFamily[];
  customers: Customer[];
  onProductFamiliesUpdate?: (families: ProductFamily[]) => void;
}

interface AddFamilyForm {
  name: string;
  description: string;
}

interface AddProductForm {
  name: string;
  description: string;
  sku: string;
  basePrice: number;
  familyId: string;
  customerPrices: { customerId: string; price: number; discountedPrice: number }[];
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  productFamilies: initialProductFamilies,
  customers,
  onProductFamiliesUpdate
}) => {
  const [productFamilies, setProductFamilies] = useState<ProductFamily[]>(initialProductFamilies);
  const [selectedFamily, setSelectedFamily] = useState<string>(productFamilies[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProducts, setEditedProducts] = useState<{[productId: string]: {name: string, description: string, sku: string}}>({});
  const [editedFamilies, setEditedFamilies] = useState<{[familyId: string]: {name: string, description: string}}>({});
  
  // Add Family Modal
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [addFamilyForm, setAddFamilyForm] = useState<AddFamilyForm>({
    name: '',
    description: ''
  });

  // Add Product Modal
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addProductForm, setAddProductForm] = useState<AddProductForm>({
    name: '',
    description: '',
    sku: '',
    basePrice: 0,
    familyId: '',
    customerPrices: []
  });
  
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
    // Initialize product edits
    const productEdits: {[productId: string]: {name: string, description: string, sku: string}} = {};
    if (currentFamily) {
      currentFamily.products.forEach(product => {
        productEdits[product.id] = {
          name: product.name,
          description: product.description,
          sku: product.sku
        };
      });
    }
    setEditedProducts(productEdits);

    // Initialize family edits
    const familyEdits: {[familyId: string]: {name: string, description: string}} = {};
    productFamilies.forEach(family => {
      familyEdits[family.id] = {
        name: family.name,
        description: family.description
      };
    });
    setEditedFamilies(familyEdits);

    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditedProducts({});
    setEditedFamilies({});
    setIsEditing(false);
  };

  const handleEditSave = () => {
    // Apply edits to the local state
    const updatedFamilies = productFamilies.map(family => {
      const editedFamily = editedFamilies[family.id];
      const updatedProducts = family.products.map(product => {
        const editedProduct = editedProducts[product.id];
        return editedProduct ? { ...product, ...editedProduct } : product;
      });
      
      return editedFamily 
        ? { ...family, ...editedFamily, products: updatedProducts }
        : { ...family, products: updatedProducts };
    });

    setProductFamilies(updatedFamilies);
    if (onProductFamiliesUpdate) {
      onProductFamiliesUpdate(updatedFamilies);
    }
    
    setIsEditing(false);
    setEditedProducts({});
    setEditedFamilies({});
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

  const handleFamilyChange = (familyId: string, field: 'name' | 'description', value: string) => {
    setEditedFamilies(prev => ({
      ...prev,
      [familyId]: {
        ...prev[familyId],
        [field]: value
      }
    }));
  };

  const handleAddFamily = () => {
    if (addFamilyForm.name.trim()) {
      const newFamily: ProductFamily = {
        id: `family-${Date.now()}`,
        name: addFamilyForm.name,
        description: addFamilyForm.description,
        products: []
      };

      const updatedFamilies = [...productFamilies, newFamily];
      setProductFamilies(updatedFamilies);
      
      if (onProductFamiliesUpdate) {
        onProductFamiliesUpdate(updatedFamilies);
      }

      // Select the new family
      setSelectedFamily(newFamily.id);
      
      setAddFamilyForm({ name: '', description: '' });
      setShowAddFamily(false);
    }
  };

  const handleAddProduct = () => {
    if (addProductForm.name.trim() && addProductForm.familyId) {
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        name: addProductForm.name,
        description: addProductForm.description,
        sku: addProductForm.sku,
        basePrice: addProductForm.basePrice,
        customerPrices: addProductForm.customerPrices.filter(cp => cp.customerId)
      };

      const updatedFamilies = productFamilies.map(family => 
        family.id === addProductForm.familyId
          ? { ...family, products: [...family.products, newProduct] }
          : family
      );

      setProductFamilies(updatedFamilies);
      
      if (onProductFamiliesUpdate) {
        onProductFamiliesUpdate(updatedFamilies);
      }

      // Select the family where the product was added
      setSelectedFamily(addProductForm.familyId);
      
      setAddProductForm({
        name: '',
        description: '',
        sku: '',
        basePrice: 0,
        familyId: '',
        customerPrices: []
      });
      setShowAddProduct(false);
    }
  };

  const handleAddCustomerPrice = () => {
    setAddProductForm(prev => ({
      ...prev,
      customerPrices: [...prev.customerPrices, { customerId: '', price: 0, discountedPrice: 0 }]
    }));
  };

  const handleRemoveCustomerPrice = (index: number) => {
    setAddProductForm(prev => ({
      ...prev,
      customerPrices: prev.customerPrices.filter((_, i) => i !== index)
    }));
  };

  const handleCustomerPriceChange = (index: number, field: 'customerId' | 'price' | 'discountedPrice', value: string | number) => {
    setAddProductForm(prev => ({
      ...prev,
      customerPrices: prev.customerPrices.map((cp, i) => 
        i === index ? { ...cp, [field]: value } : cp
      )
    }));
  };

  const formatValue = (value: string | undefined | null) => {
    return value && value.trim() !== '' ? value : '-';
  };

  // Set default family when opening add product modal
  const handleShowAddProduct = () => {
    setAddProductForm(prev => ({
      ...prev,
      familyId: selectedFamily || productFamilies[0]?.id || ''
    }));
    setShowAddProduct(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Product Management</h2>
            <p className="mt-1 text-slate-600">Manage product families and customer-specific pricing</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddFamily(true)}
              className="inline-flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Family</span>
            </button>
            <button
              onClick={handleShowAddProduct}
              disabled={productFamilies.length === 0}
              className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
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
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditStart}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
            {productFamilies.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">No product families yet</p>
                <button
                  onClick={() => setShowAddFamily(true)}
                  className="mt-2 text-sm text-emerald-600 hover:text-emerald-800"
                >
                  Add your first family
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {productFamilies.map((family) => {
                  const editedFamily = editedFamilies[family.id];
                  return (
                    <div key={family.id}>
                      <button
                        onClick={() => setSelectedFamily(family.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedFamily === family.id
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editedFamily?.name || family.name}
                              onChange={(e) => handleFamilyChange(family.id, 'name', e.target.value)}
                              className="w-full text-sm font-medium bg-white border border-slate-300 rounded px-2 py-1"
                            />
                            <textarea
                              value={editedFamily?.description || family.description}
                              onChange={(e) => handleFamilyChange(family.id, 'description', e.target.value)}
                              className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">{family.name}</div>
                            <div className="text-xs text-slate-500">{family.products.length} products</div>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:col-span-3">
          {currentFamily ? (
            <div className="space-y-6">
              {/* Family Header */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Package className="h-8 w-8 text-emerald-600" />
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editedFamilies[currentFamily.id]?.name || currentFamily.name}
                          onChange={(e) => handleFamilyChange(currentFamily.id, 'name', e.target.value)}
                          className="text-xl font-semibold text-slate-900 border border-slate-300 rounded px-3 py-2 w-full"
                        />
                        <textarea
                          value={editedFamilies[currentFamily.id]?.description || currentFamily.description}
                          onChange={(e) => handleFamilyChange(currentFamily.id, 'description', e.target.value)}
                          className="text-slate-600 border border-slate-300 rounded px-3 py-2 w-full"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{currentFamily.name}</h3>
                        <p className="text-slate-600">{currentFamily.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {currentFamily.products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No products in this family</h3>
                  <p className="text-slate-600 mb-4">Add your first product to get started</p>
                  <button
                    onClick={handleShowAddProduct}
                    className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              ) : (
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
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No product family selected</h3>
              <p className="text-slate-600 mb-4">Create a product family to get started</p>
              <button
                onClick={() => setShowAddFamily(true)}
                className="inline-flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Family</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Family Modal */}
      {showAddFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Add Product Family</h2>
                <button
                  onClick={() => setShowAddFamily(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Family Name *
                </label>
                <input
                  type="text"
                  value={addFamilyForm.name}
                  onChange={(e) => setAddFamilyForm({ ...addFamilyForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Power Management"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={addFamilyForm.description}
                  onChange={(e) => setAddFamilyForm({ ...addFamilyForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter family description"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddFamily(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFamily}
                  disabled={!addFamilyForm.name.trim()}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add Family
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Add Product</h2>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Family Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Family *
                </label>
                <select
                  value={addProductForm.familyId}
                  onChange={(e) => setAddProductForm({ ...addProductForm, familyId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a family</option>
                  {productFamilies.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Basic Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={addProductForm.name}
                    onChange={(e) => setAddProductForm({ ...addProductForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Cable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Part Number (SKU)
                  </label>
                  <input
                    type="text"
                    value={addProductForm.sku}
                    onChange={(e) => setAddProductForm({ ...addProductForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., CAB-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={addProductForm.description}
                  onChange={(e) => setAddProductForm({ ...addProductForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Base Price (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={addProductForm.basePrice}
                  onChange={(e) => setAddProductForm({ ...addProductForm, basePrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Customer Pricing */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-slate-900">Customer Pricing</h3>
                  <button
                    onClick={handleAddCustomerPrice}
                    className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Customer</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {addProductForm.customerPrices.map((cp, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-slate-200 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Customer</label>
                        <select
                          value={cp.customerId}
                          onChange={(e) => handleCustomerPriceChange(index, 'customerId', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">Select Customer</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name} ({customer.type})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Price (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={cp.price}
                          onChange={(e) => handleCustomerPriceChange(index, 'price', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Discounted Price (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={cp.discountedPrice}
                          onChange={(e) => handleCustomerPriceChange(index, 'discountedPrice', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => handleRemoveCustomerPrice(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={!addProductForm.name.trim() || !addProductForm.familyId}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};