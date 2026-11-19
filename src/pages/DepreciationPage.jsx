import React, { useState } from 'react';
import {
  TrendingDown,
  DollarSign,
  Calendar,
  Calculator,
  Download,
  Box
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToCsv } from '../data/templates';

export default function DepreciationPage({ onSelectAsset }) {
  const { assets } = useApp();
  const [method, setMethod] = useState('straight'); // 'straight' | 'ddb'
  const currentYear = new Date().getFullYear();

  const assetCalculations = assets.map(a => {
    const cost = Number(a.cost) || 850;
    const salvage = Number(a.salvageValue) || 100;
    const life = Number(a.usefulLifeYears) || 5;
    const purchaseYear = new Date(a.purchaseDate).getFullYear();
    const age = Math.max(0, currentYear - purchaseYear);

    // Straight Line
    const annualSL = (cost - salvage) / life;
    const slBookValue = Math.max(salvage, Math.round(cost - (annualSL * age)));

    // Double Declining
    const ddbRate = 2 / life;
    let ddbVal = cost;
    for (let i = 0; i < age; i++) {
      ddbVal = Math.max(salvage, ddbVal - (ddbVal * ddbRate));
    }
    const ddbBookValue = Math.round(ddbVal);

    return {
      ...a,
      ageYears: age,
      currentBookValue: method === 'straight' ? slBookValue : ddbBookValue,
      accumulatedDepreciation: method === 'straight' ? (cost - slBookValue) : (cost - ddbBookValue)
    };
  });

  const totalCost = assetCalculations.reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
  const totalBookValue = assetCalculations.reduce((sum, a) => sum + a.currentBookValue, 0);
  const totalAccumulated = totalCost - totalBookValue;

  const handleExport = () => {
    const headers = ['id', 'name', 'cost', 'salvageValue', 'usefulLifeYears', 'ageYears', 'currentBookValue', 'accumulatedDepreciation'];
    exportToCsv('AssetOrbit_Depreciation_Ledger', headers, assetCalculations);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6EFE8] text-[#315F50] dark:bg-indigo-950 dark:text-indigo-300 border border-[#A9C7B5]/40 dark:border-indigo-800 flex items-center space-x-1">
              <TrendingDown className="w-3.5 h-3.5 text-[#315F50]" />
              <span>Capital Asset Amortization</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Depreciation Calculator &amp; Net Book Value
          </h1>
          <p className="text-xs text-slate-500">
            Calculate straight-line and double-declining balance amortization across all college computing equipment.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setMethod('straight')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                method === 'straight' ? 'bg-white dark:bg-slate-700 text-[#315F50] shadow-sm' : 'text-slate-500'
              }`}
            >
              Straight-Line
            </button>
            <button
              onClick={() => setMethod('ddb')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                method === 'ddb' ? 'bg-white dark:bg-slate-700 text-[#315F50] shadow-sm' : 'text-slate-500'
              }`}
            >
              Double-Declining
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white shadow-sm hover:bg-slate-50"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Ledger</span>
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Capital Cost</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">${totalCost.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Current Net Book Value</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${totalBookValue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-rose-500">Cumulative Amortization</span>
          <p className="text-2xl font-black text-rose-500 mt-1">${totalAccumulated.toLocaleString()}</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">
          Asset Amortization Ledger ({assetCalculations.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Asset Tag</th>
                <th className="py-3 px-4">Model &amp; Lab</th>
                <th className="py-3 px-4">Purchase Cost</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4">Residual Salvage</th>
                <th className="py-3 px-4">Current Net Book Value</th>
                <th className="py-3 px-4">Total Amortized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assetCalculations.map(a => (
                <tr
                  key={a.id}
                  onClick={() => onSelectAsset && onSelectAsset(a)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-sky-600">{a.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{a.name}</span>
                    <p className="text-[10px] text-slate-400">{a.labRoom || a.subBranch}</p>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">${a.cost}</td>
                  <td className="py-3 px-4">{a.ageYears} Yrs</td>
                  <td className="py-3 px-4 font-mono">${a.salvageValue || 100}</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${a.currentBookValue}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    ${a.accumulatedDepreciation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
