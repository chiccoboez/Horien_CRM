import React, { useState } from 'react';
import { Upload, Eye, Trash2, FileText, Download, FolderOpen, File } from 'lucide-react';

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

  const getFileIcon = (fileName: string, fileType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType.includes('pdf') || extension === 'pdf') {
      return <FileText className="h-8 w-8 text-red-600" />;
    } else if (fileType.includes('word') || extension === 'doc' || extension === 'docx') {
      return <File className="h-8 w-8 text-blue-600" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || extension === 'xls' || extension === 'xlsx') {
      return <File className="h-8 w-8 text-green-600" />;
    } else if (fileType.includes('powerpoint') || extension === 'ppt' || extension === 'pptx') {
      return <File className="h-8 w-8 text-orange-600" />;
    } else {
      return <FileText className="h-8 w-8 text-slate-600" />;
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Components List</h2>
        <p className="mt-1 text-slate-600">Component specifications and technical drawings</p>
      </div>

      <div className="space-y-6">
        {/* Documents Uploaded Section - Show First */}
        {(sortedDocuments.length > 0 || Object.keys(folderStructure).length > 0) && (
          <div className="space-y-6">
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
                                {getFileIcon(file.name, file.type)}
                                <div>
                                  <span className="text-sm text-slate-900 font-medium">{file.name}</span>
                                  <div className="text-xs text-slate-500">
                                    {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                                  </div>
                                </div>
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
            {sortedDocuments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Documents</h3>

                <div className="space-y-3">
                  {sortedDocuments.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(document.name, document.type)}
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
          </div>
        )}

        {/* Upload Section - Show Second */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload Documents</h3>
          
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
              <Upload className="h-5 w-5" />
              <span>Upload Documents</span>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
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
            Upload documents (PDF, Word, Excel, PowerPoint) or entire folders containing component specifications and drawings
          </p>
        </div>

        {/* Empty State */}
        {sortedDocuments.length === 0 && Object.keys(folderStructure).length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No components uploaded yet</h3>
              <p className="text-slate-500 mb-4">Upload your first document or folder to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};