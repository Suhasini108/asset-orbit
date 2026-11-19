import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Download, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BatchPrintQrModal({ isOpen, onClose, preselectedAssets = null }) {
  const { assets } = useApp();
  const [selectedDept, setSelectedDept] = useState('all');

  if (!isOpen) return null;

  const assetList = preselectedAssets || (selectedDept === 'all'
    ? assets
    : assets.filter(a => a.subBranch === selectedDept || a.category === selectedDept));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 no-print">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Printable Asset QR Label Sheet
            </h2>
            <p className="text-xs text-slate-500">
              A4 Sticker Sheet layout (2x4 / 3x6 format) with barcode verification tags for physical lab equipment.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="all">All Departments ({assets.length} assets)</option>
              <option value="CSE">CSE Dept</option>
              <option value="ISE">ISE Dept</option>
              <option value="ECE">ECE Dept</option>
              <option value="Mechanical">Mechanical Dept</option>
            </select>

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Sheet</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Grid */}
        <div className="p-8 max-h-[75vh] overflow-y-auto bg-slate-100 dark:bg-slate-950">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetList.map((asset) => (
              <div
                key={asset.id}
                className="p-4 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex items-center space-x-4 shadow-sm page-break-inside-avoid"
              >
                {/* QR Code Container */}
                <div className="p-2 bg-white rounded-xl border border-slate-200 flex-shrink-0 shadow-inner">
                  <QRCodeSVG
                    value={JSON.stringify({
                      id: asset.id,
                      name: asset.name,
                      sn: asset.serialNumber,
                      dept: asset.subBranch,
                      lab: asset.labRoom,
                      bench: asset.benchNumber
                    })}
                    size={80}
                    level="M"
                  />
                </div>

                {/* Tag Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      AssetOrbit ITAM
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">
                      {asset.subBranch || 'General'}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                    {asset.name}
                  </h4>
                  <p className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400">
                    {asset.id}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    SN: {asset.serialNumber}
                  </p>
                  <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span className="font-medium truncate">{asset.labRoom || 'Main Lab'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap ml-1">
                      {asset.benchNumber || 'Bench'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
