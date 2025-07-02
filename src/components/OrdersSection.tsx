import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ShoppingCart, Upload, Download, Eye, X } from 'lucide-react';
import { Order, OrderDocument } from '../types';

interface OrdersSectionProps {
  orders: Order[];
  onOrdersUpdate: (orders: Order[]) => void;
  isEditing: boolean;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  onOrdersUpdate,
  isEditing
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    finalUser: '',
    projectName: '',
    offerName: '',
    amount: 0,
    ocName: '',
    paid: 'No'
  });

  const handleAddOrder = () => {
    if (formData.finalUser.trim() && formData.projectName.trim()) {
      const newOrder: Order = {
        id: Date.now().toString(),
        ...formData,
        paid: formData.paid === 'Yes',
        documents: []
      };
      onOrdersUpdate([newOrder, ...orders]);
      resetForm();
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      date: order.date,
      finalUser: order.finalUser,
      projectName: order.projectName,
      offerName: order.offerName,
      amount: order.amount,
      ocName: order.ocName,
      paid: order.paid ? 'Yes' : 'No'
    });
  };

  const handleUpdateOrder = () => {
    if (editingOrder && formData.finalUser.trim() && formData.projectName.trim()) {
      const updatedOrders = orders.map(o =>
        o.id === editingOrder.id
          ? { ...editingOrder, ...formData, paid: formData.paid === 'Yes' }
          : o
      );
      onOrdersUpdate(updatedOrders);
      setEditingOrder(null);
      resetForm();
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    onOrdersUpdate(orders.filter(o => o.id !== orderId));
  };

  const handleFileUpload = (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newDocument: OrderDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };

      const updatedOrders = orders.map(order =>
        order.id === orderId
          ? { ...order, documents: [...order.documents, newDocument] }
          : order
      );
      onOrdersUpdate(updatedOrders);
    }
  };

  const handleDeleteDocument = (orderId: string, documentId: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, documents: order.documents.filter(doc => doc.id !== documentId) }
        : order
    );
    onOrdersUpdate(updatedOrders);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      finalUser: '',
      projectName: '',
      offerName: '',
      amount: 0,
      ocName: '',
      paid: 'No'
    });
    setShowAddForm(false);
    setEditingOrder(null);
  };

  const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5" />
          <span>Order History</span>
        </h2>
        {isEditing && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Order</span>
          </button>
        )}
      </div>

      {sortedOrders.length === 0 && !showAddForm && (
        <p className="text-slate-500 text-center py-4">No orders recorded yet</p>
      )}

      <div className="space-y-4">
        {showAddForm && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="font-medium text-slate-900 mb-3">Add New Order</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Final User *"
                value={formData.finalUser}
                onChange={(e) => setFormData({ ...formData, finalUser: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Project Name *"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Offer Name"
                value={formData.offerName}
                onChange={(e) => setFormData({ ...formData, offerName: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Amount (€)"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="OC Name"
                value={formData.ocName}
                onChange={(e) => setFormData({ ...formData, ocName: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <select
                value={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleAddOrder}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                Add Order
              </button>
              <button
                onClick={resetForm}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {sortedOrders.map((order) => (
          <div key={order.id} className="border border-slate-200 rounded-lg p-4">
            {editingOrder?.id === order.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Final User *"
                    value={formData.finalUser}
                    onChange={(e) => setFormData({ ...formData, finalUser: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Project Name *"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Offer Name"
                    value={formData.offerName}
                    onChange={(e) => setFormData({ ...formData, offerName: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Amount (€)"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="OC Name"
                    value={formData.ocName}
                    onChange={(e) => setFormData({ ...formData, ocName: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <select
                    value={formData.paid}
                    onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateOrder}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-500">{new Date(order.date).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paid ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Final User:</span>
                    <span className="ml-2 text-slate-900">{order.finalUser}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-700">Project:</span>
                    <span className="ml-2 text-slate-900">{order.projectName}</span>
                  </div>
                  {order.offerName && (
                    <div>
                      <span className="text-sm font-medium text-slate-700">Offer:</span>
                      <span className="ml-2 text-slate-900">{order.offerName}</span>
                    </div>
                  )}
                  {order.amount > 0 && (
                    <div>
                      <span className="text-sm font-medium text-slate-700">Amount:</span>
                      <span className="ml-2 text-slate-900">€{order.amount.toLocaleString()}</span>
                    </div>
                  )}
                  {order.ocName && (
                    <div>
                      <span className="text-sm font-medium text-slate-700">OC:</span>
                      <span className="ml-2 text-slate-900">{order.ocName}</span>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-slate-700">Documents</h5>
                    {isEditing && (
                      <label className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 cursor-pointer text-sm">
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(order.id, e)}
                        />
                      </label>
                    )}
                  </div>
                  
                  {order.documents.length === 0 ? (
                    <p className="text-sm text-slate-500">No documents uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {order.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-900">{doc.name}</span>
                            <span className="text-xs text-slate-500">({(doc.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => window.open(doc.url, '_blank')}
                              className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <a
                              href={doc.url}
                              download={doc.name}
                              className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            {isEditing && (
                              <button
                                onClick={() => handleDeleteDocument(order.id, doc.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};