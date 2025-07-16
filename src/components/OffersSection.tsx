import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Upload, Download, Eye, X, FolderOpen, CheckSquare } from 'lucide-react';
import { Offer, OfferDocument } from '../types';

interface OffersSectionProps {
  offers: Offer[];
  onOffersUpdate: (offers: Offer[]) => void;
  isEditing: boolean;
}

interface FolderStructure {
  [key: string]: OfferDocument[];
}

export const OffersSection: React.FC<OffersSectionProps> = ({
  offers,
  onOffersUpdate,
  isEditing
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    finalUser: '',
    projectName: '',
    offerName: '',
    amount: 0,
    ocName: ''
  });
  const [folderStructures, setFolderStructures] = useState<{[offerId: string]: FolderStructure}>({});
  const [expandedFolders, setExpandedFolders] = useState<{[key: string]: boolean}>({});

  const handleAddOffer = () => {
    if (formData.finalUser.trim() && formData.projectName.trim()) {
      const newOffer: Offer = {
        id: Date.now().toString(),
        ...formData,
        markedAsOrdered: false,
        documents: []
      };
      onOffersUpdate([newOffer, ...offers]);
      resetForm();
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      date: offer.date,
      finalUser: offer.finalUser,
      projectName: offer.projectName,
      offerName: offer.offerName,
      amount: offer.amount,
      ocName: offer.ocName
    });
  };

  const handleUpdateOffer = () => {
    if (editingOffer && formData.finalUser.trim() && formData.projectName.trim()) {
      const updatedOffers = offers.map(o =>
        o.id === editingOffer.id
          ? { ...editingOffer, ...formData }
          : o
      );
      onOffersUpdate(updatedOffers);
      setEditingOffer(null);
      resetForm();
    }
  };

  const handleDeleteOffer = (offerId: string) => {
    onOffersUpdate(offers.filter(o => o.id !== offerId));
    // Clean up folder structures for deleted offer
    const newFolderStructures = { ...folderStructures };
    delete newFolderStructures[offerId];
    setFolderStructures(newFolderStructures);
  };

  const handleMarkAsOrdered = (offerId: string) => {
    const updatedOffers = offers.map(offer =>
      offer.id === offerId
        ? { ...offer, markedAsOrdered: !offer.markedAsOrdered }
        : offer
    );
    onOffersUpdate(updatedOffers);
  };

  const handleFileUpload = (offerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newDocument: OfferDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };

      const updatedOffers = offers.map(offer =>
        offer.id === offerId
          ? { ...offer, documents: [...offer.documents, newDocument] }
          : offer
      );
      onOffersUpdate(updatedOffers);
    }
  };

  const handleFolderUpload = (offerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFolderStructure: FolderStructure = { ...folderStructures[offerId] || {} };
      
      Array.from(files).forEach(file => {
        const relativePath = file.webkitRelativePath || file.name;
        const pathParts = relativePath.split('/');
        const folderName = pathParts[0];
        
        if (!newFolderStructure[folderName]) {
          newFolderStructure[folderName] = [];
        }
        
        const newDocument: OfferDocument = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        };
        
        newFolderStructure[folderName].push(newDocument);
      });
      
      setFolderStructures({
        ...folderStructures,
        [offerId]: newFolderStructure
      });
    }
  };

  const handleDeleteDocument = (offerId: string, documentId: string) => {
    const updatedOffers = offers.map(offer =>
      offer.id === offerId
        ? { ...offer, documents: offer.documents.filter(doc => doc.id !== documentId) }
        : offer
    );
    onOffersUpdate(updatedOffers);
  };

  const handleDeleteFolder = (offerId: string, folderName: string) => {
    const newFolderStructures = { ...folderStructures };
    if (newFolderStructures[offerId]) {
      delete newFolderStructures[offerId][folderName];
      if (Object.keys(newFolderStructures[offerId]).length === 0) {
        delete newFolderStructures[offerId];
      }
    }
    setFolderStructures(newFolderStructures);
    
    // Remove from expanded folders
    const folderKey = `${offerId}-${folderName}`;
    const newExpandedFolders = { ...expandedFolders };
    delete newExpandedFolders[folderKey];
    setExpandedFolders(newExpandedFolders);
  };

  const handleDeleteFolderFile = (offerId: string, folderName: string, fileId: string) => {
    const newFolderStructures = { ...folderStructures };
    if (newFolderStructures[offerId] && newFolderStructures[offerId][folderName]) {
      newFolderStructures[offerId][folderName] = newFolderStructures[offerId][folderName].filter(file => file.id !== fileId);
      
      if (newFolderStructures[offerId][folderName].length === 0) {
        delete newFolderStructures[offerId][folderName];
        if (Object.keys(newFolderStructures[offerId]).length === 0) {
          delete newFolderStructures[offerId];
        }
        
        // Remove from expanded folders
        const folderKey = `${offerId}-${folderName}`;
        const newExpandedFolders = { ...expandedFolders };
        delete newExpandedFolders[folderKey];
        setExpandedFolders(newExpandedFolders);
      }
    }
    setFolderStructures(newFolderStructures);
  };

  const toggleFolder = (offerId: string, folderName: string) => {
    const folderKey = `${offerId}-${folderName}`;
    setExpandedFolders(prev => ({
      ...prev,
      [folderKey]: !prev[folderKey]
    }));
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      finalUser: '',
      projectName: '',
      offerName: '',
      amount: 0,
      ocName: ''
    });
    setShowAddForm(false);
    setEditingOffer(null);
  };

  // Filter out offers that are marked as ordered
  const activeOffers = offers.filter(offer => !offer.markedAsOrdered);
  const sortedOffers = [...activeOffers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Offers</span>
        </h2>
        {isEditing && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Offer</span>
          </button>
        )}
      </div>

      {sortedOffers.length === 0 && !showAddForm && (
        <p className="text-slate-500 text-center py-4">No offers recorded yet</p>
      )}

      <div className="space-y-4">
        {showAddForm && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="font-medium text-slate-900 mb-3">Add New Offer</h4>
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
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleAddOffer}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                Add Offer
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

        {sortedOffers.map((offer) => (
          <div key={offer.id} className="border border-slate-200 rounded-lg p-4">
            {editingOffer?.id === offer.id ? (
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
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateOffer}
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
                    <span className="text-sm text-slate-500">{new Date(offer.date).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleMarkAsOrdered(offer.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm"
                      title="Mark as Ordered"
                    >
                      Mark as Ordered
                    </button>
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditOffer(offer)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
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
                    <span className="ml-2 text-slate-900">{offer.finalUser}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-700">Project:</span>
                    <span className="ml-2 text-slate-900">{offer.projectName}</span>
                  </div>
                  {offer.offerName && (
                    <div>
                      <span className="text-sm font-medium text-slate-700">Offer:</span>
                      <span className="ml-2 text-slate-900">{offer.offerName}</span>
                    </div>
                  )}
                  {offer.amount > 0 && (
                    <div>
                      <span className="text-sm font-medium text-slate-700">Amount:</span>
                      <span className="ml-2 text-slate-900">€{offer.amount}</span>
                    </div>
                  )}
                  {offer.ocName && (
                    <div>
                      <span className="text-sm font-medium text-slate-700">OC:</span>
                      <span className="ml-2 text-slate-900">{offer.ocName}</span>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-slate-700">Documents</h5>
                    {isEditing && (
                      <div className="flex space-x-2">
                        <label className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 cursor-pointer text-sm">
                          <Upload className="h-4 w-4" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(offer.id, e)}
                          />
                        </label>
                        <label className="inline-flex items-center space-x-1 text-emerald-600 hover:text-emerald-800 cursor-pointer text-sm">
                          <FolderOpen className="h-4 w-4" />
                          <span>Upload Folder</span>
                          <input
                            type="file"
                            multiple
                            webkitdirectory=""
                            className="hidden"
                            onChange={(e) => handleFolderUpload(offer.id, e)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {/* Folder Structure */}
                  {folderStructures[offer.id] && Object.keys(folderStructures[offer.id]).length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-xs font-medium text-slate-600 mb-2">Folders:</h6>
                      <div className="space-y-2">
                        {Object.entries(folderStructures[offer.id]).map(([folderName, files]) => {
                          const folderKey = `${offer.id}-${folderName}`;
                          const isExpanded = expandedFolders[folderKey];
                          
                          return (
                            <div key={folderName} className="border border-slate-200 rounded">
                              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-t">
                                <button
                                  onClick={() => toggleFolder(offer.id, folderName)}
                                  className="flex items-center space-x-2 text-slate-900 hover:text-slate-700"
                                >
                                  <FolderOpen className="h-4 w-4 text-emerald-600" />
                                  <span className="text-sm font-medium">{folderName}</span>
                                  <span className="text-xs text-slate-500">({files.length} files)</span>
                                  <span className="text-slate-400 text-xs">
                                    {isExpanded ? '▼' : '▶'}
                                  </span>
                                </button>
                                {isEditing && (
                                  <button
                                    onClick={() => handleDeleteFolder(offer.id, folderName)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                              
                              {isExpanded && (
                                <div className="p-2 space-y-1">
                                  {files.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-1 bg-white border border-slate-100 rounded text-xs">
                                      <span className="text-slate-900">{file.name}</span>
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={() => window.open(file.url, '_blank')}
                                          className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </button>
                                        <a
                                          href={file.url}
                                          download={file.name}
                                          className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                                        >
                                          <Download className="h-3 w-3" />
                                        </a>
                                        {isEditing && (
                                          <button
                                            onClick={() => handleDeleteFolderFile(offer.id, folderName, file.id)}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Individual Files */}
                  {offer.documents.length === 0 && (!folderStructures[offer.id] || Object.keys(folderStructures[offer.id]).length === 0) ? (
                    <p className="text-sm text-slate-500">No documents uploaded</p>
                  ) : (
                    offer.documents.length > 0 && (
                      <div>
                        <h6 className="text-xs font-medium text-slate-600 mb-2">Files:</h6>
                        <div className="space-y-2">
                          {offer.documents.map((doc) => (
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
                                    onClick={() => handleDeleteDocument(offer.id, doc.id)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
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