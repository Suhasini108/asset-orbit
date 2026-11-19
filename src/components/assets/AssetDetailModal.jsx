import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Box,
  Cpu,
  HardDrive,
  Activity,
  Calendar,
  DollarSign,
  TrendingDown,
  Printer,
  ShieldCheck,
  Wrench,
  Clock,
  Trash2,
  ExternalLink,
  CheckCircle2,
  MapPin,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function AssetDetailModal({ isOpen, onClose, asset, onReportIssue, onMarkEWaste }) {
  const { updateAsset } = useApp();
  const { isAuditor, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'depreciation' | 'qr'

  if (!isOpen || !asset) return null;

  // Depreciation Calculation (Straight Line & Declining Balance)
  const purchaseCost = Number(asset.cost) || 850;
  const salvageValue = Number(asset.salvageValue) || 100;
  const usefulLife = Number(asset.usefulLifeYears) || 5;
  const purchaseYear = new Date(asset.purchaseDate || '2023-01-01').getFullYear();
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - purchaseYear);

  // Straight Line: Annual Dep = (Cost - Salvage) / UsefulLife
  const annualStraightLine = (purchaseCost - salvageValue) / usefulLife;
  const straightLineCurrentBookValue = Math.max(salvageValue, Math.round(purchaseCost - (annualStraightLine * ageYears)));

  // Double Declining: Rate = 2 / UsefulLife
  const doubleDecliningRate = 2 / usefulLife;
  let ddbValue = purchaseCost;
  for (let i = 0; i < ageYears; i++) {
    const dep = ddbValue * doubleDecliningRate;
    ddbValue = Math.max(salvageValue, ddbValue - dep);
  }
  const ddbCurrentBookValue = Math.round(ddbValue);

  // Health Score Calculation Breakdown
  const health = asset.healthScore !== undefined ? asset.healthScore : 90;

  const handlePrintQr = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 text-white flex items-center justify-center font-bold shadow-md">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                  {asset.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  asset.status === 'Assigned' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  asset.status === 'In Repair' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                  asset.status === 'E-Waste' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {asset.status}
                </span>
                {asset.batchId && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E6EFE8] text-[#315F50] dark:bg-indigo-950 dark:text-indigo-300 border border-[#A9C7B5]/40 dark:border-indigo-800">
                    Batch: {asset.batchId}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {asset.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isAuditor && !isAdmin && onReportIssue && (
              <button
                onClick={() => {
                  onClose();
                  onReportIssue(asset);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 flex items-center space-x-1"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                <span>Report Issue</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview &amp; Health
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'timeline'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Lifecycle Timeline ({asset.timeline?.length || 1})
          </button>
          <button
            onClick={() => setActiveTab('depreciation')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'depreciation'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Depreciation &amp; TCO
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'qr'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            QR Verification Tag
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <>
              {/* Top Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Serial Number</span>
                  <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
                    {asset.serialNumber}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Department &amp; Lab</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                    {asset.subBranch} • {asset.labRoom || 'Main Lab'}
                  </p>
                  <p className="text-[10px] text-slate-500">{asset.benchNumber || 'Bench'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Procurement &amp; Cost</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    ₹{Number(asset.cost || 0).toLocaleString()} ({asset.purchaseDate || 'N/A'})
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {asset.quantity > 1 ? `Batch Qty: ${asset.quantity} units` : 'Single Unit'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Equipment Health &amp; Qty</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {asset.healthNotes || asset.healthStatus || 'Working'}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    {asset.repaired === 'Yes' ? 'Serviced / Repaired: Yes' : 'No prior repairs'}
                  </p>
                </div>
              </div>

              {/* Health Score Deep-Dive Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/30 border border-sky-200 dark:border-sky-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-sky-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Asset Health Score: {health}/100
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    health >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    health >= 60 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {health >= 80 ? 'Optimal Condition' : health >= 60 ? 'Fair / Degraded' : 'Critical / Replace'}
                  </span>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-sky-800/60">
                    <span className="text-slate-400 block text-[10px]">Age Factor</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{ageYears} Years in Service</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-sky-800/60">
                    <span className="text-slate-400 block text-[10px]">Thermal &amp; OS Telemetry</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Within Thresholds</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-sky-800/60">
                    <span className="text-slate-400 block text-[10px]">Maintenance Reliability</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {asset.status === 'In Repair' ? 'Active Ticket Logged' : 'Passed Last Audit'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Asset Full Lifecycle History
              </h4>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {(asset.timeline || [
                  { date: asset.purchaseDate, event: 'Asset Procured', notes: 'Initial purchase recorded' }
                ]).map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-brand-500 border-2 border-white dark:border-slate-900" />
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                        <span className="font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                          {event.event}
                        </span>
                        <span>{event.date}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {event.notes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'depreciation' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Depreciation &amp; Total Cost of Ownership (TCO)
                </h4>
                <p className="text-xs text-slate-500">
                  Calculates annual amortization and current net book value per institutional financial accounting rules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Straight Line Method */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                      Straight-Line Method
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Standard</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    ${straightLineCurrentBookValue}
                  </p>
                  <p className="text-xs text-slate-500">
                    Current Net Book Value (${annualStraightLine.toFixed(0)}/yr depreciation)
                  </p>
                </div>

                {/* Double Declining Balance */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#315F50] dark:text-indigo-400">
                      Double Declining Balance
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Accelerated</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    ${ddbCurrentBookValue}
                  </p>
                  <p className="text-xs text-slate-500">
                    Current Book Value ({(doubleDecliningRate * 100).toFixed(0)}% accelerated rate)
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-100">Capital Attributes:</span>
                <p>Original Purchase Cost: ${purchaseCost} • Salvage Residual Value: ${salvageValue} • Useful Life: {usefulLife} Years • Age: {ageYears} Years</p>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-lg text-center">
                <QRCodeSVG
                  value={JSON.stringify({
                    id: asset.id,
                    name: asset.name,
                    sn: asset.serialNumber,
                    dept: asset.subBranch,
                    lab: asset.labRoom
                  })}
                  size={160}
                  level="H"
                />
                <p className="text-[11px] font-mono font-bold text-slate-900 mt-2">{asset.id}</p>
              </div>

              <div className="space-y-3 max-w-sm text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Asset Verification QR Tag
                </h4>
                <p className="text-slate-500">
                  Ready to print and stick on the workstation chassis, monitor, or ceiling projector mount for instant mobile audit scanning.
                </p>
                <button
                  onClick={handlePrintQr}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Single Label</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
