import React, { useState } from 'react';
import { Upload, Download, Eye, Trash2, FileText } from 'lucide-react';
import { Document } from '../types';

interface DocumentsSectionProps {
  documents: Document[];
  onDocumentsUpdate: (documents: Document[]) => void;
  isEditing: boolean;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  onDocumentsUpdate,
  isEditing
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      };
      onDocumentsUpdate([...documents, newDocument]);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    onDocumentsUpdate(documents.filter(doc => doc.id !== documentId));
  };

  const sortedDocuments = [...documents].sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Documents</span>
        </h2>
        {isEditing && (
          <label className="inline-flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm">
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        )}
      </div>

      {sortedDocuments.length === 0 ? (
        <p className="text-slate-500 text-center py-4">No documents uploaded yet</p>
      ) : (
        <div className="space-y-3">
          {sortedDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-medium text-slate-900">{doc.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <span>{(doc.size / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(doc.url, '_blank')}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <a
                  href={doc.url}
                  download={doc.name}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
                {isEditing && (
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};