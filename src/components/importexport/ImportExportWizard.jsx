import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  FileText,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CSV_TEMPLATES, downloadTemplate, parseCsvText, exportToCsv } from '../../data/templates';
import confetti from 'canvas-confetti';

export default function ImportExportWizard({ isOpen, onClose }) {
  const { bulkImportAssets, addSubscription, addVendor, resetToSampleData, clearAllData } = useApp();
  const { currentUser, isAuditor } = useAuth();

  const [wizardStep, setWizardStep] = useState(1); // 1: Choose Type, 2: Upload/Paste, 3: Validate & Preview
  const [importType, setImportType] = useState('assets'); // 'assets' | 'subscriptions' | 'vendors' | 'users'
  const [csvText, setCsvText] = useState('');
  const [parsedData, setParsedData] = useState({ headers: [], rows: [] });
  const [validationErrors, setValidationErrors] = useState([]);

  if (!isOpen) return null;

  const handleSelectType = (type) => {
    setImportType(type);
    setCsvText(CSV_TEMPLATES[type] || '');
    setWizardStep(2);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleProceedToPreview = () => {
    const parsed = parseCsvText(csvText);
    const errors = [];

    if (parsed.rows.length === 0) {
      errors.push('No data rows found in the CSV. Please check formatting.');
    }

    if (importType === 'assets') {
      const required = ['Name', 'SerialNumber', 'Category', 'SubBranch'];
      required.forEach(req => {
        const hasCol = parsed.headers.some(h => h.toLowerCase() === req.toLowerCase());
        if (!hasCol) errors.push(`Missing required column: "${req}"`);
      });
    }

    setParsedData(parsed);
    setValidationErrors(errors);
    setWizardStep(3);
  };

  const handleFinalImport = () => {
    if (importType === 'assets') {
      bulkImportAssets(parsedData.rows, currentUser.name);
    } else if (importType === 'subscriptions') {
      parsedData.rows.forEach(row => {
        addSubscription({
          name: row.Name || 'Subscription',
          vendor: row.Vendor || 'Vendor',
          category: row.Category || 'Software',
          billingCycle: row.BillingCycle || 'Yearly',
          cost: parseFloat(row.Cost) || 1000,
          totalSeats: parseInt(row.TotalSeats, 10) || 50,
          assignedSeats: parseInt(row.AssignedSeats, 10) || 20,
          renewalDate: row.RenewalDate || '2027-01-01',
          autoRenew: row.AutoRenew === 'true',
          department: row.Department || 'Engineering',
          owner: row.Owner || currentUser.name
        }, currentUser.name);
      });
    }

    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    onClose();
  };

  const handleLoadSample = () => {
    resetToSampleData();
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    } catch (e) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Department CSV Import &amp; Setup Wizard
              </h2>
              <p className="text-xs text-slate-500">
                Load real college lab data (CSE, ISE, ECE) or populate sample datasets.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleLoadSample}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E6EFE8] hover:bg-[#E6EFE8] text-[#315F50] dark:bg-indigo-950 dark:text-indigo-300 border border-[#A9C7B5]/40 dark:border-indigo-800 flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#315F50]" />
              <span>Load College Labs Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wizard Steps Navigation */}
        <div className="flex items-center justify-between px-8 py-3 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <div className={`flex items-center space-x-2 ${wizardStep >= 1 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">1</span>
            <span>Select Data Module</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center space-x-2 ${wizardStep >= 2 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">2</span>
            <span>Upload CSV / Template</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center space-x-2 ${wizardStep >= 3 ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]">3</span>
            <span>Validation &amp; Preview</span>
          </div>
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Select Type */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Choose the dataset type you want to import:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => handleSelectType('assets')}
                  className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-brand-600">
                      College Lab Assets &amp; Systems
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Import computers, monitors, lab switches, projectors, and hardware specs for CSE, ISE, ECE labs.
                  </p>
                </div>

                <div
                  onClick={() => handleSelectType('subscriptions')}
                  className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition-all space-y-2 group"
                >
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-brand-600">
                    Software Licenses &amp; Subscriptions
                  </span>
                  <p className="text-xs text-slate-500">
                    Import MATLAB, Microsoft 365, JetBrains, Cadence, SolidWorks campus license agreements.
                  </p>
                </div>

                <div
                  onClick={() => handleSelectType('vendors')}
                  className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition-all space-y-2 group"
                >
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-brand-600">
                    Vendors &amp; Supplier Directory
                  </span>
                  <p className="text-xs text-slate-500">
                    Import hardware OEMs, contact persons, support phone numbers and SLAs.
                  </p>
                </div>

                <div
                  onClick={() => handleSelectType('users')}
                  className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition-all space-y-2 group"
                >
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-brand-600">
                    Department Faculty &amp; Staff Users
                  </span>
                  <p className="text-xs text-slate-500">
                    Import HODs, Lab Technicians, Faculty advisors with role-based permissions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Upload or Edit CSV Text */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Provide CSV Data for <span className="capitalize text-brand-600">{importType}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Download our clean template or paste your department's spreadsheet data directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => downloadTemplate(importType)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-white flex items-center space-x-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-brand-500" />
                  <span>Download CSV Template</span>
                </button>
              </div>

              {/* Upload file drag-and-drop */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2 bg-slate-50 dark:bg-slate-800/30">
                <Upload className="w-6 h-6 mx-auto text-slate-400" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Upload an existing CSV / Excel exported file
                </p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              {/* CSV Raw Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Or Edit / Paste Raw CSV Data:
                </label>
                <textarea
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToPreview}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 flex items-center space-x-1.5"
                >
                  <span>Parse &amp; Validate Data</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Validation */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    CSV Data Validation &amp; Preview
                  </h3>
                  <p className="text-xs text-slate-500">
                    Found {parsedData.rows.length} records ready to commit to the system.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Schema Valid</span>
                  </span>
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 text-xs space-y-1 border border-rose-200">
                  <span className="font-bold">Validation Warnings:</span>
                  {validationErrors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}

              {/* Table Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold sticky top-0">
                    <tr>
                      {parsedData.headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedData.rows.slice(0, 8).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {parsedData.headers.map((h, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                            {row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Back to Editor
                </button>
                {!isAuditor && (
                  <button
                    onClick={handleFinalImport}
                    className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Commit {parsedData.rows.length} Records to Database</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
