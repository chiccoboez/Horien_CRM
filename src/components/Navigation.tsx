import React from 'react';
import { Users, Package, FileSpreadsheet, Calculator, BarChart3, Plane } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: BarChart3 },
    { id: 'customers' as View, label: 'Customers', icon: Users },
    { id: 'products' as View, label: 'Products', icon: Package },
    { id: 'saudi-racks' as View, label: 'Components List', icon: FileSpreadsheet },
    { id: 'certification-calculator' as View, label: 'Certification of Origin Calculator', icon: Calculator },
    { id: 'trips' as View, label: 'Trips', icon: Plane }
  ];

  return (
    <nav className="bg-slate-800 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onViewChange('dashboard')}
              className="hover:opacity-80 transition-opacity"
            >
              <img 
                src="/Bianco_Horien_SBS_Logotype_RGB_EnergeticGreen.png" 
                alt="Horien Salt Battery Solutions" 
                className="h-10 w-auto"
              />
            </button>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};