import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export const CertificationCalculator: React.FC = () => {
  const [invoiceValue, setInvoiceValue] = useState<number>(0);

  const calculateCertificationPrice = (value: number): number => {
    // Formula: ((Value * 1.06 * 0.18%) + 100 + 30) / 0.94
    const result = ((value * 1.06 * 0.0018) + 100 + 30) / 0.94;
    return result;
  };

  const certificationPrice = calculateCertificationPrice(invoiceValue);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Certification of Origin Calculator</h2>
        <p className="mt-1 text-slate-600">Calculate certification costs based on invoice value</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <Calculator className="mx-auto h-16 w-16 text-emerald-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Certification Cost Calculator</h3>
            <p className="text-slate-600">Enter the invoice value to calculate the certification price</p>
          </div>

          <div className="space-y-6">
            {/* Invoice Value Input */}
            <div>
              <label className="block text-lg font-medium text-slate-900 mb-3">
                Value of the Invoice
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium">€</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={invoiceValue}
                  onChange={(e) => setInvoiceValue(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="block w-full pl-12 pr-4 py-4 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">Enter the invoice value in Euros (EUR)</p>
            </div>

            {/* Final Result */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
              <h4 className="text-lg font-semibold text-emerald-900 mb-2">Certification of Origin's Price</h4>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-slate-600 font-medium">€</span>
                <span className="text-3xl font-bold text-emerald-600">
                  {certificationPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-emerald-700 mt-2">Final certification cost in Euros</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};