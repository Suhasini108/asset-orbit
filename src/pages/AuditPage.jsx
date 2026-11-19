import React, { useState } from 'react';
import {
  FileCheck2,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Download,
  RotateCcw,
  Check,
  Building,
  Monitor
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export default function AuditPage() {
  const { assets, categories } = useApp();
  const { currentUser, isAuditor } = useAuth();

  const [selectedLab, setSelectedLab] = useState('CSE Lab 1 (Turing)');
  const [scannedIds, setScannedIds] = useState(['AST-CSE-001', 'AST-CSE-002']);
  const [inputCode, setInputCode] = useState('');
  const [lastScannedMessage, setLastScannedMessage] = useState('');

  // Expected assets in this lab
  const expectedAssets = assets.filter(a => a.labRoom === selectedLab || (a.labRoom && a.labRoom.includes(selectedLab.split('(')[0].trim())));

  // Reconciled groups
  const verifiedAssets = expectedAssets.filter(a => scannedIds.includes(a.id));
  const missingAssets = expectedAssets.filter(a => !scannedIds.includes(a.id));

  // Misplaced: Scanned assets that belong to a DIFFERENT lab
  const misplacedAssets = scannedIds
    .map(id => assets.find(a => a.id === id))
    .filter(a => a && a.labRoom !== selectedLab && !a.labRoom?.includes(selectedLab.split('(')[0].trim()));

  const handleScanCode = (code) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const found = assets.find(a => a.id.toLowerCase() === trimmed.toLowerCase() || a.serialNumber.toLowerCase() === trimmed.toLowerCase());

    if (!found) {
      setLastScannedMessage(`⚠️ Unregistered Asset: "${trimmed}" not found in institutional database.`);
      return;
    }

    if (scannedIds.includes(found.id)) {
      setLastScannedMessage(`ℹ️ Asset ${found.id} already verified in this session.`);
      return;
    }

    setScannedIds(prev => [found.id, ...prev]);

    if (found.labRoom === selectedLab || found.labRoom?.includes(selectedLab.split('(')[0].trim())) {
      setLastScannedMessage(`✅ Verified: ${found.name} (${found.id}) matched to ${selectedLab}!`);
      try {
        confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
      } catch (e) {}
    } else {
      setLastScannedMessage(`🚨 Misplaced Asset Alert: ${found.name} belongs to ${found.labRoom}, but was found in ${selectedLab}!`);
    }

    setInputCode('');
  };

  const handleQuickScanNext = () => {
    // Pick the next unscanned expected asset for quick demo
    const nextUnscanned = missingAssets[0];
    if (nextUnscanned) {
      handleScanCode(nextUnscanned.id);
    } else {
      alert('All expected assets in this lab have been verified!');
    }
  };

  const handleSimulateMisplaced = () => {
    // Scan an asset from ECE into CSE
    const eceAsset = assets.find(a => a.subBranch === 'ECE');
    if (eceAsset) {
      handleScanCode(eceAsset.id);
    }
  };

  const completionPercent = expectedAssets.length > 0
    ? Math.round((verifiedAssets.length / expectedAssets.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6EFE8] text-[#315F50] dark:bg-indigo-950 dark:text-indigo-300 border border-[#A9C7B5]/40 dark:border-indigo-800 flex items-center space-x-1">
              <FileCheck2 className="w-3.5 h-3.5 text-[#315F50]" />
              <span>Physical Audit &amp; Barcode Reconciliation</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Physical Asset Audit Mode
          </h1>
          <p className="text-xs text-slate-500">
            Scan physical QR tags in campus departments and facilities to detect missing, misplaced, or phantom hardware with instant discrepancy reports.
          </p>
        </div>

        {/* Lab Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-500">Auditing Lab:</span>
          <select
            value={selectedLab}
            onChange={(e) => {
              setSelectedLab(e.target.value);
              setScannedIds([]);
              setLastScannedMessage('');
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="CSE Lab 1 (Turing)">CSE Lab 1 (Turing Systems - Room 301)</option>
            <option value="CSE Lab 2 (Lovelace)">CSE Lab 2 (Lovelace AI - Room 302)</option>
            <option value="ISE Lab 1 (Lovelace)">ISE Lab 1 (Network Security - Room 204)</option>
            <option value="ECE Lab 1 (DSP & VLSI)">ECE Lab 1 (DSP &amp; VLSI - Room 105)</option>
            <option value="Mech Lab 1 (CAD/CAM)">Mech Lab 1 (CAD/CAM - Room 008)</option>
          </select>
        </div>
      </div>

      {/* Audit Progress Bar Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Audit Progress: {selectedLab}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {verifiedAssets.length} of {expectedAssets.length} Verified ({completionPercent}%)
            </h3>
          </div>

          {/* Quick Demo Scan Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleQuickScanNext}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#315F50] hover:bg-[#244B3E] text-white shadow-md shadow-[#315F50]/20 flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Next Scan</span>
            </button>
            <button
              onClick={handleSimulateMisplaced}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
            >
              Test Misplaced Scan
            </button>
            <button
              onClick={() => { setScannedIds([]); setLastScannedMessage(''); }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
              title="Reset audit"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-[#315F50] rounded-full transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        {/* Manual Barcode / Scanner Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleScanCode(inputCode); }}
          className="flex items-center space-x-2 pt-2"
        >
          <div className="relative flex-1">
            <ScanLine className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Scan QR or enter Tag / Serial (e.g. AST-CSE-003)"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
          >
            Audit Tag
          </button>
        </form>

        {lastScannedMessage && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200">
            {lastScannedMessage}
          </div>
        )}
      </div>

      {/* Discrepancy Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verified Column */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified in Lab ({verifiedAssets.length})</span>
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {verifiedAssets.map(a => (
              <div key={a.id} className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block truncate">{a.name}</span>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">{a.id} • {a.benchNumber}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Column */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-rose-500 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Missing from Bench ({missingAssets.length})</span>
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {missingAssets.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">All assets verified!</p>
            ) : (
              missingAssets.map(a => (
                <div key={a.id} className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block truncate">{a.name}</span>
                  <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400">{a.id} • {a.benchNumber}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Misplaced Column */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-amber-500 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Misplaced Assets Found ({misplacedAssets.length})</span>
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {misplacedAssets.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No misplaced assets scanned</p>
            ) : (
              misplacedAssets.map(a => (
                <div key={a.id} className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block truncate">{a.name}</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 block">
                    Belongs to: {a.labRoom} ({a.subBranch})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
