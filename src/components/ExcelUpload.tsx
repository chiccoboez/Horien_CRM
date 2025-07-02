import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Customer, ProductFamily, Product } from '../types';

interface ExcelUploadProps {
  onDataImport: (customers: Customer[], productFamilies: ProductFamily[]) => void;
  onClose: () => void;
}

interface ParsedData {
  customers: Customer[];
  productFamilies: ProductFamily[];
  errors: string[];
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({ onDataImport, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedData | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setIsProcessing(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      const result = parseExcelData(worksheet);
      setParseResult(result);
    } catch (error) {
      console.error('Error processing file:', error);
      setParseResult({
        customers: [],
        productFamilies: [],
        errors: ['Failed to process the Excel file. Please check the file format.']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    return String(value).trim();
  };

  const parseExcelData = (worksheet: XLSX.WorkSheet): ParsedData => {
    const errors: string[] = [];
    const customers: Customer[] = [];
    const productFamilies: ProductFamily[] = [];

    try {
      // Parse customers from D2:L2 (regular customers) and N2:T2 (OEM)
      const regularCustomers = [];
      const oemCustomers = [];

      // Regular customers (D2:L2)
      for (let col = 4; col <= 12; col++) { // D=4, L=12
        const cellRef = XLSX.utils.encode_cell({ r: 1, c: col - 1 }); // Row 2 = r:1
        const cell = worksheet[cellRef];
        if (cell && cell.v) {
          regularCustomers.push(formatValue(cell.v));
        }
      }

      // OEM customers (N2:T2)
      for (let col = 14; col <= 20; col++) { // N=14, T=20
        const cellRef = XLSX.utils.encode_cell({ r: 1, c: col - 1 }); // Row 2 = r:1
        const cell = worksheet[cellRef];
        if (cell && cell.v) {
          oemCustomers.push(formatValue(cell.v));
        }
      }

      // Create customer objects
      regularCustomers.forEach((name, index) => {
        if (name) {
          customers.push({
            id: `customer-${index + 1}`,
            name,
            type: 'Customer',
            status: 'Active',
            email: '',
            phone: '',
            address: {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            },
            paymentTerms: '',
            createdAt: new Date().toISOString().split('T')[0],
            lastContact: new Date().toISOString().split('T')[0]
          });
        }
      });

      oemCustomers.forEach((name, index) => {
        if (name) {
          customers.push({
            id: `oem-${index + 1}`,
            name,
            type: 'OEM',
            status: 'Active',
            email: '',
            phone: '',
            address: {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            },
            paymentTerms: '',
            createdAt: new Date().toISOString().split('T')[0],
            lastContact: new Date().toISOString().split('T')[0]
          });
        }
      });

      // Parse product families and products
      const familyRanges = [
        { start: 3, end: 8, name: 'A3-A8' },
        { start: 9, end: 18, name: 'A9-A18' },
        { start: 19, end: 20, name: 'A19-A20' },
        { start: 21, end: 23, name: 'A21-A23' },
        { start: 24, end: 26, name: 'A24-A26' },
        { start: 27, end: 28, name: 'A27-A28' },
        { start: 29, end: 38, name: 'A29-A38' },
        { start: 39, end: 39, name: 'A39' }
      ];

      familyRanges.forEach((range, familyIndex) => {
        let familyName = '';
        const products: Product[] = [];

        for (let row = range.start; row <= range.end; row++) {
          // Get family name from column A
          const familyCell = worksheet[XLSX.utils.encode_cell({ r: row - 1, c: 0 })];
          if (familyCell && familyCell.v && !familyName) {
            familyName = formatValue(familyCell.v);
          }

          // Get product name from column B
          const productCell = worksheet[XLSX.utils.encode_cell({ r: row - 1, c: 1 })];
          // Get part number from column C
          const pnCell = worksheet[XLSX.utils.encode_cell({ r: row - 1, c: 2 })];

          if (productCell && productCell.v) {
            const productName = formatValue(productCell.v);
            const partNumber = formatValue(pnCell?.v) || '';

            // Get pricing for this product from all customer columns
            const customerPrices: { customerId: string; price: number }[] = [];
            
            // Regular customers (D3:L39)
            regularCustomers.forEach((customerName, custIndex) => {
              if (customerName) {
                const priceCell = worksheet[XLSX.utils.encode_cell({ r: row - 1, c: 3 + custIndex })];
                if (priceCell && priceCell.v && !isNaN(Number(priceCell.v))) {
                  const customerId = `customer-${custIndex + 1}`;
                  const price = Number(priceCell.v);
                  customerPrices.push({ customerId, price });
                }
              }
            });

            // OEM customers (N3:T39)
            oemCustomers.forEach((customerName, custIndex) => {
              if (customerName) {
                const priceCell = worksheet[XLSX.utils.encode_cell({ r: row - 1, c: 13 + custIndex })];
                if (priceCell && priceCell.v && !isNaN(Number(priceCell.v))) {
                  const customerId = `oem-${custIndex + 1}`;
                  const price = Number(priceCell.v);
                  customerPrices.push({ customerId, price });
                }
              }
            });

            // Calculate base price as the highest price found
            const basePrice = customerPrices.length > 0 
              ? Math.max(...customerPrices.map(cp => cp.price))
              : 0;

            products.push({
              id: `product-${familyIndex}-${row}`,
              name: productName,
              sku: partNumber,
              description: `${productName}${partNumber ? ` - ${partNumber}` : ''}`,
              basePrice,
              customerPrices
            });
          }
        }

        if (familyName && products.length > 0) {
          productFamilies.push({
            id: `family-${familyIndex + 1}`,
            name: familyName,
            description: `Product family: ${familyName}`,
            products
          });
        }
      });

      if (customers.length === 0) {
        errors.push('No customers found. Please check that customer names are in cells D2:L2 and N2:T2.');
      }

      if (productFamilies.length === 0) {
        errors.push('No product families found. Please check the Excel structure.');
      }

    } catch (error) {
      errors.push(`Error parsing Excel data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { customers, productFamilies, errors };
  };

  const handleImport = () => {
    if (parseResult && parseResult.customers.length > 0 && parseResult.productFamilies.length > 0) {
      onDataImport(parseResult.customers, parseResult.productFamilies);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Import Excel Data</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!parseResult && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-slate-900 mb-2">Excel File Structure</h3>
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700">
                  <ul className="space-y-1">
                    <li>• <strong>D2:L2</strong> - Regular customer names</li>
                    <li>• <strong>N2:T2</strong> - OEM customer names</li>
                    <li>• <strong>Column A</strong> - Product family names</li>
                    <li>• <strong>Column B</strong> - Product names</li>
                    <li>• <strong>Column C</strong> - Part numbers (PN)</li>
                    <li>• <strong>D3:T39</strong> - Pricing matrix</li>
                  </ul>
                </div>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-600">Processing Excel file...</p>
                  </div>
                ) : (
                  <>
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-lg font-medium text-slate-900 mb-2">
                      Drop your Excel file here
                    </p>
                    <p className="text-slate-600 mb-4">or</p>
                    <label className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                      <Upload className="h-5 w-5" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-slate-500 mt-2">
                      Supports .xlsx and .xls files
                    </p>
                  </>
                )}
              </div>
            </>
          )}

          {parseResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Customers Found</h4>
                  </div>
                  <p className="text-green-700">{parseResult.customers.length} customers imported</p>
                  <div className="mt-2 text-sm text-green-600">
                    <p>Regular: {parseResult.customers.filter(c => c.type === 'Customer').length}</p>
                    <p>OEM: {parseResult.customers.filter(c => c.type === 'OEM').length}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Product Families</h4>
                  </div>
                  <p className="text-blue-700">{parseResult.productFamilies.length} families imported</p>
                  <p className="text-sm text-blue-600 mt-1">
                    {parseResult.productFamilies.reduce((sum, family) => sum + family.products.length, 0)} total products
                  </p>
                </div>
              </div>

              {parseResult.errors.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-900">Warnings</h4>
                  </div>
                  <ul className="text-red-700 text-sm space-y-1">
                    {parseResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <h4 className="font-medium text-slate-900 mb-3">Preview</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-2">Customers:</h5>
                    <div className="flex flex-wrap gap-2">
                      {parseResult.customers.slice(0, 10).map((customer) => (
                        <span
                          key={customer.id}
                          className={`px-2 py-1 rounded text-xs ${
                            customer.type === 'OEM'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {customer.name}
                        </span>
                      ))}
                      {parseResult.customers.length > 10 && (
                        <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-600">
                          +{parseResult.customers.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-2">Product Families:</h5>
                    <div className="space-y-2">
                      {parseResult.productFamilies.map((family) => (
                        <div key={family.id} className="text-sm">
                          <span className="font-medium text-slate-900">{family.name}</span>
                          <span className="text-slate-500 ml-2">({family.products.length} products)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={parseResult.customers.length === 0 || parseResult.productFamilies.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  Import Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};