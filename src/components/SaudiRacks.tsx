import React, { useState } from 'react';
import { Upload, Eye, Trash2, FileText, Download, FolderOpen } from 'lucide-react';

interface ComponentsDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  isFolder?: boolean;
  path?: string;
}

interface FolderStructure {
  [key: string]: ComponentsDocument[];
}

export const SaudiRacks: React.FC = () => {
  const [documents, setDocuments] = useState<ComponentsDocument[]>([]);
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({});
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newDocuments: ComponentsDocument[] = [];
      
      Array.from(files).forEach(file => {
        const newDocument: ComponentsDocument = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString()
        };
        newDocuments.push(newDocument);
      });
      
      setDocuments([...documents, ...newDocuments]);
    }
  };

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFolderStructure: FolderStructure = { ...folderStructure };
      
      Array.from(files).forEach(file => {
        const relativePath = file.webkitRelativePath || file.name;
        const pathParts = relativePath.split('/');
        const folderName = pathParts[0];
        
        if (!newFolderStructure[folderName]) {
          newFolderStructure[folderName] = [];
        }
        
        const newDocument: ComponentsDocument = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
          path: relativePath
        };
        
        newFolderStructure[folderName].push(newDocument);
      });
      
      setFolderStructure(newFolderStructure);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const handleDeleteFolder = (folderName: string) => {
    const newFolderStructure = { ...folderStructure };
    delete newFolderStructure[folderName];
    setFolderStructure(newFolderStructure);
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      newSet.delete(folderName);
      return newSet;
    });
  };

  const handleDeleteFolderFile = (folderName: string, fileId: string) => {
    const newFolderStructure = { ...folderStructure };
    newFolderStructure[folderName] = newFolderStructure[folderName].filter(file => file.id !== fileId);
    
    if (newFolderStructure[folderName].length === 0) {
      delete newFolderStructure[folderName];
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(folderName);
        return newSet;
      });
    }
    
    setFolderStructure(newFolderStructure);
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Components List</h2>
        <p className="mt-1 text-slate-600">Component specifications and technical drawings</p>
      </div>

      <div className="space-y-6">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload Components</h3>
          
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
              <Upload className="h-5 w-5" />
              <span>Upload Table</span>
              <input
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            
            <label className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
              <FolderOpen className="h-5 w-5" />
              <span>Upload Folder</span>
              <input
                type="file"
                multiple
                webkitdirectory=""
                className="hidden"
                onChange={handleFolderUpload}
              />
            </label>
          </div>
          
          <p className="text-sm text-slate-500 mt-3">
            Upload PDF tables or entire folders containing component specifications and drawings
          </p>
        </div>

        {/* Folder Structure */}
        {Object.keys(folderStructure).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Folders</h3>
            
            <div className="space-y-3">
              {Object.entries(folderStructure).map(([folderName, files]) => (
                <div key={folderName} className="border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-t-lg">
                    <button
                      onClick={() => toggleFolder(folderName)}
                      className="flex items-center space-x-2 text-slate-900 hover:text-slate-700"
                    >
                      <FolderOpen className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium">{folderName}</span>
                      <span className="text-sm text-slate-500">({files.length} files)</span>
                      <span className="text-slate-400">
                        {expandedFolders.has(folderName) ? '▼' : '▶'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folderName)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {expandedFolders.has(folderName) && (
                    <div className="p-3 space-y-2">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-white border border-slate-100 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-slate-600" />
                            <span className="text-sm text-slate-900">{file.name}</span>
                            <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => window.open(file.url, '_blank')}
                              className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <a
                              href={file.url}
                              download={file.name}
                              className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteFolderFile(folderName, file.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Files */}
        {documents.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Racks</h3>

            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-slate-600" />
                    <div>
                      <h4 className="font-medium text-slate-900">{document.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <span>{(document.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(document.url, '_blank')}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <a
                      href={document.url}
                      download={document.name}
                      className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {documents.length === 0 && Object.keys(folderStructure).length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-slate-500 text-center py-8">No components uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};